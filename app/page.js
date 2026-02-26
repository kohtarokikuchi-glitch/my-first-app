"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { searchFAQ } from "./lib/search";

const EXAMPLE_QUESTIONS = [
  "有給休暇の申請方法は？",
  "Wi-Fiのパスワードは？",
  "経費精算の締め日はいつですか？",
  "会議室の予約方法は？",
  "リモートワークの申請方法は？",
];

const HISTORY_KEY = "faq-search-history";
const MAX_HISTORY = 5;

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState([]);
  const composingRef = useRef(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  async function handleSearch(searchQuery) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchFAQ(q);
      setResult(data);

      const updated = [q, ...history.filter((h) => h !== q)].slice(0, MAX_HISTORY);
      saveHistory(updated);
      setHistory(updated);
    } finally {
      setIsSearching(false);
    }
  }

  function removeHistoryItem(q) {
    const updated = history.filter((h) => h !== q);
    saveHistory(updated);
    setHistory(updated);
  }

  function clearHistory() {
    saveHistory([]);
    setHistory([]);
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
    if (e.key === "Enter" && !composingRef.current) {
      handleSearch();
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-3 py-8 sm:px-4 sm:py-20">
      <main className="w-full max-w-lg">
        {/* ヘッダー: バッジ + タイトル */}
        <div className="mb-8 text-center">
          <Image
            src="/MedicalHorizon_logo.png"
            alt="Medical Horizon"
            width={120}
            height={120}
            className="mx-auto mb-4 mix-blend-multiply"
            priority
          />
          <h1 className="text-xl font-bold tracking-wide text-text sm:text-2xl">
            FAQ検索ボット
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            質問を入力すると、社内FAQから回答をお探しします
          </p>
        </div>

        {/* 検索バー */}
        <div
          className="relative rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border transition-shadow focus-within:shadow-[0_18px_45px_rgba(0,73,116,0.22)] focus-within:border-primary/30"
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
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }}
              placeholder="質問を入力してください..."
              className="flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-light"
              aria-label="FAQ検索"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="ml-2 text-text-light hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
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
              className="ml-2 rounded-xl bg-gradient-to-br from-primary to-primary-light px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,160,176,0.4)] transition-all disabled:opacity-40 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              {isSearching ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  検索中
                </span>
              ) : "検索"}
            </button>
          </div>
        </div>

        {/* スケルトンローディング */}
        {isSearching && (
          <div className="mt-6 space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-4 sm:p-6 shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border animate-pulse"
              >
                <div className="mb-3 h-5 w-20 rounded-full bg-gray-200" />
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 検索結果 */}
        {result && !isSearching && (
          <div className="mt-6 space-y-4" key={result.query}>
            {result.results.length > 0 ? (
              <>
                <p className="text-center text-sm text-text-muted">
                  {result.results.length}件見つかりました
                </p>
                {result.results.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl bg-white p-4 sm:p-6 shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border transition-shadow hover:shadow-[0_24px_55px_rgba(0,73,116,0.2)] animate-fade-in-up delay-${index}`}
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
                ))}
              </>
            ) : (
              <div className="rounded-2xl bg-white p-4 sm:p-6 text-center shadow-[0_18px_45px_rgba(0,73,116,0.15)] border border-card-border animate-fade-in-up">
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
                className="mt-2 rounded-full border border-card-border bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-badge-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                別の質問をする
              </button>
            </div>
          </div>
        )}

        {/* 最近の検索（検索前・検索中以外で常に表示。履歴がなければ空状態） */}
        {!result && !isSearching && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-semibold tracking-widest text-text-light uppercase">
                最近の検索
              </p>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-text-light hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="space-y-2">
              {history.length > 0 ? (
                history.map((q) => (
                  <div
                    key={q}
                    className="group flex w-full items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-left text-sm text-text border border-card-border transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-text-light"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <button
                      onClick={() => handleExampleClick(q)}
                      className="flex-1 text-left truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      {q}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(q);
                      }}
                      className="ml-auto shrink-0 text-text-light opacity-0 group-hover:opacity-100 hover:text-text transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                      aria-label={`「${q}」を履歴から削除`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-card-border bg-white/50 px-4 py-3 text-center text-sm text-text-muted">
                  まだ検索履歴はありません
                </p>
              )}
            </div>
          </div>
        )}

        {/* よくある質問（検索前・検索中以外に表示） */}
        {!result && !isSearching && (
          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-semibold tracking-widest text-text-light uppercase">
              よくある質問
            </p>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/70 px-4 py-3 text-left text-sm text-text transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-md border border-card-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
