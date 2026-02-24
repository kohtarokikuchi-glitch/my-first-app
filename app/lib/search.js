import { faqData } from "./faq-data";

/**
 * FAQ を検索し、関連度順にソートして返す。
 * 後で Supabase API に差し替え可能なインターフェース。
 *
 * @param {string} query - 検索クエリ
 * @returns {Promise<{ results: Array, query: string }>}
 */
export async function searchFAQ(query) {
  if (!query || query.trim() === "") {
    return { results: [], query };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const keywords = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = faqData.map((item) => {
    const questionLower = item.question.toLowerCase();
    const answerLower = item.answer.toLowerCase();
    const categoryLower = item.category.toLowerCase();

    let score = 0;

    // 完全一致（質問文）: 高スコア
    if (questionLower.includes(normalizedQuery)) {
      score += 10;
    }

    // 完全一致（回答文）
    if (answerLower.includes(normalizedQuery)) {
      score += 5;
    }

    // キーワード別のマッチング
    for (const kw of keywords) {
      if (questionLower.includes(kw)) score += 3;
      if (answerLower.includes(kw)) score += 1;
      if (categoryLower.includes(kw)) score += 2;
    }

    return { ...item, score };
  });

  const results = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return { results, query };
}
