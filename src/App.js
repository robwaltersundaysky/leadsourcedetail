import { useState, useRef, useEffect } from "react";

const DEFAULT_DATA = [
  { leadSource: "Content Syndication", color: "#E8F4FD", accent: "#5BA4CF", details: ["Demand Science", "StackAdapt"] },
  { leadSource: "Event", color: "#E8FAF0", accent: "#4CAF82", details: ["Tradeshow", "Webinar", "In-Person*", "Virtual*"] },
  { leadSource: "Organic Search", color: "#FEF9E7", accent: "#D4AC0D", details: ["Google", "Bing", "Reddit"] },
  { leadSource: "Paid Search", color: "#FDF2FB", accent: "#C471B5", details: ["Google", "Bing"] },
  { leadSource: "Paid Social", color: "#EEF2FF", accent: "#6674CC", details: ["LinkedIn", "Facebook", "Instagram"] },
  {
    leadSource: "Prospecting", color: "#FFF3E8", accent: "#E8884A",
    details: ["BDR", "Sales*", "DemandZen", "Target Account"],
    note: "Lead Source Detail separates Marketing outbound (BDR, DemandZen) from Sales outbound (Sales). * = New value",
  },
  {
    leadSource: "Referral", color: "#F3EEF8", accent: "#9B6DC5",
    details: ["Partner", "Customer", "Word of Mouth", "Employee", "Board of Directors", "SundaySky Board of Advisors"],
  },
  { leadSource: "Social Media", color: "#FFF0F3", accent: "#E05C7A", details: ["LinkedIn", "Facebook", "Instagram", "Reddit", "X/Twitter"] },
  { leadSource: "Website - Direct", color: "#F0FAF0", accent: "#5BAD6F", details: ["Intent", "GTM Buddy"] },
  { leadSource: "Paid Meeting", color: "#FEF5E7", accent: "#E8A838", details: ["TBD"], note: "Detail values to be confirmed" },
  { leadSource: "Existing Customer", color: "#F5F0FA", accent: "#8B5FB8", details: ["Customer", "SSKY Player - Customer Example"] },
  { leadSource: "Partner", color: "#E8F0FE", accent: "#4A7FE8", details: ["Partner: Agency", "Partner: Allied Solutions", "Partner: Merkle", "Partner: Other"] },
  { leadSource: "Email", color: "#F0FBF8", accent: "#3AAC8A", details: ["BDR", "Sales", "DemandZen"] },
  { leadSource: "Video", color: "#FFF0E8", accent: "#E87850", details: ["CTV - QR Code*"] },
];

const DEFAULT_RETIRED = [
  "RightBound", "LinkedIn Mining", "LinkedIn Sales Navigator", "Executive: Marc Zionts",
  "Advisor: David Edelman", "Former Customer", "Customer: Unknown",
  "Prospecting (as detail)", "Prospecting - Other", "ZoomInfo",
];

const STORAGE_KEY = "lead-source-map-v3";

const PALETTE = [
  { color: "#E8F4FD", accent: "#5BA4CF" },
  { color: "#E8FAF0", accent: "#4CAF82" },
  { color: "#FEF9E7", accent: "#D4AC0D" },
  { color: "#FDF2FB", accent: "#C471B5" },
  { color: "#EEF2FF", accent: "#6674CC" },
  { color: "#FFF3E8", accent: "#E8884A" },
  { color: "#F3EEF8", accent: "#9B6DC5" },
  { color: "#FFF0F3", accent: "#E05C7A" },
  { color: "#F0FAF0", accent: "#5BAD6F" },
  { color: "#FEF5E7", accent: "#E8A838" },
  { color: "#F5F0FA", accent: "#8B5FB8" },
  { color: "#E8F0FE", accent: "#4A7FE8" },
  { color: "#F0FBF8", accent: "#3AAC8A" },
  { color: "#FFF0E8", accent: "#E87850" },
];

