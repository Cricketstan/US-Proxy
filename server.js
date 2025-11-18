import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("Missing url param");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      }
    });

    res.set("Content-Type", response.headers.get("content-type"));
    res.send(await response.buffer());
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

app.listen(3000, () => console.log("US Proxy running"));
