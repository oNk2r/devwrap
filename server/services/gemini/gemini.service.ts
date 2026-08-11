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
      return this.getFallback(username, topLanguages, totalStars, publicRepos);
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
      
      // Robust JSON extraction
      let cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      const parsed = JSON.parse(cleanText);
      
      return {
        summary: Array.isArray(parsed.summary) ? parsed.summary.slice(0, 3) : [],
        archetype: parsed.archetype || 'THE BUILDER',
        archetypeSentence: parsed.archetypeSentence || 'You create functional codebases, shipping clean repositories with clear layouts.'
      };
    } catch (error) {
      console.error('Failed calling Gemini API:', error);
      return this.getFallback(username, topLanguages, totalStars, publicRepos);
    }
  }

  private getFallback(
    username: string,
    topLanguages: Array<{ language: string; percentage: number }>,
    totalStars: number,
    publicRepos: number
  ): GeminiAnalysisResult {
    const primaryLang = topLanguages[0]?.language || 'TypeScript';

    // Deterministic selection based on username so different users get different archetypes
    const charCodeSum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const archetypeIndex = charCodeSum % 5;

    const archetypes = [
      {
        archetype: 'THE ARCHITECT',
        archetypeSentence: 'You construct high-scale web modules with precise type systems and modular interfaces.'
      },
      {
        archetype: 'THE ANALYST',
        archetypeSentence: 'You translate complex data loops and algorithms into automated pipeline scripts.'
      },
      {
        archetype: 'THE SYSTEM BUILDER',
        archetypeSentence: 'You compile high-performance primitives, prioritizing memory safety and speed.'
      },
      {
        archetype: 'THE EXPLORER',
        archetypeSentence: 'You navigate experimental libraries, seeking out novel paradigms and cutting-edge tech.'
      },
      {
        archetype: 'THE BUILDER',
        archetypeSentence: 'You create functional codebases, shipping clean repositories with clear layouts.'
      }
    ];

    const chosen = archetypes[archetypeIndex];

    const summary = [
      primaryLang === 'TypeScript' || primaryLang === 'JavaScript'
        ? 'TypeScript became your strongest language for system builds.'
        : `You built consistently using ${primaryLang} for core projects.`,
      totalStars > 50
        ? `Your open-source modules accumulated ${totalStars} community stars.`
        : 'Your repositories demonstrate modular system structures.',
      'Open-source activity continues to expand with clean layout patterns.'
    ];

    return { summary, archetype: chosen.archetype, archetypeSentence: chosen.archetypeSentence };
  }
}

export const geminiService = new GeminiService();
