const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

// قاعدة البيانات: ملف songs.db بيتعمل لوحده أول مرة
const db = new Database(path.join(__dirname, "songs.db"));
db.exec(`CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  src TEXT NOT NULL,
  cover TEXT DEFAULT '',
  lyrics TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

const app = express();
app.use(cors());
app.use(express.json());

// ملفات الصوت والصور من الفولدرين دول
app.use("/songs", express.static(path.join(__dirname, "songs")));
app.use("/covers", express.static(path.join(__dirname, "covers")));

// البحث: GET /api/songs?q=كلمة  (من غير q بيرجع كل الأغاني)
app.get("/api/songs", (req, res) => {
  const q = "%" + String(req.query.q || "").trim() + "%";
  const rows = db
    .prepare("SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR lyrics LIKE ? ORDER BY id DESC")
    .all(q, q, q);
  res.json(rows);
});

// إضافة أغنية: POST /api/songs
app.post("/api/songs", (req, res) => {
  const { title, artist = "", src, cover = "", lyrics = "" } = req.body || {};
  if (!title || !src) return res.status(400).json({ error: "title و src مطلوبين" });
  const r = db
    .prepare("INSERT INTO songs (title, artist, src, cover, lyrics) VALUES (?, ?, ?, ?, ?)")
    .run(title, artist, src, cover, lyrics);
  res.status(201).json({ id: r.lastInsertRowid });
});

app.listen(process.env.PORT || 3000, () => console.log("السيرفر شغال"));
