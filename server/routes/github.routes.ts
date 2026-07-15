import { Router } from 'express';
import { githubController } from '../controllers/github.controller.js';

const router = Router();

// Stream GitHub data using SSE
router.get('/github/:username', (req, res) => {
  githubController.getGitHubDataStream(req, res);
});

export default router;