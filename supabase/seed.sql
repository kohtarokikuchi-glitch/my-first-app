-- faq_items テーブル作成
CREATE TABLE IF NOT EXISTS faq_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question   text NOT NULL,
  answer     text NOT NULL,
  source     text NOT NULL,
  category   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 有効化 + anon ユーザーに SELECT を許可
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
  ON faq_items
  FOR SELECT
  TO anon
  USING (true);

-- 初期データ投入
INSERT INTO faq_items (question, answer, source, category) VALUES
(
  '有給休暇の申請方法は？',
  '有給休暇は社内ポータルの「勤怠管理」メニューから申請できます。申請は取得希望日の3営業日前までに行い、上長の承認を受けてください。半日単位での取得も可能です。',
  '就業規則 第20条 / 社内ポータル「勤怠管理マニュアル」',
  '人事・労務'
),
(
  'Wi-Fiのパスワードは？',
  '社内Wi-Fi（SSID: MH-Internal）のパスワードは毎月更新されます。最新のパスワードは社内ポータルの「IT情報」ページに掲載されています。ゲスト用Wi-Fi（SSID: MH-Guest）は受付にてお尋ねください。',
  '情報システム部「ネットワーク利用ガイド」',
  'IT・システム'
),
(
  '経費精算の締め日はいつですか？',
  '経費精算の締め日は毎月25日です。25日までに申請・承認が完了したものが翌月15日の給与と合わせて支払われます。領収書原本は経理部へ提出してください。',
  '経理部「経費精算規程」第5条',
  '経理・財務'
),
(
  '会議室の予約方法は？',
  '会議室の予約はGoogleカレンダーから行えます。予約したい時間帯にイベントを作成し、「会議室」リソースから希望の部屋を選択してください。予約は最大2週間先まで可能です。',
  '総務部「会議室利用ガイド」',
  '総務・施設'
),
(
  '名刺を注文したいのですが？',
  '名刺の注文は社内ポータルの「備品・発注」メニューから申請できます。デザインテンプレートを選択し、記載情報を入力して上長承認後、約1週間で届きます。急ぎの場合は総務部に直接ご相談ください。',
  '総務部「名刺発注手順書」',
  '総務・施設'
),
(
  '健康診断はいつ受けられますか？',
  '定期健康診断は毎年6月と11月に実施されます。対象者にはメールで案内が届きますので、指定期間内に予約してください。提携クリニックでの受診も可能で、詳細は人事部までお問い合わせください。',
  '人事部「健康管理規程」/ 社内ポータル「健康診断のご案内」',
  '人事・労務'
),
(
  'リモートワークの申請方法は？',
  'リモートワークは前日までに社内ポータルの「勤怠管理」から在宅勤務申請を行ってください。週2日までの利用が可能です。VPN接続手順はIT情報ページを参照してください。',
  '人事部「リモートワーク規程」第3条',
  '人事・労務'
),
(
  '社員証を紛失した場合はどうすればよいですか？',
  '社員証の紛失時は速やかに総務部へ報告し、再発行申請を行ってください。再発行には本人確認書類が必要です。紛失届を提出後、仮カードが即日発行され、新しい社員証は約3営業日で届きます。',
  '総務部「社員証管理規程」',
  '総務・施設'
),
(
  'PCの調子が悪いのですが、どこに連絡すればよいですか？',
  'PCの不具合は情報システム部のヘルプデスクにご連絡ください。社内チャットの #it-helpdesk チャンネルまたは内線2200番で対応します。受付時間は平日9:00〜18:00です。',
  '情報システム部「ITサポート利用ガイド」',
  'IT・システム'
),
(
  '通勤手当の変更届はどこに出せばよいですか？',
  '通勤経路や手段の変更があった場合は、社内ポータルの「届出・申請」から通勤手当変更届を提出してください。変更届の提出は変更日から5営業日以内に行う必要があります。',
  '人事部「通勤手当支給規程」第8条',
  '人事・労務'
);

-- FAQ 検索用スコアリング関数
-- キーワードごとに question(3点) / answer(2点) / category(1点) の重み付きスコアを加算し、
-- スコア降順で結果を返す。
CREATE OR REPLACE FUNCTION search_faq(search_query text)
RETURNS TABLE (
  id         uuid,
  question   text,
  answer     text,
  source     text,
  category   text,
  score      int
)
LANGUAGE sql STABLE
AS $$
  SELECT
    f.id,
    f.question,
    f.answer,
    f.source,
    f.category,
    sum(
      CASE WHEN f.question ILIKE '%' || kw.word || '%' THEN 3 ELSE 0 END +
      CASE WHEN f.answer   ILIKE '%' || kw.word || '%' THEN 2 ELSE 0 END +
      CASE WHEN f.category ILIKE '%' || kw.word || '%' THEN 1 ELSE 0 END
    )::int AS score
  FROM faq_items f
  CROSS JOIN unnest(
    array_remove(string_to_array(trim(search_query), ' '), '')
  ) AS kw(word)
  GROUP BY f.id, f.question, f.answer, f.source, f.category
  HAVING sum(
    CASE WHEN f.question ILIKE '%' || kw.word || '%' THEN 3 ELSE 0 END +
    CASE WHEN f.answer   ILIKE '%' || kw.word || '%' THEN 2 ELSE 0 END +
    CASE WHEN f.category ILIKE '%' || kw.word || '%' THEN 1 ELSE 0 END
  ) > 0
  ORDER BY score DESC;
$$;

-- anon ユーザーに実行権限を付与
GRANT EXECUTE ON FUNCTION search_faq(text) TO anon;
