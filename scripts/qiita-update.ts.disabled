import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yaml from "js-yaml";

const QIITA_TOKEN = process.env.QIITA_TOKEN;
if (!QIITA_TOKEN) throw new Error("QIITA_TOKEN is not set");

type Frontmatter = {
  title: string;
  tags?: string[];
  private?: boolean;
  qiita_id?: string | null;
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Frontmatter not found");
  const meta = yaml.load(match[1]) as any;
  return { meta: meta as Frontmatter, body: match[2].trim() };
}

async function updateQiita(articlePath: string) {
  const fullPath = path.resolve(articlePath);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { meta, body } = parseFrontmatter(raw);

  if (!meta.qiita_id) throw new Error("qiita_id is not set");

  const qiitaBody =
    body +
    `\n\n---\n> この投稿は GitHub リポジトリ "aws-content-relay-hub" から自動更新されています。\n`;

  const res = await fetch(
    `https://qiita.com/api/v2/items/${meta.qiita_id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${QIITA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: meta.title,
        tags: (meta.tags || []).map((t) => ({ name: t })),
        body: qiitaBody,
        private: meta.private ?? false,
      }),
    }
  );

  if (!res.ok) throw new Error(`Qiita PATCH failed: ${res.status}`);

  const json = await res.json();
  console.log("Updated Qiita:", json.id, json.url);
}

const articlePath = process.argv[2];
if (!articlePath) {
  console.error("Usage: ts-node scripts/qiita-update.ts articles/xxx.md");
  process.exit(1);
}

updateQiita(articlePath).catch((e) => {
  console.error(e);
  process.exit(1);
});
