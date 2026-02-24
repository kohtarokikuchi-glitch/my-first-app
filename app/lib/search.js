import { getSupabase } from "./supabase";

/**
 * FAQ を検索し、結果を返す。
 * Supabase の ilike フィルタでキーワードマッチングを行う。
 *
 * @param {string} query - 検索クエリ
 * @returns {Promise<{ results: Array, query: string }>}
 */
export async function searchFAQ(query) {
  if (!query || query.trim() === "") {
    return { results: [], query };
  }

  const keywords = query.trim().split(/\s+/).filter(Boolean);

  // 各キーワードに対して question / answer / category いずれかに
  // 部分一致する条件を OR で結合
  const filters = keywords.map(
    (kw) => `question.ilike.%${kw}%,answer.ilike.%${kw}%,category.ilike.%${kw}%`
  );

  let dbQuery = getSupabase()
    .from("faq_items")
    .select("id, question, answer, source, category");

  for (const filter of filters) {
    dbQuery = dbQuery.or(filter);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error("Supabase search error:", error);
    return { results: [], query };
  }

  return { results: data ?? [], query };
}
