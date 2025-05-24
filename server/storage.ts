import { 
  users, 
  stories, 
  parentalSettings,
  type User, 
  type InsertUser,
  type Story,
  type InsertStory,
  type ParentalSettings,
  type InsertParentalSettings
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createStory(story: InsertStory): Promise<Story>;
  getAllStories(): Promise<Story[]>;
  getStoryById(id: number): Promise<Story | undefined>;
  toggleStorySaved(id: number): Promise<Story | undefined>;
  getParentalSettings(): Promise<ParentalSettings>;
  updateParentalSettings(settings: InsertParentalSettings): Promise<ParentalSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private parentalSettings: ParentalSettings;
  private currentUserId: number;
  private currentStoryId: number;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.currentUserId = 1;
    this.currentStoryId = 1;
    
    // Default parental settings
    this.parentalSettings = {
      id: 1,
      ageGroup: "6-8 years",
      dailyTimeLimit: 60,
      storiesPerDay: 5,
      allowedThemes: ['fairy-tale', 'adventure', 'friendship', 'animals', 'space', 'mystery'],
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const story: Story = { 
      ...insertStory, 
      id,
      createdAt: new Date(),
      userPrompt: insertStory.userPrompt || null,
      imageUrl: insertStory.imageUrl || null,
      isSaved: insertStory.isSaved || false,
    };
    this.stories.set(id, story);
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return Array.from(this.stories.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getStoryById(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async toggleStorySaved(id: number): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (story) {
      story.isSaved = !story.isSaved;
      this.stories.set(id, story);
      return story;
    }
    return undefined;
  }

  async getParentalSettings(): Promise<ParentalSettings> {
    return this.parentalSettings;
  }

  async updateParentalSettings(settings: InsertParentalSettings): Promise<ParentalSettings> {
    this.parentalSettings = {
      ...this.parentalSettings,
      ...settings,
    };
    return this.parentalSettings;
  }
}

export const storage = new MemStorage();
