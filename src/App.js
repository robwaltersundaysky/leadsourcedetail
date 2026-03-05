import { useState, useEffect, useRef } from "react";
import { DEFAULT_DATA, DEFAULT_RETIRED } from "./data";

const STORAGE_KEY = "lead-source-map-v1";

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function saveToStorage(data, retired) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, retired }));
  } catch (e) {}
}

function exportCSV(data) {
  const rows = [["Lead Source", "Lead Source Detail"]];
  data.forEach((item) => {
    item.details.forEach((detail) => {
      rows.push([item.leadSource, detail]);
    });
  });
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lead-source-mapping.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const saved = loadFromStorage();
  const [data, setData] = useState(saved?.data || DEFAULT_DATA);
  const [retired, setRetired] = useState(saved?.retired || DEFAULT_RETIRED);
  const [showRetired, setShowRetired] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [dragItem, setDragItem] = useState(null); // { sourceIndex, detail }
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [saved2, setSaved2] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // index
  const [newDetail, setNewDetail] = useState("");
  const saveTimeout = useRef(null);

  useEffect(() => {
    saveToStorage(data, retired);
    setSaved2(true);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaved2(false), 1500);
  }, [data, retired]);

  function handleDragStart(e, sourceIndex, detail) {
    setDragItem({ sourceIndex, detail });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, targetIndex) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(targetIndex);
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (!dragItem || dragItem.sourceIndex === targetIndex) {
      setDragItem(null);
      setDragOverIndex(null);
      return;
    }
    const newData = data.map((item, i) => ({ ...item, details: [...item.details] }));
    // Remove from source
    newData[dragItem.sourceIndex].details = newData[dragItem.sourceIndex].details.filter(
      (d) => d !== dragItem.detail
    );
    // Add to target if not already there
    if (!newData[targetIndex].details.includes(dragItem.detail)) {
      newData[targetIndex].details.push(dragItem.detail);
    }
    setData(newData);
    setDragItem(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragItem(null);
    setDragOverIndex(null);
  }

  function removeDetail(cardIndex, detail) {
    const newData = data.map((item, i) => {
      if (i !== cardIndex) return item;
      return { ...item, details: item.details.filter((d) => d !== detail) };
    });
    setData(newData);
  }

  function addDetail(cardIndex) {
    if (!newDetail.trim()) return;
    const newData = data.map((item, i) => {
      if (i !== cardIndex) return item;
      if (item.details.includes(newDetail.trim())) return item;
      return { ...item, details: [...item.details, newDetail.trim()] };
    });
    setData(newData);
    setNewDetail("");
  }

  function resetToDefault() {
    if (window.confirm("Reset all changes to default? This cannot be undone.")) {
      setData(DEFAULT_DATA);
      setRetired(DEFAULT_RETIRED);
    }
  }

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#F7F6F3",
      minHeight: "100vh",
      padding: "28px 32px",
    }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1A1A1A",
              letterSpacing: "-0.5px",
              margin: 0,
            }}>
              Lead Source → Detail Mapping
            </h1>
            <p style={{
              fontSize: 13,
              color: "#888",
              marginTop: 5,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}>
              Drag detail pills between cards to reassign. Click × to remove. Changes save automatically.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {saved2 && (
              <span style={{
                fontSize: 12,
                color: "#4CAF82",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 600,
              }}>
                ✓ Saved
              </span>
            )}
            <button onClick={resetToDefault} style={btnStyle("#888")}>
              Reset
            </button>
            <button onClick={() => exportCSV(data)} style={btnStyle("#4A7FE8")}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {data.map((item, i) => (
            <div
              key={item.leadSource}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              style={{
                background: item.color,
                border: `2px solid ${dragOverIndex === i ? item.accent : hovered === i ? item.accent + "80" : "transparent"}`,
                borderRadius: 16,
                padding: "16px 18px",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: dragOverIndex === i
                  ? `0 6px 24px ${item.accent}40`
                  : hovered === i
                  ? `0 3px 16px ${item.accent}25`
                  : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Lead Source header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: item.accent, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1A1A1A",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}>
                    {item.leadSource}
                  </span>
                </div>
                <button
                  onClick={() => setEditingCard(editingCard === i ? null : i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    color: item.accent,
                    padding: "0 2px",
                    lineHeight: 1,
                    opacity: 0.7,
                  }}
                  title="Add detail"
                >
                  +
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `${item.accent}35`, marginBottom: 10 }} />

              {/* Detail pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 28 }}>
                {item.details.map((d, j) => (
                  <div
                    key={j}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i, d)}
                    onDragEnd={handleDragEnd}
                    style={{
                      background: "#FFFFFF",
                      border: `1px solid ${item.accent}50`,
                      borderRadius: 20,
                      padding: "3px 8px 3px 10px",
                      fontSize: 11.5,
                      color: "#333",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "grab",
                      opacity: dragItem?.detail === d && dragItem?.sourceIndex === i ? 0.4 : 1,
                      transition: "opacity 0.15s",
                      userSelect: "none",
                      fontStyle: d === "TBD" ? "italic" : "normal",
                    }}
                  >
                    {d}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDetail(i, d); }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        color: "#999",
                        padding: 0,
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {item.details.length === 0 && (
                  <span style={{
                    fontSize: 11,
                    color: "#bbb",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontStyle: "italic",
                  }}>
                    Drop details here
                  </span>
                )}
              </div>

              {/* Add detail input */}
              {editingCard === i && (
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <input
                    autoFocus
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addDetail(i); if (e.key === "Escape") setEditingCard(null); }}
                    placeholder="New detail..."
                    style={{
                      flex: 1,
                      fontSize: 11,
                      padding: "4px 8px",
                      border: `1px solid ${item.accent}60`,
                      borderRadius: 8,
                      background: "#fff",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => addDetail(i)}
                    style={{
                      background: item.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Helvetica Neue', sans-serif",
                    }}
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Note on hover */}
              {item.note && hovered === i && (
                <div style={{
                  marginTop: 10,
                  fontSize: 10.5,
                  color: item.accent,
                  fontFamily: "'Helvetica Neue', sans-serif",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}>
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Retired section */}
        <div style={{ marginTop: 36 }}>
          <button
            onClick={() => setShowRetired(!showRetired)}
            style={{
              background: "none",
              border: "2px solid #E05C5C",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 12,
              color: "#E05C5C",
              fontFamily: "'Helvetica Neue', sans-serif",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}
          >
            {showRetired ? "▲ Hide" : "▼ Show"} Retired Values ({retired.length})
          </button>

          {showRetired && (
            <div style={{
              marginTop: 14,
              background: "#FFF5F5",
              border: "2px solid #F5C0C0",
              borderRadius: 16,
              padding: "16px 20px",
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#C0392B",
                fontFamily: "'Helvetica Neue', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 12,
              }}>
                Deactivate in Salesforce — do not delete
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {retired.map((r, i) => (
                  <span key={i} style={{
                    background: "#FFFFFF",
                    border: "1px solid #F5C0C0",
                    borderRadius: 20,
                    padding: "3px 12px",
                    fontSize: 11.5,
                    color: "#C0392B",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    textDecoration: "line-through",
                    opacity: 0.8,
                  }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{
          marginTop: 24,
          fontSize: 11,
          color: "#bbb",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}>
          Changes are saved automatically to your browser. Export CSV to share with your team or import into Salesforce.
        </div>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    background: "none",
    border: `2px solid ${color}`,
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 12,
    color: color,
    fontFamily: "'Helvetica Neue', sans-serif",
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "0.3px",
    transition: "background 0.15s",
  };
}