function exportCSV(data) {
  const rows = [["Lead Source", "Lead Source Detail", "Notes"]];
  data.forEach((item) => {
    item.details.forEach((detail) => {
      const isNew = detail.endsWith("*");
      rows.push([item.leadSource, detail.replace("*", ""), isNew ? "New value — not yet in Salesforce" : ""]);
    });
  });
  const csv = rows.map((r) => r.map((c) => '"' + c + '"').join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lead-source-mapping.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).data;
    } catch (e) {}
    return DEFAULT_DATA;
  });
  const [retired, setRetired] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).retired;
    } catch (e) {}
    return DEFAULT_RETIRED;
  });

  const [showRetired, setShowRetired] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [newDetail, setNewDetail] = useState("");
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourcePalette, setNewSourcePalette] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [zoom, setZoom] = useState(1);
  const saveTimeout = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, retired }));
    } catch (e) {}
    setSavedFlash(true);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSavedFlash(false), 1400);
  }, [data, retired]);

  function handleDragStart(e, sourceIndex, detail) {
    setDragItem({ sourceIndex, detail });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (!dragItem || dragItem.sourceIndex === targetIndex) {
      setDragItem(null);
      setDragOverIndex(null);
      return;
    }
    const next = data.map((item, i) => {
      if (i === dragItem.sourceIndex) return { ...item, details: item.details.filter((d) => d !== dragItem.detail) };
      if (i === targetIndex) return { ...item, details: [...item.details, dragItem.detail] };
      return item;
    });
    setData(next);
    setDragItem(null);
    setDragOverIndex(null);
  }

  function removeDetail(cardIndex, detail) {
    setData(data.map((item, i) => i === cardIndex ? { ...item, details: item.details.filter((d) => d !== detail) } : item));
  }

  function addDetail(cardIndex) {
    const val = newDetail.trim();
    if (!val) return;
    setData(data.map((item, i) => i === cardIndex ? { ...item, details: [...item.details, val] } : item));
    setNewDetail("");
    setEditingCard(null);
  }

  function removeCard(cardIndex) {
    setData(data.filter((_, i) => i !== cardIndex));
  }

  function addLeadSource() {
    const name = newSourceName.trim();
    if (!name) return;
    const p = PALETTE[newSourcePalette];
    setData([...data, { leadSource: name, color: p.color, accent: p.accent, details: [] }]);
    setNewSourceName("");
    setAddingSource(false);
  }

  const font = "'Helvetica Neue', Arial, sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", fontFamily: font }}>
      {/* Zoom control bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#F7F6F3", borderBottom: "1px solid #e8e8e8", padding: "8px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: font, fontWeight: 600, whiteSpace: "nowrap" }}>Zoom</span>
        <input
          type="range" min="0.7" max="2" step="0.05" value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          style={{ width: 140, accentColor: "#5BA4CF", cursor: "pointer" }}
        />
        <span style={{ fontSize: 11, color: "#888", fontFamily: font, width: 36 }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(1)} style={{ fontSize: 10, color: "#aaa", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontFamily: font }}>Reset</button>
      </div>
      <div style={{ padding: "32px 28px", transformOrigin: "top left", transform: "scale(" + zoom + ")", width: "calc(100% / " + zoom + ")" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.3px" }}>
            Lead Source &rarr; Detail Mapping
          </h1>
          <p style={{ fontSize: 12, color: "#888", margin: "5px 0 0", fontWeight: 400 }}>
            Drag detail pills between cards to reassign. Click &times; to remove. Changes save automatically.
            {savedFlash && <span style={{ color: "#4CAF82", marginLeft: 8, fontWeight: 600 }}>&#10003; Saved</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { if (window.confirm("Reset to default data? This cannot be undone.")) { setData(DEFAULT_DATA); setRetired(DEFAULT_RETIRED); } }}
            style={{ background: "none", border: "2px solid #ccc", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#666", fontFamily: font, cursor: "pointer", fontWeight: 600 }}
          >Reset</button>
          <button
            onClick={() => exportCSV(data)}
            style={{ background: "none", border: "2px solid #5BA4CF", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#5BA4CF", fontFamily: font, cursor: "pointer", fontWeight: 600 }}
          >Export CSV</button>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {data.map((item, i) => (
          <div
            key={i}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
            onDrop={(e) => handleDrop(e, i)}
            style={{
              background: item.color,
              border: "1.5px solid " + (dragOverIndex === i ? item.accent : item.accent + "40"),
              borderRadius: 14,
              padding: "14px 14px 16px",
              transition: "border-color 0.15s",
            }}
          >
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.accent, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: item.accent, letterSpacing: "0.6px", textTransform: "uppercase" }}>
                  {item.leadSource}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setEditingCard(editingCard === i ? null : i)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: item.accent, padding: 0, lineHeight: 1 }} title="Add detail">+</button>
                <button onClick={() => removeCard(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#bbb", padding: 0, lineHeight: 1 }} title="Remove card">&times;</button>
              </div>
            </div>

            {/* Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 28 }}>
              {item.details.map((d, j) => {
                const isNew = d.endsWith("*");
                const label = isNew ? d.slice(0, -1) : d;
                return (
                  <div
                    key={j}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i, d)}
                    onDragEnd={() => { setDragItem(null); setDragOverIndex(null); }}
                    style={{
                      background: isNew ? "#FFF3E8" : "#FFFFFF",
                      border: "1px solid " + (isNew ? "#E8884A" : item.accent + "50"),
                      borderRadius: 20,
                      padding: "3px 8px 3px 10px",
                      fontSize: 11.5,
                      color: isNew ? "#C45F0A" : "#333",
                      fontFamily: font,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "grab",
                      userSelect: "none",
                      fontStyle: d === "TBD" ? "italic" : "normal",
                    }}
                  >
                    <span>{label}</span>
                    {isNew && <span style={{ fontSize: 9, color: "#E8884A", fontWeight: 700, lineHeight: 1 }}>*</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDetail(i, d); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#999", padding: 0, lineHeight: 1 }}
                    >&times;</button>
                  </div>
                );
              })}
              {item.details.length === 0 && (
                <span style={{ fontSize: 11, color: "#bbb", fontFamily: font, fontStyle: "italic" }}>Drop details here</span>
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
                  placeholder="Detail value (add * for new)"
                  style={{ flex: 1, fontSize: 11.5, border: "1px solid " + item.accent + "80", borderRadius: 6, padding: "4px 8px", fontFamily: font, outline: "none" }}
                />
                <button onClick={() => addDetail(i)}
                  style={{ fontSize: 11.5, background: item.accent, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: font }}>Add</button>
              </div>
            )}

            {/* Note */}
            {item.note && (
              <p style={{ fontSize: 10.5, color: item.accent, marginTop: 10, marginBottom: 0, lineHeight: 1.5, fontStyle: "italic" }}>{item.note}</p>
            )}
          </div>
        ))}

        {/* Add Lead Source card */}
        {!addingSource ? (
          <div
            onClick={() => setAddingSource(true)}
            style={{ border: "2px dashed #ccc", borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 80, color: "#aaa", fontSize: 13, fontFamily: font }}
          >+ Add Lead Source</div>
        ) : (
          <div style={{ background: "#fff", border: "1.5px solid #ccc", borderRadius: 14, padding: 14 }}>
            <input
              autoFocus
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addLeadSource(); if (e.key === "Escape") setAddingSource(false); }}
              placeholder="Lead Source name"
              style={{ width: "100%", fontSize: 12, border: "1px solid #ddd", borderRadius: 6, padding: "5px 8px", fontFamily: font, marginBottom: 10, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {PALETTE.map((p, idx) => (
                <div key={idx} onClick={() => setNewSourcePalette(idx)}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: p.accent, cursor: "pointer", border: newSourcePalette === idx ? "2px solid #333" : "2px solid transparent" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={addLeadSource}
                style={{ fontSize: 11.5, background: PALETTE[newSourcePalette].accent, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: font }}>Add</button>
              <button onClick={() => setAddingSource(false)}
                style={{ fontSize: 11.5, background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: font, color: "#666" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Retired section */}
      <div style={{ marginTop: 28 }}>
        <button
          onClick={() => setShowRetired(!showRetired)}
          style={{ background: "none", border: "2px solid #E05C7A", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#E05C7A", fontFamily: font, cursor: "pointer", fontWeight: 600 }}
        >{showRetired ? "▼" : "▶"} Show Retired Values ({retired.length})</button>

        {showRetired && (
          <div style={{ marginTop: 12, background: "#fff", border: "1.5px solid #eee", borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 10px", fontStyle: "italic" }}>
              Deactivate in Salesforce — do not delete
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {retired.map((r, i) => (
                <span key={i} style={{ fontSize: 11.5, color: "#aaa", textDecoration: "line-through", background: "#f7f7f7", border: "1px solid #eee", borderRadius: 20, padding: "3px 10px", fontFamily: font }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 10.5, color: "#bbb", margin: 0 }}>
          Changes are saved automatically to your browser. Export CSV to share with your team or import into Salesforce.
        </p>
        <p style={{ fontSize: 10.5, color: "#bbb", margin: 0 }}>
          <span style={{ background: "#FFF3E8", border: "1px solid #E8884A", borderRadius: 10, padding: "1px 7px", color: "#C45F0A", fontWeight: 600 }}>*</span>
          {" "}New value — not yet in Salesforce picklist
        </p>
      </div>
      </div>
    </div>
  );
}
