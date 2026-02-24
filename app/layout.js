import "./globals.css";

export const metadata = {
  title: "Medical Horizon FAQ Bot",
  description:
    "社内FAQ検索チャットボット — 質問を入力するとFAQデータベースから最適な回答と出典を返します",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
