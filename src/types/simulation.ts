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
  audioUrl?: string;
  isAudioMessage?: boolean;
}

export interface SimulationConfig {
  apiBaseUrl: string;
  apiKey: string;
  myUserId: string;
  counterpartUserId: string;
}

export interface EvaluationCriterion {
  criterion: string;
  description: string;
}

export interface SimulationContact {
  name?: string;
  role?: string;
  department?: string;
  personality?: string;
  [key: string]: any;
}

export interface SimulationScenario {
  simulation_id: string;
  title_simulation: string;
  contact: SimulationContact;
  context: string;
  objectives: string[];
  evaluation_criteria: EvaluationCriterion[];
}

export interface SimulationChatResponse {
  conversation_id: string;
  message: string;
  simulation_type: string;
  is_simulation: boolean;
}

// Dynamic scores - keys vary by simulation type
export type AnalysisScores = Record<string, number>;

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
  simulationScenario: SimulationScenario | null;
}
