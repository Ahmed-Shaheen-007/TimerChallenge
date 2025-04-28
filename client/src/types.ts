export interface User {
  id: number;
  username: string;
  avatarColor: string;
}

export interface Challenge {
  id: number;
  title: string;
  targetValue: number;
  unit: string;
  startDate: string | Date;
  endDate: string | Date;
  isCompleted: number;
  createdAt: string | Date;
}

export interface Participant {
  id: number;
  userId: number;
  challengeId: number;
  currentValue: number;
  lastUpdated: string | Date;
  user: User;
}

export interface ChallengeWithParticipants extends Challenge {
  participants: Participant[];
}

export interface ProgressEntry {
  id: number;
  participantId: number;
  value: number;
  date: string | Date;
  notes?: string;
  createdAt: string | Date;
}

export interface AddProgressFormData {
  value: number;
  date: string;
  notes?: string;
}

export interface NewChallengeFormData {
  title: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number[];
}
