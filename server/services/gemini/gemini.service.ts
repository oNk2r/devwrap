import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysisResult {
  summary: string[];
  archetype: string;
  archetypeSentence: string;
}

export class GeminiService {
  private getClient(): GoogleGenerativeAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  async generateRecap(
    username: string, 
    name: string,
    bio: string, 
    topLanguages: Array<{ language: string; percentage: number }>,
    totalStars: number,
    publicRepos: number
  ): Promise<GeminiAnalysisResult> {
    const client = this.getClient();
    if (!client) {
      return this.getFallback(topLanguages, totalStars, publicRepos);
    }

    try {
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const languagesStr = topLanguages.map(l => `${l.language} (${l.percentage}%)`).join(', ');
      
      const prompt = `
        Analyze this GitHub developer profile data and return a JSON summary of their recap coding wrap.
        Profile Info:
        - Username: ${username}
        - Display Name: ${name}
        - Bio: ${bio}
        - Top Languages: ${languagesStr}
        - Public Repositories: ${publicRepos}
        - Total Stars Accumulated: ${totalStars}

        Please return a strictly formatted JSON object containing:
        1. "summary": An array of exactly 3 short sentences of developer observations/facts. Do not start them with any bullet points or prefix. Example: ["TypeScript became your strongest language for frontend builds.", "Your open-source modules accumulated 42 stars.", "Your repositories demonstrate modular system structures."]
        2. "archetype": A short uppercase title of their coding personality. Must be one of: THE ARCHITECT, THE ANALYST, THE SYSTEM BUILDER, THE EXPLORER, THE BUILDER.
        3. "archetypeSentence": A single descriptive sentence summarizing their archetype style. Example: "You construct high-scale web modules with precise type systems and modular interfaces."

        Ensure the output is valid JSON and nothing else. Do not wrap in markdown block fences.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      
      // Clean up markdown block wraps
      const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        summary: Array.isArray(parsed.summary) ? parsed.summary.slice(0, 3) : [],
        archetype: parsed.archetype || 'THE BUILDER',
        archetypeSentence: parsed.archetypeSentence || 'You create functional codebases, shipping clean repositories with clear layouts.'
      };
    } catch (error) {
      console.error('Failed calling Gemini API:', error);
      return this.getFallback(topLanguages, totalStars, publicRepos);
    }
  }

  private getFallback(
    topLanguages: Array<{ language: string; percentage: number }>,
    totalStars: number,
    publicRepos: number
  ): GeminiAnalysisResult {
    const primaryLang = topLanguages[0]?.language || 'TypeScript';

    const summary = [
      primaryLang === 'TypeScript' || primaryLang === 'JavaScript'
        ? 'TypeScript became your strongest language for system builds.'
        : `You built consistently using ${primaryLang} for core projects.`,
      totalStars > 50
        ? `Your open-source modules accumulated ${totalStars} community stars.`
        : 'Your repositories demonstrate modular system structures.',
      'Open-source activity continues to expand with clean layout patterns.'
    ];

    let archetype = 'THE BUILDER';
    let archetypeSentence = 'You create functional codebases, shipping clean repositories with clear layouts.';

    if (primaryLang === 'TypeScript' || primaryLang === 'JavaScript') {
      archetype = 'THE ARCHITECT';
      archetypeSentence = 'You construct high-scale web modules with precise type systems and modular interfaces.';
    } else if (primaryLang === 'Python') {
      archetype = 'THE ANALYST';
      archetypeSentence = 'You translate complex data loops and algorithms into automated pipeline scripts.';
    } else if (primaryLang === 'Rust' || primaryLang === 'Go' || primaryLang === 'C++') {
      archetype = 'THE SYSTEM BUILDER';
      archetypeSentence = 'You compile high-performance primitives, prioritizing memory safety and speed.';
    }

    return { summary, archetype, archetypeSentence };
  }
}

export const geminiService = new GeminiService();
