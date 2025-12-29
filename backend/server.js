const express = require("express");
const axios = require("axios");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ---- CLEAN QUERY ----
function cleanQuery(query) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

// ---- AMAZON SCRAPER ----
async function scrapeAmazon(query) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const data = await page.evaluate(() => {
    const item = document.querySelector('[data-component-type="s-search-result"]');
    if (!item) return null;

    const name = item.querySelector("h2 span")?.innerText;
    const img = item.querySelector("img")?.src;
    const priceText = item.querySelector(".a-price-whole")?.innerText;
    
    // NEW: extract product link
    const rawLink = item.querySelector("a.a-link-normal.s-no-outline")?.href;

    if (!priceText || !rawLink) return null;

    const price = parseInt(priceText.replace(/\D/g, ""));
    const link = rawLink.startsWith("http") ? rawLink : "https://www.amazon.in" + rawLink;

    return { name, price, image: img, link };
  });

  await browser.close();
  return data ? { ...data, platform: "Amazon" } : null;
}

// ---- FLIPKART SCRAPER ----
async function scrapeFlipkart(query) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const data = await page.evaluate(() => {
    const item =
      document.querySelector("._1fQZEK") || 
      document.querySelector("._2kHMtA");

    if (!item) return null;

    const name = item.querySelector("._4rR01T")?.innerText;
    const img = item.querySelector("img")?.src;
    const priceText = item.querySelector("._30jeq3")?.innerText;

    // NEW: product link
    const rawLink = item.querySelector("a")?.href;

    if (!priceText || !rawLink) return null;

    const price = parseInt(priceText.replace(/\D/g, ""));
    const link = rawLink.startsWith("http") ? rawLink : "https://www.flipkart.com" + rawLink;

    return { name, price, image: img, link };
  });

  await browser.close();
  return data ? { ...data, platform: "Flipkart" } : null;
}
// ---- FREE API (DummyJSON fallback) ----
async function fetchDummyProducts(query) {
  const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url);
    return data.products;
  } catch {
    return [];
  }
}

// ---- MAIN ENDPOINT ----
app.post("/api/price-compare", async (req, res) => {
  const query = req.body.query;
  const cleaned = cleanQuery(query);

  try {
    // 🔍 Try REAL SCRAPERS first
    const [amazon, flipkart] = await Promise.allSettled([
      scrapeAmazon(cleaned),
      scrapeFlipkart(cleaned)
    ]);

    let results = [];

    if (amazon.value) results.push(amazon.value);
    if (flipkart.value) results.push(flipkart.value);

    // If both failed, fallback to DummyJSON
    if (!results.length) {
      const dummy = await fetchDummyProducts(cleaned);

      results = dummy.slice(0, 2).map((p) => ({
        platform: "Dummy Store",
        name: p.title,
        price: p.price * 80,
        image: p.thumbnail,
        link: "https://dummyjson.com/products/" + p.id
      }));
    }

    const best = results.reduce((a, b) => (a.price < b.price ? a : b));

    res.json({
      query,
      cleanedQuery: cleaned,
      platforms: results,
      best,
      summary: `Best price for "${query}" is ₹${best.price} at ${best.platform}.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
