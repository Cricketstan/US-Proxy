import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");
  try {
    const r = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let body = await r.text();
    const base = target.substring(0, target.lastIndexOf("/") + 1);

    body = body.replace(/(.*\.m3u8|.*\.ts|.*\.m4s|.*\.mp4)/g, match => {
      const abs = match.startsWith("http") ? match : base + match;
      return `/segment?url=${encodeURIComponent(abs)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(body);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

app.get("/segment", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing segment URL");

  try {
    const seg = await fetch(url);
    res.setHeader("Content-Type", seg.headers.get("content-type"));
    seg.body.pipe(res);
  } catch (e) {
    res.status(500).send("Segment error: " + e.message);
  }
});

app.listen(10000, () => console.log("US Proxy running"));
