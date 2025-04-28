import { 
  users, type User, type InsertUser,
  challenges, type Challenge, type InsertChallenge,
  participants, type Participant, type InsertParticipant,
  progressEntries, type ProgressEntry, type InsertProgressEntry,
  type ChallengeWithParticipants
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Challenge methods
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallenges(): Promise<Challenge[]>;
  getActiveAndCompletedChallenges(): Promise<{ active: ChallengeWithParticipants[], completed: ChallengeWithParticipants[] }>;
  updateChallengeStatus(id: number, isCompleted: boolean): Promise<Challenge | undefined>;
  
  // Participant methods
  addParticipantToChallenge(participant: InsertParticipant): Promise<Participant>;
  getParticipantById(id: number): Promise<Participant | undefined>;
  getParticipantsByChallenge(challengeId: number): Promise<(Participant & { user: User })[]>;
  updateParticipantProgress(id: number, value: number): Promise<Participant | undefined>;
  
  // Progress methods
  addProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getProgressEntriesByParticipant(participantId: number): Promise<ProgressEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private participants: Map<number, Participant>;
  private progressEntries: Map<number, ProgressEntry>;
  private userId: number;
  private challengeId: number;
  private participantId: number;
  private progressEntryId: number;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.participants = new Map();
    this.progressEntries = new Map();
    this.userId = 1;
    this.challengeId = 1;
    this.participantId = 1;
    this.progressEntryId = 1;
    
    // Add some seed data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Challenge methods
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const challenge: Challenge = { 
      ...insertChallenge, 
      id,
      isCompleted: 0,
      createdAt: new Date()
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getActiveAndCompletedChallenges(): Promise<{ active: ChallengeWithParticipants[], completed: ChallengeWithParticipants[] }> {
    const challenges = Array.from(this.challenges.values());
    const result: { active: ChallengeWithParticipants[], completed: ChallengeWithParticipants[] } = {
      active: [],
      completed: []
    };

    for (const challenge of challenges) {
      const participants = await this.getParticipantsByChallenge(challenge.id);
      const challengeWithParticipants = {
        ...challenge,
        participants
      };

      if (challenge.isCompleted === 1) {
        result.completed.push(challengeWithParticipants);
      } else {
        result.active.push(challengeWithParticipants);
      }
    }

    return result;
  }

  async updateChallengeStatus(id: number, isCompleted: boolean): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;

    const updatedChallenge = {
      ...challenge,
      isCompleted: isCompleted ? 1 : 0
    };

    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  // Participant methods
  async addParticipantToChallenge(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantId++;
    const participant: Participant = {
      ...insertParticipant,
      id,
      currentValue: 0,
      lastUpdated: new Date()
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipantById(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByChallenge(challengeId: number): Promise<(Participant & { user: User })[]> {
    const participantsArray = Array.from(this.participants.values()).filter(
      (participant) => participant.challengeId === challengeId
    );

    return Promise.all(
      participantsArray.map(async (participant) => {
        const user = await this.getUser(participant.userId);
        return {
          ...participant,
          user: user!
        };
      })
    );
  }

  async updateParticipantProgress(id: number, value: number): Promise<Participant | undefined> {
    const participant = this.participants.get(id);
    if (!participant) return undefined;

    const updatedParticipant = {
      ...participant,
      currentValue: participant.currentValue + value,
      lastUpdated: new Date()
    };

    this.participants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  // Progress methods
  async addProgressEntry(insertEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const id = this.progressEntryId++;
    const entry: ProgressEntry = {
      ...insertEntry,
      id,
      createdAt: new Date()
    };
    this.progressEntries.set(id, entry);
    
    // Also update the participant's current value
    const participant = await this.getParticipantById(entry.participantId);
    if (participant) {
      await this.updateParticipantProgress(participant.id, entry.value);
    }
    
    return entry;
  }

  async getProgressEntriesByParticipant(participantId: number): Promise<ProgressEntry[]> {
    return Array.from(this.progressEntries.values()).filter(
      (entry) => entry.participantId === participantId
    );
  }

  // Seed method to add initial data
  private async seedData() {
    // Create users
    const user1 = await this.createUser({ username: "Bro", password: "password", avatarColor: "#3b82f6" });
    const user2 = await this.createUser({ username: "Jonas Hendel", password: "password", avatarColor: "#22c55e" });
    const user3 = await this.createUser({ username: "Bro 1", password: "password", avatarColor: "#ec4899" });
    const user4 = await this.createUser({ username: "Bro 3", password: "password", avatarColor: "#8b5cf6" });

    // Create a study challenge
    const studyChallenge = await this.createChallenge({
      title: "Study for 712 hours",
      targetValue: 712,
      unit: "hours",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31")
    });

    // Add participants to the study challenge
    const participant1 = await this.addParticipantToChallenge({ userId: user1.id, challengeId: studyChallenge.id });
    const participant2 = await this.addParticipantToChallenge({ userId: user2.id, challengeId: studyChallenge.id });
    const participant3 = await this.addParticipantToChallenge({ userId: user3.id, challengeId: studyChallenge.id });
    const participant4 = await this.addParticipantToChallenge({ userId: user4.id, challengeId: studyChallenge.id });

    // Add progress entries
    await this.addProgressEntry({ participantId: participant1.id, value: 730, date: new Date(), notes: "Initial progress" });
    await this.addProgressEntry({ participantId: participant2.id, value: 726, date: new Date(), notes: "Initial progress" });
    await this.addProgressEntry({ participantId: participant3.id, value: 720, date: new Date(), notes: "Initial progress" });
    await this.addProgressEntry({ participantId: participant4.id, value: 713, date: new Date(), notes: "Initial progress" });

    // Create a reading challenge
    const readingChallenge = await this.createChallenge({
      title: "Read 24 books",
      targetValue: 24,
      unit: "books",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-12-31")
    });

    // Create users for reading challenge
    const user5 = await this.createUser({ username: "Me", password: "password", avatarColor: "#3b82f6" });
    const user6 = await this.createUser({ username: "Alex", password: "password", avatarColor: "#8b5cf6" });
    const user7 = await this.createUser({ username: "Sarah", password: "password", avatarColor: "#22c55e" });

    // Add participants to the reading challenge
    const participant5 = await this.addParticipantToChallenge({ userId: user5.id, challengeId: readingChallenge.id });
    const participant6 = await this.addParticipantToChallenge({ userId: user6.id, challengeId: readingChallenge.id });
    const participant7 = await this.addParticipantToChallenge({ userId: user7.id, challengeId: readingChallenge.id });

    // Add progress entries
    await this.addProgressEntry({ participantId: participant5.id, value: 18, date: new Date(), notes: "Initial progress" });
    await this.addProgressEntry({ participantId: participant6.id, value: 14, date: new Date(), notes: "Initial progress" });
    await this.addProgressEntry({ participantId: participant7.id, value: 21, date: new Date(), notes: "Initial progress" });

    // Create a completed workout challenge
    const workoutChallenge = await this.createChallenge({
      title: "Workout 150 days",
      targetValue: 150,
      unit: "days",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-31")
    });
    
    // Mark as completed
    await this.updateChallengeStatus(workoutChallenge.id, true);

    // Add participants to the workout challenge
    const participant8 = await this.addParticipantToChallenge({ userId: user5.id, challengeId: workoutChallenge.id });
    const participant9 = await this.addParticipantToChallenge({ userId: user6.id, challengeId: workoutChallenge.id });

    // Add progress entries
    await this.addProgressEntry({ participantId: participant8.id, value: 168, date: new Date("2023-12-25"), notes: "Completed" });
    await this.addProgressEntry({ participantId: participant9.id, value: 147, date: new Date("2023-12-25"), notes: "Almost there" });
  }
}

export const storage = new MemStorage();
