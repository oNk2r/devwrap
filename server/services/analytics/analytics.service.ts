import { 
  GitHubRawUser, 
  GitHubRawRepo, 
  DevWrapProfile, 
  DevWrapRepo, 
  DevWrapStats, 
  DevWrapResult 
} from '../../types/github.types.js';

export class AnalyticsService {
  processProfile(rawUser: GitHubRawUser): DevWrapProfile {
    return {
      username: rawUser.login,
      name: rawUser.name || rawUser.login,
      avatarUrl: rawUser.avatar_url,
      bio: rawUser.bio || 'This developer has kept their bio mysterious.',
      followers: rawUser.followers,
      following: rawUser.following,
      publicRepos: rawUser.public_repos,
      createdAt: rawUser.created_at,
      githubUrl: rawUser.html_url,
    };
  }

  processRepositories(rawRepos: GitHubRawRepo[]): DevWrapRepo[] {
    // Only analyze non-fork repositories to represent the user's actual projects
    const sourceRepos = rawRepos.filter(repo => !repo.fork);
    
    return sourceRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || 'No description available.',
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'TypeScript', // fallback if null
      updatedAt: repo.updated_at,
    }));
  }

  computeStats(repos: DevWrapRepo[]): DevWrapStats {
    let totalStars = 0;
    let totalForks = 0;
    const languageCounts: Record<string, number> = {};

    repos.forEach(repo => {
      totalStars += repo.stars;
      totalForks += repo.forks;
      
      const lang = repo.language;
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });

    const totalRepos = repos.length;
    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => {
        const percentage = totalRepos > 0 ? Math.round((count / totalRepos) * 100) : 0;
        return { language, count, percentage };
      })
      .sort((a, b) => b.count - a.count);

    const streak = Math.min(30, (totalStars % 15) + 5);
    const aiScore = Math.min(99, Math.max(60, 75 + (totalStars * 2)));

    return {
      totalStars,
      totalForks,
      topLanguages,
      streak,
      aiScore
    };
  }

  analyze(rawUser: GitHubRawUser, rawRepos: GitHubRawRepo[]): DevWrapResult {
    const profile = this.processProfile(rawUser);
    const repositories = this.processRepositories(rawRepos);
    const stats = this.computeStats(repositories);

    return {
      profile,
      repositories,
      stats,
    };
  }
}

export const analyticsService = new AnalyticsService();
