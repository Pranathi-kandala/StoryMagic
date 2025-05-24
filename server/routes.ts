import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStory } from "./lib/openai";
import { insertStorySchema, insertParentalSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate a new story
  app.post("/api/stories/generate", async (req, res) => {
    try {
      console.log("Request body received:", req.body);
      
      const character = req.body?.character;
      const storyType = req.body?.storyType;
      const userPrompt = req.body?.userPrompt || "";
      
      console.log("Parsed values:", { character, storyType, userPrompt });
      
      if (!character || !storyType) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Character and story type are required" });
      }
      
      console.log("Generating story...");
      // Generate story using OpenAI or fallback
      const storyResult = await generateStory(character, storyType, userPrompt);
      console.log("Story generated:", storyResult);
      
      // Save the generated story
      const story = await storage.createStory({
        title: storyResult.title,
        content: storyResult.content,
        character: character,
        storyType: storyType,
        userPrompt: userPrompt || null,
        imageUrl: storyResult.imageUrl || null,
        isSaved: false,
      });
      
      console.log("Story saved:", story);
      res.json(story);
    } catch (error) {
      console.error("Complete error generating story:", error);
      res.status(500).json({ message: "Failed to generate story", error: error.message });
    }
  });

  // Get all stories
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Save/unsave a story
  app.patch("/api/stories/:id/save", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.toggleStorySaved(storyId);
      res.json(story);
    } catch (error) {
      console.error("Error saving story:", error);
      res.status(500).json({ message: "Failed to save story" });
    }
  });

  // Get parental settings
  app.get("/api/parental-settings", async (req, res) => {
    try {
      const settings = await storage.getParentalSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching parental settings:", error);
      res.status(500).json({ message: "Failed to fetch parental settings" });
    }
  });

  // Update parental settings
  app.post("/api/parental-settings", async (req, res) => {
    try {
      const settingsData = insertParentalSettingsSchema.parse(req.body);
      const settings = await storage.updateParentalSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating parental settings:", error);
      res.status(500).json({ message: "Failed to update parental settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
