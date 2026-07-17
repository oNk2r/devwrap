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

    const sendLog = (message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'log', message })}\n\n`);
    };

    const sendError = (message: string, status: number = 500) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message, status })}\n\n`);
      res.end();
    };

    const sendData = (data: any) => {
      res.write(`data: ${JSON.stringify({ type: 'data', ...data })}\n\n`);
      res.end();
    };

    // Client connection closed
    req.on('close', () => {
      res.end();
    });

    try {
      // 1. Initial connection log
      sendLog(`$ connecting to github api gateway for user: ${username}...`);
      await delay(400);

      // 2. Fetch raw profile
      sendLog(`fetching profile metrics...`);
      const rawProfile = await githubService.fetchRawProfile(username);
      sendLog(`✓ profile found for ${rawProfile.name || rawProfile.login}`);
      await delay(400);

      // 3. Fetch repositories
      sendLog(`reading repositories...`);
      const rawRepos = await githubService.fetchRawRepositories(username);
      sendLog(`✓ found ${rawRepos.length} public repositories`);
      await delay(400);

      // Fetch contributions
      sendLog(`compiling commit activity heatmap...`);
      const contributionsData = await githubService.fetchContributions(username);
      const heatmap = contributionsData?.contributions || [];
      if (heatmap.length > 0) {
        sendLog(`✓ loaded contribution calendar data`);
      } else {
        sendLog(`⚠ contribution data unavailable, generating mock pattern`);
      }
      await delay(400);

      // 4. Run analytics and compile statistics
      sendLog(`collecting metadata & aggregating stats...`);
      const processedResult = analyticsService.analyze(rawProfile, rawRepos);
      await delay(400);

      sendLog(`consulting gemini model for observations...`);
      const geminiResult = await geminiService.generateRecap(
        processedResult.profile.username,
        processedResult.profile.name,
        processedResult.profile.bio,
        processedResult.stats.topLanguages,
        processedResult.stats.totalStars,
        processedResult.profile.publicRepos
      );
      await delay(400);

      sendLog(`building workspace modules...`);
      await delay(400);

      sendLog(`✓ workspace compiled. launching interactive terminal...`);
      await delay(200);

      // 5. Send completed result
      sendData({
        ...processedResult,
        heatmap,
        aiSummary: geminiResult.summary,
        archetype: geminiResult.archetype,
        archetypeSentence: geminiResult.archetypeSentence
      });
    } catch (error: any) {
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
