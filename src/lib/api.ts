import { SimulationConfig, SimulationType, SimulationChatResponse, AnalysisResult, SimulationScenario } from '@/types/simulation';

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
  conversationId: string | null,
  scenario: SimulationScenario | null
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
      context: scenario || undefined,
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
  conversationId: string | null,
  scenario: SimulationScenario | null
): Promise<AudioSimulationResponse> {
  const url = `${config.apiBaseUrl}/chatbot/api/v1/simulation/chat`;
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  
  const payload = {
    user_application_id: config.myUserId,
    counterpart_user_id: config.counterpartUserId,
    simulation_type: simulationType,
    conversation_id: conversationId,
    context: scenario || undefined,
  };
  formData.append('payload', JSON.stringify(payload));

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
  conversationId: string,
  simulationType: SimulationType,
  scenario: SimulationScenario | null
): Promise<AnalysisResult> {
  const url = `${config.apiBaseUrl}/chatbot/api/v1/simulation/analyze`;
  
  return fetchWithAuth(url, config, {
    method: 'POST',
    body: JSON.stringify({
      user_application_id: config.myUserId,
      simulation_type: simulationType,
      conversation_id: conversationId,
      context: scenario || undefined,
    }),
  });
}

export async function sendClassicChatMessage(
  config: SimulationConfig,
  message: string,
  userConversationId: string,
  socraticTutoring: boolean = false
): Promise<{ message: string }> {
  const url = `${config.apiBaseUrl}/chatbot/api/v2/chat`;
  
  const payload: Record<string, any> = {
    userApplicationId: config.myUserId,
    userConversationId,
    messageApplicationId: crypto.randomUUID(),
    sender: 'user',
    type: 'text',
    message,
    locale: 'fr',
    data: {},
  };

  if (socraticTutoring) {
    payload.socratic_tutoring = true;
  }

  return fetchWithAuth(url, config, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendClassicChatAudio(
  config: SimulationConfig,
  audioBlob: Blob,
  userConversationId: string,
  socraticTutoring: boolean = false
): Promise<{ message: string }> {
  const url = `${config.apiBaseUrl}/chatbot/api/v2/chat`;
  
  const formData = new FormData();
  
  // Append the audio file
  formData.append('file', audioBlob, 'voice_message.webm');
  
  // Append the JSON payload
  const chatPayload: Record<string, any> = {
    userApplicationId: config.myUserId,
    userConversationId,
    messageApplicationId: crypto.randomUUID(),
    sender: 'user',
    type: 'text',
    message: '', // Empty, will be filled by transcription
    locale: 'fr',
    data: {},
  };

  if (socraticTutoring) {
    chatPayload.socratic_tutoring = true;
  }
  
  formData.append('payload', JSON.stringify(chatPayload));

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

  return response.json();
}
