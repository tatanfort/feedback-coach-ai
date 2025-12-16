export type SimulationMode = 'simulation' | 'analysis' | 'chat' | 'realtime';

export type SimulationType = 
  | 'manager_feedback' 
  | 'peer_feedback' 
  | 'sales_simulation' 
  | 'interview_simulation';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string; // URL for audio playback (assistant responses)
  isAudioMessage?: boolean; // Whether this was sent as audio
}

export interface SimulationConfig {
  apiBaseUrl: string;
  apiKey: string;
  myUserId: string;
  counterpartUserId: string;
}

export interface SimulationChatResponse {
  conversation_id: string;
  message: string;
  simulation_type: string;
  is_simulation: boolean;
}

export interface AnalysisScores {
  clarity_of_feedback: number;
  balance: number;
  specificity: number;
  empathy_and_tone: number;
  two_way_dialogue: number;
  actionable_guidance: number;
}

export interface KeyMoment {
  moment: string;
  feedback: string;
}

export interface AnalysisResult {
  conversation_id: string;
  simulation_type: string;
  summary: string;
  overall_score: number;
  scores: AnalysisScores;
  strengths: string[];
  areas_for_improvement: string[];
  actionable_tips: string[];
  key_moments: KeyMoment[];
}

export interface ConversationState {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
}
