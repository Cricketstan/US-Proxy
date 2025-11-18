import express from "express";
import fetch from "node-fetch";

const app = express();

// Allow HLS/MPD/CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/proxy", async (req, res) => {
  let url = req.query.url;

  if (!url) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Origin": "willowtv.com"
      }
    });

    // Copy content type (important for playlists)
    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    // Pass through all data (buffer)
    const data = await response.buffer();
    res.send(data);

  } catch (err) {
    console.log("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.get("/", (req, res) => {
  res.send("US Proxy Active");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("US Proxy running on port", PORT));
