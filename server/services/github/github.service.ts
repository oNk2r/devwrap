import axios from 'axios';
import { GitHubRawUser, GitHubRawRepo } from '../../types/github.types.js';

export class GitHubService {
  private getHeaders() {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    return headers;
  }

  async fetchRawProfile(username: string): Promise<GitHubRawUser> {
    const encodedUser = encodeURIComponent(username);
    try {
      const response = await axios.get<GitHubRawUser>(
        `https://api.github.com/users/${encodedUser}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 && process.env.GITHUB_TOKEN) {
        console.warn('Warning: GITHUB_TOKEN unauthorized (401). Retrying request unauthenticated.');
        try {
          const fallbackResponse = await axios.get<GitHubRawUser>(
            `https://api.github.com/users/${encodedUser}`,
            { headers: { Accept: 'application/vnd.github+json' } }
          );
          return fallbackResponse.data;
        } catch (fallbackError: any) {
          if (fallbackError.response) {
            const status = fallbackError.response.status;
            const message = fallbackError.response.data?.message || 'GitHub Profile Fetch Failed';
            const err = new Error(message) as any;
            err.status = status;
            throw err;
          }
          throw fallbackError;
        }
      }
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'GitHub Profile Fetch Failed';
        const err = new Error(message) as any;
        err.status = status;
        throw err;
      }
      throw error;
    }
  }

  async fetchRawRepositories(username: string): Promise<GitHubRawRepo[]> {
    const encodedUser = encodeURIComponent(username);
    try {
      // Fetch public repos. Page 1, up to 100 repos.
      const response = await axios.get<GitHubRawRepo[]>(
        `https://api.github.com/users/${encodedUser}/repos?per_page=100&sort=updated`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 && process.env.GITHUB_TOKEN) {
        try {
          const fallbackResponse = await axios.get<GitHubRawRepo[]>(
            `https://api.github.com/users/${encodedUser}/repos?per_page=100&sort=updated`,
            { headers: { Accept: 'application/vnd.github+json' } }
          );
          return fallbackResponse.data;
        } catch (fallbackError: any) {
          if (fallbackError.response) {
            const status = fallbackError.response.status;
            const message = fallbackError.response.data?.message || 'GitHub Repositories Fetch Failed';
            const err = new Error(message) as any;
            err.status = status;
            throw err;
          }
          throw fallbackError;
        }
      }
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'GitHub Repositories Fetch Failed';
        const err = new Error(message) as any;
        err.status = status;
        throw err;
      }
      throw error;
    }
  }

  async fetchContributions(username: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
      );
      return response.data;
    } catch (error: any) {
      console.warn(`Warning: Failed to fetch contributions for ${username}:`, error.message || error);
      return null;
    }
  }
}

export const githubService = new GitHubService();
