import React from "react";

export default function SummaryCard({ query, cleanedQuery, summary, best }) {
  return (
    <div className="summary-card">
      <div className="summary-header">
        <h2>Summary</h2>
        {best && <span className="pill pill-best">Best: {best.platform}</span>}
      </div>
      <p className="summary-text">{summary}</p>
    </div>
  );
}
