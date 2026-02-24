"use client";

import { useState } from "react";
import { searchFAQ } from "./lib/search";

const EXAMPLE_QUESTIONS = [
  "有給休暇の申請方法は？",
  "Wi-Fiのパスワードは？",
  "経費精算の締め日はいつですか？",
  "会議室の予約方法は？",
  "リモートワークの申請方法は？",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(searchQuery) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchFAQ(q);
      setResult(data);
    } finally {
      setIsSearching(false);
    }
  }

  function handleReset() {
    setQuery("");
    setResult(null);
  }

  function handleExampleClick(question) {
    setQuery(question);
    handleSearch(question);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12 sm:py-20">
      <main className="w-full max-w-lg">
        {/* ヘッダー: バッジ + タイトル */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-badge-bg px-2.5 py-1 text-xs font-semibold tracking-wide text-badge-text uppercase">
            <span
              className="h-2 w-2 rounded-full bg-primary-light shadow-[0_0_0_4px_rgba(0,184,196,0.25)]"
              aria-hidden="true"
            />
            <span>Medical Horizon</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-text">
            FAQ検索ボット
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            質問を入力すると、社内FAQから回答をお探しします
          </p>
        </div>

        {/* 検索バー */}
        <div
          className="relative rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border"
        >
          <div className="flex items-center px-4 py-3">
            {/* 虫眼鏡アイコン */}
            <svg
              className="mr-3 h-5 w-5 shrink-0 text-text-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力してください..."
              className="flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-light"
              aria-label="FAQ検索"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="ml-2 text-text-light hover:text-text"
                aria-label="入力をクリア"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="ml-2 rounded-xl bg-gradient-to-br from-primary to-primary-light px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,160,176,0.4)] transition-opacity disabled:opacity-40"
            >
              {isSearching ? "検索中..." : "検索"}
            </button>
          </div>
        </div>

        {/* 検索結果 */}
        {result && (
          <div className="mt-6 space-y-4">
            {result.results.length > 0 ? (
              result.results.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border"
                >
                  {/* カテゴリバッジ */}
                  <span className="mb-3 inline-block rounded-full bg-badge-bg px-2.5 py-0.5 text-xs font-semibold text-badge-text">
                    {item.category}
                  </span>

                  {/* 質問 */}
                  <h2 className="mb-3 text-base font-bold text-text">
                    {item.question}
                  </h2>

                  {/* 回答 */}
                  <p className="mb-4 text-sm leading-relaxed text-text-muted">
                    {item.answer}
                  </p>

                  {/* 出典 */}
                  <div className="rounded-xl bg-[#f3fbfe] border border-[rgba(0,134,179,0.12)] px-3 py-2 text-xs text-text-light">
                    <span className="font-semibold text-badge-text">出典：</span>
                    {item.source}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white p-6 text-center shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border">
                <p className="text-sm text-text-muted">
                  「{result.query}」に一致するFAQが見つかりませんでした。
                </p>
                <p className="mt-1 text-xs text-text-light">
                  別のキーワードでお試しください。
                </p>
              </div>
            )}

            {/* 別の質問をするボタン */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="mt-2 rounded-full border border-card-border bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-badge-bg"
              >
                別の質問をする
              </button>
            </div>
          </div>
        )}

        {/* よくある質問（検索前に表示） */}
        {!result && (
          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-semibold tracking-widest text-text-light uppercase">
              よくある質問
            </p>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-left text-sm text-text transition-colors hover:bg-white border border-card-border"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-xs text-white shadow-[0_4px_10px_rgba(0,160,176,0.3)]">
                    ?
                  </span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-text-light">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#17c964] shadow-[0_0_0_3px_rgba(23,201,100,0.28)]"
            aria-hidden="true"
          />
          <span>Medical Horizon FAQ Bot — 社内専用</span>
        </div>
      </main>
    </div>
  );
}
