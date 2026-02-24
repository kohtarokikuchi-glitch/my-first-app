import { getSupabase } from "./supabase";

/**
 * FAQ を検索し、関連度スコア順に結果を返す。
 * Supabase の search_faq RPC 関数でキーワードごとの重み付きスコアリングを行う。
 *
 * @param {string} query - 検索クエリ
 * @returns {Promise<{ results: Array, query: string }>}
 */
export async function searchFAQ(query) {
  if (!query || query.trim() === "") {
    return { results: [], query };
  }

  const { data, error } = await getSupabase().rpc("search_faq", {
    search_query: query.trim().replace(/\s+/g, " "),
  });

  if (error) {
    console.error("Supabase search error:", error);
    return { results: [], query };
  }

  return { results: data ?? [], query };
}
