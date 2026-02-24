# Medical Horizon FAQ Bot

社内FAQを自然言語で検索するチャットボット（MVP）。  
製品要件は [docs/PRD.md](docs/PRD.md) を参照。

## 主軸のアプリ（ルート）

**このリポジトリのルートが本番用の Next.js アプリです。**  
開発・デプロイはすべてルートで行います。

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く（スマホ表示推奨）。

## 技術スタック

- **Next.js** (App Router) + React
- **Tailwind CSS**（Medical Horizon ブランドカラー）
- モックFAQ検索（キーワードマッチ）。今後 Supabase に接続予定

## 構成

- `app/page.js` — トップ画面（検索バー・よくある質問・検索結果）
- `app/lib/faq-data.js` — モックFAQデータ
- `app/lib/search.js` — 検索ロジック
- `app/globals.css` — ブランドスタイル

## デプロイ（Vercel）

GitHub に push 後、Vercel でリポジトリをインポート。**Root Directory は指定しない**（ルートがアプリ本体）。
