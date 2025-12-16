import { useState, useRef, useCallback, useEffect } from 'react';
import { SimulationConfig, SimulationType } from '@/types/simulation';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

interface UseRealtimeVoiceOptions {
  config: SimulationConfig;
  simulationType: SimulationType;
  conversationId: string | null;
  onConversationIdChange?: (id: string) => void;
}

export function useRealtimeVoice({
  config,
  simulationType,
  conversationId,
  onConversationIdChange,
}: UseRealtimeVoiceOptions) {
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  // Convert Float32 audio data to base64 PCM16
  const encodeAudioToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  };

  // Create WAV from PCM data for playback
  const createWavFromPCM = (pcmData: Uint8Array): ArrayBuffer => {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = int16Data.byteLength;

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray.buffer;
  };

  // Play audio queue
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;
    setStatus('speaking');
    
    const audioData = audioQueueRef.current.shift()!;
    
    try {
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        isPlayingRef.current = false;
        if (audioQueueRef.current.length > 0) {
          playNextAudio();
        } else {
          setStatus('listening');
        }
      };
      
      source.start(0);
    } catch (err) {
      console.error('Error playing audio:', err);
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        playNextAudio();
      } else {
        setStatus('listening');
      }
    }
  }, []);

  // Start realtime connection
  const connect = useCallback(async () => {
    if (wsRef.current) {
      cleanup();
    }

    setStatus('connecting');
    setError(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Build WebSocket URL
      const wsProtocol = config.apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = config.apiBaseUrl.replace(/^https?:\/\//, '');
      const params = new URLSearchParams({
        user_application_id: config.myUserId,
        counterpart_user_id: config.counterpartUserId,
        simulation_type: simulationType,
        ...(conversationId && { conversation_id: conversationId }),
      });
      
      const wsUrl = `${wsProtocol}://${baseUrl}/chatbot/api/v1/simulation/ws/chat?${params}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('listening');
        
        // Start capturing audio
        const source = audioContextRef.current!.createMediaStreamSource(stream);
        const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && status !== 'speaking') {
            const inputData = e.inputBuffer.getChannelData(0);
            const base64Audio = encodeAudioToBase64(new Float32Array(inputData));
            
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio,
            }));
          }
        };
        
        source.connect(processor);
        processor.connect(audioContextRef.current!.destination);
        
        sourceRef.current = source;
        processorRef.current = processor;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WS message type:', data.type);
          
          // Handle conversation ID from session
          if (data.type === 'session.created' && data.session?.id) {
            onConversationIdChange?.(data.session.id);
          }
          
          // Handle audio delta
          if (data.type === 'response.audio.delta' && data.delta) {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            audioQueueRef.current.push(bytes);
            playNextAudio();
          }
          
          // Handle response done
          if (data.type === 'response.done') {
            if (audioQueueRef.current.length === 0 && !isPlayingRef.current) {
              setStatus('listening');
            }
          }
          
          // Handle errors
          if (data.type === 'error') {
            console.error('Realtime API error:', data.error);
            setError(data.error?.message || 'Unknown error');
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (status !== 'idle') {
          setStatus('idle');
        }
      };

    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
      cleanup();
    }
  }, [config, simulationType, conversationId, onConversationIdChange, cleanup, playNextAudio, status]);

  // Disconnect
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('idle');
    setError(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    error,
    isConnected: status !== 'idle' && status !== 'error' && status !== 'connecting',
    connect,
    disconnect,
  };
}
