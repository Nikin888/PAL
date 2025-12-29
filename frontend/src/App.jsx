import React, { useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import PriceCard from "./components/PriceCard.jsx";

//const API_BASE = "http://localhost:5000";
const API_BASE = "https://pal-pxwn.onrender.com/";
export default function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API_BASE}/api/price-compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const bestPlatformName = data?.best?.platform;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundColor: "#f0fff7",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "40px",
        boxSizing: "border-box",
      }}
    >

      {/* ---------------------- ANIMATED LOGO ---------------------- */}
      <style>
        {`
          @keyframes pulseLogo {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.12); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}
      </style>

      <div style={{ position: "absolute", top: "5px", left: "50%", transform: "translateX(-50%)" }}>
        <img
          src="logo.png"
          alt="Logo"
          style={{
            width: "150px",
            animation: "pulseLogo 2.8s infinite ease-in-out",
            
            
          }}
        />
      </div>
      {/* ------------------------------------------------------------ */}

      <main
        style={{
          width: "95%",
          maxWidth: "900px",
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(12px)",
          borderRadius: "25px",
          padding: "35px 25px",
          boxShadow: "0px 10px 35px rgba(0,0,0,0.18)",
          marginTop: "90px",
        }}
      >

        {/* HERO SECTION */}
        <section style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              background: "white",
              WebkitBackgroundClip: "text",
              color: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
              marginBottom: "12px",
            }}
          >
            Discover the Cheapest Deal Now
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#333",
              marginBottom: "20px",
              fontWeight: "500",
            }}
          >
            Your Shortcut to the Cheapest Deals          </p>

          {/* SEARCH BAR */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255, 77, 77, 0.2)",
                color: "#b30000",
                fontWeight: "600",
              }}
            >
              {error}
            </div>
          )}
        </section>

        {/* RESULTS */}
        {data && (
          <>
            <SummaryCard
              query={data.query}
              cleanedQuery={data.cleanedQuery}
              summary={data.summary}
              best={data.best}
            />

            <section
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {data.platforms.map((p, idx) => (
                <PriceCard
                  key={`${p.platform}-${idx}`}
                  platform={p.platform}
                  name={p.name}
                  price={p.price}
                  image={p.image}
                  link={p.link}
                  isBest={
                    bestPlatformName === p.platform &&
                    p.price === data.best.price
                  }
                />
              ))}
            </section>
          </>
        )}

        {/* SUGGESTIONS */}
        {!data && !loading && !error && (
          <section style={{ marginTop: "25px", textAlign: "center" }}>
            <p style={{ fontWeight: "600", color: "#222" }}>
              Try searching for popular items:
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              {["iphone", "shoes", "watch", "headphones"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setTimeout(handleSearch, 0);
                  }}
                  style={{
                    padding: "8px 18px",
                    background:
                      "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
                    color: "white",
                    border: "none",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "0.2s",
                  }}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "#555",
            fontWeight: "500",
          }}
        >
          © 2025 PriceCompare AI — All Rights Reserved
        </footer>
      </main>
    </div>
  );
}
