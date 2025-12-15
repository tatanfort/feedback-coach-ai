import { SimulationConfig, SimulationType, SimulationChatResponse, AnalysisResult } from '@/types/simulation';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, config: SimulationConfig, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, `API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function sendSimulationMessage(
  config: SimulationConfig,
  message: string,
  simulationType: SimulationType,
  conversationId: string | null
): Promise<SimulationChatResponse> {
  const url = `${config.apiBaseUrl}/chatbot/api/v1/simulation/chat`;
  
  return fetchWithAuth(url, config, {
    method: 'POST',
    body: JSON.stringify({
      user_application_id: config.myUserId,
      counterpart_user_id: config.counterpartUserId,
      message,
      simulation_type: simulationType,
      conversation_id: conversationId,
    }),
  });
}

export interface AudioSimulationResponse {
  conversationId: string;
  audioBlob: Blob;
}

export async function sendSimulationAudio(
  config: SimulationConfig,
  audioBlob: Blob,
  simulationType: SimulationType,
  conversationId: string | null
): Promise<AudioSimulationResponse> {
  const url = `${config.apiBaseUrl}/chatbot/api/v1/simulation/chat`;
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('user_application_id', config.myUserId);
  formData.append('counterpart_user_id', config.counterpartUserId);
  formData.append('simulation_type', simulationType);
  if (conversationId) {
    formData.append('conversation_id', conversationId);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': config.apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, `API Error (${response.status}): ${errorText}`);
  }

  const newConversationId = response.headers.get('X-Conversation-Id') || conversationId || '';
  const audioResponseBlob = await response.blob();

  return {
    conversationId: newConversationId,
    audioBlob: audioResponseBlob,
  };
}

export async function analyzeSimulation(
  config: SimulationConfig,
  conversationId: string
): Promise<AnalysisResult> {
  const url = `${config.apiBaseUrl}/chatbot/api/v1/simulation/analyze`;
  
  return fetchWithAuth(url, config, {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: conversationId,
    }),
  });
}

export async function sendClassicChatMessage(
  config: SimulationConfig,
  message: string,
  userConversationId: string
): Promise<{ message: string }> {
  const url = `${config.apiBaseUrl}/chatbot/api/v2/chat`;
  
  return fetchWithAuth(url, config, {
    method: 'POST',
    body: JSON.stringify({
      userApplicationId: config.myUserId,
      userConversationId,
      messageApplicationId: crypto.randomUUID(),
      sender: 'user',
      type: 'text',
      message,
      locale: 'fr',
      data: {},
    }),
  });
}
