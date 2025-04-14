export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WordList {
  id: string;
  name: string;
  description: string;
  context?: string;
  source?: string;
  language?: string;
  createdAt: string;
  wordCount: number;
  progress: number;
}

export interface Word {
  id: string;
  listId: string;
  value: string;
  meaning: string;
  context?: string;
  createdAt: string;
  imageUrl?: string;
  pronunciationUrl?: string;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'match' | 'write';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Test {
  id: string;
  listId: string;
  exercises: Exercise[];
  timeLimit?: number;
  createdAt: string;
}

export interface Progress {
  userId: string;
  listId: string;
  wordId?: string;
  score: number;
  lastPracticed: string;
  streak: number;
  masteryLevel: number; // 0-5 scale
}

export interface ProgressStats {
  summary: {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    averageScore: number;
    currentStreak: number;
    bestStreak: number;
  };
  daily: {
    dates: string[];
    learningScores: number[];
    testScores: number[];
  };
  listProgress: {
    id: string;
    name: string;
    progress: number;
  }[];
  wordStats: {
    status: string;
    count: number;
  }[];
  recommendedLists: {
    id: string;
    name: string;
    wordCount: number;
    progress: number;
    reason: string;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }[];
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultLanguage: string;
  sessionLength: number;
  autoPlayPronunciation: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  Lists: undefined;
  CreateList: undefined;
  AddWord: { listId: string };
  ListDetails: { listId: string };
  Learning: { listId: string };
  Test: { listId: string };
  Progress: undefined;
  Search: undefined;
  Settings: undefined;
  CameraScan: undefined;
  VoiceCommands: undefined;
};
