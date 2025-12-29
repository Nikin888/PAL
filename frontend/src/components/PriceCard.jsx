import React, { useState } from "react";

/**
 * Robust PriceCard component with built-in popup.
 * - Safe formatting for price & platform
 * - Protects against missing props (price, platform, image, link)
 * - Visit button won't trigger the popup (stops propagation)
 *
 * Usage:
 * <PriceCard platform="Amazon" name="Shoes" price={1299} image="..." link="..." isBest />
 */

export default function PriceCard({
  platform = "Unknown",
  name = "Unnamed product",
  price = null,
  image = null,
  link = "#",
  isBest = false
}) {
  const [openPopup, setOpenPopup] = useState(false);

  // safe platform initial
  const platformInitial =
    typeof platform === "string" && platform.length > 0
      ? platform[0].toUpperCase()
      : "?";

  // safe price formatting
  const formatPrice = (p) => {
    const n = Number(p);
    if (Number.isFinite(n)) {
      try {
        return n.toLocaleString("en-IN");
      } catch {
        return String(n);
      }
    }
    return "N/A";
  };

  const displayPrice = formatPrice(price);

  return (
    <>
      {/* ---- Inline CSS (keeps everything in one file) ---- */}
      <style>{`
        .price-card {
          background: #fff;
          border-radius: 14px;
          padding: 15px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative;
          overflow: hidden;
        }
        .price-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .price-card-best { border: 2px solid #27ae60; }

        .best-ribbon {
          background: #27ae60;
          color: #fff;
          padding: 6px 12px;
          border-radius: 0 10px 10px 0;
          position: absolute;
          top: 12px;
          left: 0;
          font-size: 13px;
          font-weight: 700;
        }

        .price-card-header { display:flex; gap:12px; align-items:center; }
        .platform-avatar {
          width:44px; height:44px; border-radius:50%;
          background:#2980b9; color:#fff; display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:18px; text-transform:uppercase;
        }
        .platform-info h3 { margin:0; font-size:16px; }
        .product-name { margin:4px 0 0 0; color:#555; font-size:14px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:220px; }

        .product-image-wrapper { height:150px; display:flex; align-items:center; justify-content:center; margin:14px 0; }
        .product-image-wrapper img { max-width:100%; max-height:150px; object-fit:contain; border-radius:8px; }
        .product-image-placeholder { width:100%; height:150px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#888; border-radius:8px; }

        .price-row { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:10px; }
        .price { font-size:20px; font-weight:700; color:#2c3e50; }
        .tag { padding:6px 10px; border-radius:8px; background:#eee; font-size:12px; }
        .tag-save { background:#27ae60; color:#fff; }

        .visit-btn {
          display:inline-block; margin-top:12px; padding:10px 12px; border-radius:10px; text-decoration:none;
          background:#2d9cdb; color:#fff; font-weight:600; font-size:14px;
        }
        .visit-btn:hover { background:#217fb0; }

        /* popup */
        .popup-overlay {
          position: fixed; inset: 0; display:flex; align-items:center; justify-content:center;
          background: rgba(0,0,0,0.6); z-index: 2000;
        }
        .popup-box {
          width: 420px; max-width:92vw; background:#fff; border-radius:12px; padding:18px; position:relative;
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          animation: popupIn 180ms ease;
        }
        @keyframes popupIn { from { transform: scale(0.98); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .popup-close { position:absolute; top:10px; right:10px; background:none; border:none; font-size:22px; cursor:pointer; }
        .popup-image { width:100%; height:240px; object-fit:contain; border-radius:8px; background:#f6f6f6; display:block; margin-bottom:12px; }

        .popup-meta { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px; }
        .popup-meta .p-title { font-weight:700; font-size:16px; margin:0; }
        .popup-meta .p-price { font-weight:800; font-size:18px; color:#2c3e50; }

        .popup-desc { margin:8px 0 12px 0; color:#444; font-size:14px; }
      `}</style>

      {/* ---- Card (click opens popup) ---- */}
      <article
        className={`price-card ${isBest ? "price-card-best" : ""}`}
        onClick={() => setOpenPopup(true)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === "Enter") setOpenPopup(true); }}
        style={{ cursor: "pointer" }}
      >
        {isBest && <div className="best-ribbon">Best Price</div>}

        <div className="price-card-header">
          <div className="platform-avatar">{platformInitial}</div>
          <div className="platform-info">
            <h3>{platform}</h3>
            <p className="product-name" title={name}>{name}</p>
          </div>
        </div>

        <div className="price-card-body">
          <div className="product-image-wrapper">
            {image ? (
              // using alt text and not throwing when image is invalid
              <img src={image} alt={name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
          </div>

          <div className="price-row">
            <span className="price">₹{displayPrice}</span>
            {isBest ? (
              <span className="tag tag-save">Cheapest</span>
            ) : (
              <span className="tag">Alternative</span>
            )}
          </div>
        </div>

        <a
          href={link || "#"}
          className="visit-btn"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()} // prevent opening popup when user clicks the link
        >
          Visit {platform}
        </a>
      </article>

      {/* ---- Popup (detailed view) ---- */}
      {openPopup && (
        <div className="popup-overlay" onClick={() => setOpenPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setOpenPopup(false)}>×</button>

            {image ? (
              <img className="popup-image" src={image} alt={name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div style={{ height: 240, borderRadius: 8, background: "#f6f6f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", marginBottom: 12 }}>
                No image available
              </div>
            )}

            <div className="popup-meta">
              <p className="p-title" title={name}>{name}</p>
              <p className="p-price">₹{displayPrice}</p>
            </div>

            <p className="popup-desc">
              Platform: <strong>{platform}</strong>
            </p>

            <a
              href={link || "#"}
              className="visit-btn"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { /* allow navigation; popup remains open until user closes or clicks outside */ }}
            >
              Visit {platform}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
