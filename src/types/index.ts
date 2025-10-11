// TypeScript interfaces for the Korean Language Learning Website

export interface Resource {
  id: string;
  slug: string;
  title: string;
  titleKorean?: string;
  description: string;
  descriptionKorean?: string;
  image: string;
  link: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category:
    | "App"
    | "Book"
    | "Video"
    | "Website"
    | "Podcast"
    | "Course"
    | "Tool";
  tags: string[];
  rating?: number;
  isFree: boolean;
  language: "English" | "Korean" | "Bilingual";
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  titleKorean?: string;
  description: string;
  descriptionKorean?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  order: number;
  estimatedTime: string; // e.g., "2-3 weeks", "1 month"
  skills: string[];
  resources: string[]; // Array of resource IDs
  completed: boolean;
  prerequisites?: string[]; // Array of step IDs
}

export interface Roadmap {
  id: string;
  title: string;
  titleKorean?: string;
  description: string;
  descriptionKorean?: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Complete";
  steps: RoadmapStep[];
  totalEstimatedTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalTip {
  id: string;
  title: string;
  titleKorean?: string;
  content: string;
  contentKorean?: string;
  category:
    | "Etiquette"
    | "History"
    | "Food"
    | "Traditions"
    | "Language"
    | "Modern Culture";
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  level?: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  isFree?: boolean;
  language?: "English" | "Korean" | "Bilingual";
  tags?: string[];
}

export interface SearchResult {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Navigation and UI types
export interface NavigationItem {
  label: string;
  labelKorean?: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "feedback" | "suggestion" | "bug" | "general";
}

export interface NewsletterForm {
  email: string;
  interests: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
}

// Progress tracking types
export interface UserProgress {
  userId: string;
  completedSteps: string[]; // Array of step IDs
  completedResources: string[]; // Array of resource IDs
  currentLevel: "Beginner" | "Intermediate" | "Advanced";
  totalStudyTime: number; // in minutes
  lastActive: string;
  achievements: string[];
  streakData?: StreakData;
  stats?: UserStats;
}

// Achievement and gamification types
export interface Achievement {
  id: string;
  title: string;
  titleKorean?: string;
  description: string;
  descriptionKorean?: string;
  icon: string; // emoji or icon name
  category: "progress" | "streak" | "milestone" | "special" | "exploration";
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement: {
    type: "steps_completed" | "days_streak" | "resources_viewed" | "watchlist_items" | "total_days" | "custom";
    value: number;
    additionalConditions?: Record<string, any>;
  };
  reward?: {
    xp?: number;
    badge?: string;
  };
  unlockedAt?: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakHistory: string[]; // Array of dates in ISO format
}

export interface UserStats {
  totalStepsCompleted: number;
  totalResourcesViewed: number;
  totalWatchlistItems: number;
  totalDaysActive: number;
  accountCreatedAt: string;
  level: number;
  xp: number;
}

// Daily Quest System
export interface DailyQuest {
  id: string;
  title: string;
  titleKorean?: string;
  description: string;
  descriptionKorean?: string;
  icon: string;
  category: "steps" | "resources" | "streak" | "exploration" | "special";
  difficulty: "easy" | "medium" | "hard";
  requirement: {
    type: "steps_completed" | "resources_viewed" | "watchlist_items" | "days_active" | "custom";
    value: number;
    additionalConditions?: Record<string, any>;
  };
  reward: {
    xp: number;
    coins?: number;
    badge?: string;
  };
  expiresAt: string; // ISO date string
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  maxProgress: number;
  completedAt?: string;
  claimedReward: boolean;
}

export interface DailyActivity {
  date: string;
  activities: {
    type: string;
    count: number;
    timestamp: string;
  }[];
  totalCount: number;
}

// Analytics types
export interface PageView {
  path: string;
  title: string;
  timestamp: string;
  userAgent: string;
  referrer?: string;
  duration?: number;
}

export interface ResourceView extends PageView {
  resourceId: string;
  resourceTitle: string;
  resourceLevel: string;
  resourceCategory: string;
}
