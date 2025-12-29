import React from "react";

export default function SearchBar({ value, onChange, onSearch, loading }) {
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      onSearch();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <input
        type="text"
        placeholder='Search a product e.g. "Boat Airdopes 141"'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          padding: "16px",
          fontSize: "17px",
          borderRadius: "12px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={onSearch}
        disabled={loading}
        style={{
          padding: "16px 22px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
          color: "white",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        {loading ? "..." : "Search"}
      </button>
    </div>
  );
}
