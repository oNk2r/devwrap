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
    try {
      const response = await axios.get<GitHubRawUser>(
        `https://api.github.com/users/${username}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
    try {
      // Fetch public repos. Page 1, up to 100 repos.
      const response = await axios.get<GitHubRawRepo[]>(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
}

export const githubService = new GitHubService();
