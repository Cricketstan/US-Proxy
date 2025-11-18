import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// MAIN M3U8 PROXY
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const r = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    let body = await r.text();
    const base = target.substring(0, target.lastIndexOf("/") + 1);

    body = body.replace(/(.*\.m3u8|.*\.ts|.*\.m4s|.*\.mp4)/g, match => {
      const absolute = match.startsWith("http") ? match : base + match;
      return `/segment?url=${encodeURIComponent(absolute)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(body);

  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

// SEGMENT PROXY
app.get("/segment", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing segment URL");

  try {
    const segment = await fetch(url);
    res.setHeader("Content-Type", segment.headers.get("content-type"));
    segment.body.pipe(res);
  } catch (e) {
    res.status(500).send("Segment error: " + e.message);
  }
});

app.listen(10000, () => {
  console.log("US Proxy running on port 10000");
});
