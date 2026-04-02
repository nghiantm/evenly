import { CATEGORY_KEYWORDS } from './expenseKeywords';

export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_KEYWORDS);

export function suggestCategory(description: string): string {
  const input = description.toLowerCase().trim();
  if (!input) return 'other';

  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (count, keyword) => (input.includes(keyword) ? count + 1 : count),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return (bestCategory ?? 'Other').toLowerCase();
}
