/** Keyword lists for episode-based category matching. Used with SQL ilike on episode titles. */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  technology: [
    'AI', 'tech', 'software', 'coding', 'programming', 'computer', 'robot',
    'machine learning', 'crypto', 'blockchain', 'startup', 'silicon valley',
    'algorithm', 'data science', 'cybersecurity', 'hacking', 'internet',
    'app', 'digital', 'neural', 'GPT', 'LLM', 'AGI', 'quantum',
  ],
  health: [
    'health', 'wellness', 'fitness', 'nutrition', 'diet', 'mental health',
    'meditation', 'exercise', 'sleep', 'brain', 'body', 'medicine', 'doctor',
    'therapy', 'anxiety', 'depression', 'yoga', 'longevity', 'gut', 'immune',
    'fasting', 'hormone',
  ],
  business: [
    'business', 'money', 'invest', 'finance', 'entrepreneur', 'economy',
    'market', 'CEO', 'company', 'leadership', 'venture capital', 'revenue',
    'profit', 'wealth', 'real estate', 'stock', 'billion', 'million',
    'founder', 'negotiate',
  ],
};

export const CATEGORY_META: Record<string, { name: string; description: string }> = {
  technology: { name: 'Technology', description: 'AI, software, startups, and the digital world' },
  health: { name: 'Health', description: 'Wellness, fitness, nutrition, and mental health' },
  business: { name: 'Business', description: 'Finance, entrepreneurship, and leadership' },
};
