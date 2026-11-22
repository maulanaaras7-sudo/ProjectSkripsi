import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const response = await fetch("http://localhost:8080/materi.php");
if (!response.ok) throw new Error(`Referensi materi PHP tidak dapat dibaca (HTTP ${response.status}).`);
const html = await response.text();
const decode = (text) => text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
const plain = (text) => decode(text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").trim();
function toSource(content) {
  const maths = [];
  let source = content.replace(/<div class="math-display">([\s\S]*?)<\/div>/gi, (_, value) => { const token=`@@MATH${maths.length}@@`; maths.push(plain(value)); return token; });
  source = source.replace(/<h4>([\s\S]*?)<\/h4>/gi, (_, value) => `\n\n### ${plain(value)}\n\n`)
    .replace(/<p>([\s\S]*?)<\/p>/gi, (_, value) => `\n\n${plain(value)}\n\n`)
    .replace(/<li>([\s\S]*?)<\/li>/gi, (_, value) => `\n- ${plain(value)}\n`)
    .replace(/<\/?ul[^>]*>/gi, "");
  source = plain(source).replace(/@@MATH(\d+)@@/g, (_, index) => `\n\n${maths[Number(index)]}\n\n`).replace(/\n{3,}/g, "\n\n");
  return source.trim();
}
const cards = [...html.matchAll(/<div class="materi-card">\s*<h3>(\d+)\.\s*([^<]+)<\/h3>\s*<div class="konten">([\s\S]*?)<\/div>\s*<button[^>]*data-open-activity/gi)];
if (cards.length !== 3) throw new Error(`Ditemukan ${cards.length} materi; seharusnya 3.`);
const values = cards.map((match) => ({ id:Number(match[1]), judul:plain(match[2]), urutan:Number(match[1]), konten:toSource(match[3]) }));
const literal = (value) => `'${value.replaceAll("'", "''")}'`;
const sql = `-- Generated from the currently served PHP reference material. Do not edit manually.\nBEGIN;\n${values.map((item) => `INSERT INTO materi(id,judul,urutan,konten) VALUES (${item.id},${literal(item.judul)},${item.urutan},${literal(item.konten)}) ON CONFLICT (id) DO UPDATE SET judul=EXCLUDED.judul,urutan=EXCLUDED.urutan,konten=EXCLUDED.konten;`).join("\n")}\nSELECT setval(pg_get_serial_sequence('materi','id'),COALESCE((SELECT MAX(id) FROM materi),1),true);\nCOMMIT;\n`;
await writeFile(resolve("database/neon/07_sync_reference_materials.sql"), sql, "utf8");
console.log(`Generated ${values.length} materials from PHP reference.`);
