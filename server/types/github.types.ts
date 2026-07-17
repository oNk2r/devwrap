export interface GitHubRawUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRawRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
}

export interface DevWrapProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  githubUrl: string;
}

export interface DevWrapRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

export interface DevWrapStats {
  totalStars: number;
  totalForks: number;
  topLanguages: Array<{ language: string; count: number; percentage: number }>;
  streak: number;
  aiScore: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface DevWrapResult {
  profile: DevWrapProfile;
  repositories: DevWrapRepo[];
  stats: DevWrapStats;
  heatmap?: ContributionDay[];
  aiSummary?: string[];
  archetype?: string;
  archetypeSentence?: string;
}
