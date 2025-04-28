import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertChallengeSchema, insertProgressEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get all challenges (separated by active and completed)
  apiRouter.get("/challenges", async (req, res) => {
    try {
      const challenges = await storage.getActiveAndCompletedChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
  
  // Get a specific challenge by ID
  apiRouter.get("/challenges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await storage.getChallengeById(id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      const participants = await storage.getParticipantsByChallenge(id);
      
      res.json({
        ...challenge,
        participants
      });
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });
  
  // Create a new challenge
  apiRouter.post("/challenges", async (req, res) => {
    try {
      const validatedData = insertChallengeSchema.parse(req.body);
      
      // Create the challenge
      const challenge = await storage.createChallenge(validatedData);
      
      // Add participants
      if (req.body.participants && Array.isArray(req.body.participants)) {
        for (const userId of req.body.participants) {
          await storage.addParticipantToChallenge({
            userId,
            challengeId: challenge.id
          });
        }
      }
      
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid challenge data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });
  
  // Update challenge completion status
  apiRouter.patch("/challenges/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const { isCompleted } = req.body;
      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({ message: "isCompleted must be a boolean" });
      }
      
      const challenge = await storage.updateChallengeStatus(id, isCompleted);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Error updating challenge status:", error);
      res.status(500).json({ message: "Failed to update challenge status" });
    }
  });
  
  // Add progress to a participant
  apiRouter.post("/progress", async (req, res) => {
    try {
      const validatedData = insertProgressEntrySchema.parse(req.body);
      
      // Get participant
      const participant = await storage.getParticipantById(validatedData.participantId);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Add progress entry
      const entry = await storage.addProgressEntry(validatedData);
      
      // Get updated participant with new progress
      const updatedParticipant = await storage.getParticipantById(validatedData.participantId);
      
      res.status(201).json({
        entry,
        participant: updatedParticipant
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid progress data", 
          errors: error.errors 
        });
      }
      
      console.error("Error adding progress:", error);
      res.status(500).json({ message: "Failed to add progress" });
    }
  });
  
  // Get participants for a challenge
  apiRouter.get("/challenges/:id/participants", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const participants = await storage.getParticipantsByChallenge(id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });
  
  // Get progress entries for a participant
  apiRouter.get("/participants/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      
      const entries = await storage.getProgressEntriesByParticipant(id);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching progress entries:", error);
      res.status(500).json({ message: "Failed to fetch progress entries" });
    }
  });
  
  // Get all users
  apiRouter.get("/users", async (req, res) => {
    try {
      const users = [];
      for (let i = 1; i <= 10; i++) {
        const user = await storage.getUser(i);
        if (user) users.push(user);
      }
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
