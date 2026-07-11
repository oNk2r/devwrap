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

export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
}

export interface DevWrapStats {
  totalStars: number;
  totalForks: number;
  topLanguages: LanguageStat[];
}

export interface DevWrapResult {
  profile: DevWrapProfile;
  repositories: DevWrapRepo[];
  stats: DevWrapStats;
}
