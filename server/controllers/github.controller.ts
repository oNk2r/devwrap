import { Request, Response } from 'express';
import { githubService } from '../services/github/github.service.js';
import { analyticsService } from '../services/analytics/analytics.service.js';
import { geminiService } from '../services/gemini/gemini.service.js';

// Helper to wrap delay in async/await
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GitHubController {
  async getGitHubDataStream(req: Request, res: Response): Promise<void> {
    const username = req.params.username as string;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish stream link

    let isAborted = false;

    // Client connection closed
    req.on('close', () => {
      isAborted = true;
      res.end();
    });

    const sendLog = (message: string) => {
      if (isAborted) return;
      res.write(`data: ${JSON.stringify({ type: 'log', message })}\n\n`);
    };

    const sendError = (message: string, status: number = 500) => {
      if (isAborted) return;
      res.write(`data: ${JSON.stringify({ type: 'error', message, status })}\n\n`);
      res.end();
    };

    const sendData = (data: any) => {
      if (isAborted) return;
      res.write(`data: ${JSON.stringify({ type: 'data', ...data })}\n\n`);
      res.end();
    };

    try {
      // 1. Initial connection log
      sendLog(`$ connecting to github api gateway for user: ${username}...`);
      await delay(50);
      if (isAborted) return;

      // 2. Fetch raw profile
      sendLog(`fetching profile metrics...`);
      const rawProfile = await githubService.fetchRawProfile(username);
      if (isAborted) return;
      sendLog(`✓ profile found for ${rawProfile.name || rawProfile.login}`);
      await delay(50);
      if (isAborted) return;

      // 3. Fetch repositories
      sendLog(`reading repositories...`);
      const rawRepos = await githubService.fetchRawRepositories(username);
      if (isAborted) return;
      sendLog(`✓ found ${rawRepos.length} public repositories`);
      await delay(50);
      if (isAborted) return;

      // Fetch contributions
      sendLog(`compiling commit activity heatmap...`);
      const contributionsData = await githubService.fetchContributions(username);
      if (isAborted) return;
      const heatmap = contributionsData?.contributions || [];
      if (heatmap.length > 0) {
        sendLog(`✓ loaded contribution calendar data`);
      } else {
        sendLog(`⚠ contribution data unavailable, generating mock pattern`);
      }
      await delay(50);
      if (isAborted) return;

      // 4. Run analytics and compile statistics
      sendLog(`collecting metadata & aggregating stats...`);
      const processedResult = analyticsService.analyze(rawProfile, rawRepos);
      await delay(50);
      if (isAborted) return;

      sendLog(`consulting gemini model for observations...`);
      const geminiResult = await geminiService.generateRecap(
        processedResult.profile.username,
        processedResult.profile.name,
        processedResult.profile.bio,
        processedResult.stats.topLanguages,
        processedResult.stats.totalStars,
        processedResult.profile.publicRepos
      );
      if (isAborted) return;
      await delay(50);

      sendLog(`building workspace modules...`);
      await delay(50);

      sendLog(`✓ workspace compiled. launching interactive terminal...`);
      await delay(25);

      // 5. Send completed result
      sendData({
        ...processedResult,
        heatmap,
        aiSummary: geminiResult.summary,
        archetype: geminiResult.archetype,
        archetypeSentence: geminiResult.archetypeSentence
      });
    } catch (error: any) {
      if (isAborted) return;
      console.error(`Error in stream for ${username}:`, error);
      const status = error.status || 500;
      const message = error.message || 'Internal Server Error';
      
      if (status === 404) {
        sendError(`ERROR: GitHub user "${username}" was not found (404).`, 404);
      } else {
        sendError(`ERROR: Failed compiling workspace: ${message} (Status: ${status})`, status);
      }
    }
  }
}

export const githubController = new GitHubController();
