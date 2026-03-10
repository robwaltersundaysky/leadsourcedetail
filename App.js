import { useState, useEffect, useRef } from "react";

const DEFAULT_DATA = [
  { leadSource: "Content Syndication", color: "#E8F4FD", accent: "#5BA4CF", details: ["Demand Science", "StackAdapt"] },
  { leadSource: "Event", color: "#E8FAF0", accent: "#4CAF82", details: ["Tradeshow", "Webinar"] },
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
    details: ["Partner", "Customer", "Word of Mouth", "Employee", "Executive: Marc Zionts", "Board of Directors", "SundaySky Board of Advisors"],
  },
  { leadSource: "Social Media", color: "#FFF0F3", accent: "#E05C7A", details: ["LinkedIn", "Facebook", "Instagram", "Reddit", "X/Twitter*"] },
  { leadSource: "Website - Direct", color: "#F0FAF0", accent: "#5BAD6F", details: ["Intent", "GTM Buddy"] },
  { leadSource: "Paid Meeting", color: "#FEF5E7", accent: "#E8A838", details: ["TBD"], note: "Detail values to be confirmed" },
  { leadSource: "Existing Customer", color: "#F5F0FA", accent: "#8B5FB8", details: ["Customer", "SSKY Player - Customer Example"] },
  { leadSource: "Partner", color: "#E8F0FE", accent: "#4A7FE8", details: ["Partner: Agency", "Partner: Allied Solutions", "Partner: Merkle", "Partner: Other"] },
  { leadSource: "Email", color: "#F0FBF8", accent: "#3AAC8A", details: ["BDR", "Sales", "DemandZen"] },
  { leadSource: "Video", color: "#FFF0E8", accent: "#E87850", details: ["CTV - QR Code*"] },
];

const DEFAULT_RETIRED = [
  "RightBound", "LinkedIn Mining", "LinkedIn Sales Navigator",
  "Advisor: David Edelman", "Former Customer", "Customer: Unknown",
  "Prospecting (as detail)", "Prospecting - Other", "ZoomInfo",
];

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
      rows.push([item.leadSource, detail.replace("*", ""), isNew ? "New value" : ""]);
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

function PillLabel({ d }) {
  if (!d.endsWith("*")) return <span>{d}</span>;
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
      {d.replace("*", "")}
      <span style={{ fontSize: 9, color: "#E8884A", fontWeight: 700, lineHeight: 1 }}>*</span>
    </span>
  );
}

function btnStyle(color) {
  return {
    background: "none", border: `2px solid ${color}`, borderRadius: 8,
    padding: "7px 16px", fontSize: 12, color,
    fontFamily: "'Helvetica Neue', sans-serif", cursor: "pointer",
    fontWeight: 600, letterSpacing: "0.3px",
  };
}

export default function LeadSourceMap() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [retired, setRetired] = useState(DEFAULT_RETIRED);
  const [showRetired, setShowRetired] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newDetail, setNewDetail] = useState("");
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourcePalette, setNewSourcePalette] = useState(0);
  const saveTimeout = useRef(null);

  // Show saved indicator on any data change
  useEffect(() => {
    setSavedIndicator(true);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSavedIndicator(false), 1500);
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
      setDragItem(null); setDragOverIndex(null); return;
    }
    const newData = data.map((item) => ({ ...item, details: [...item.details] }));
    newData[dragItem.sourceIndex].details = newData[dragItem.sourceIndex].details.filter(d => d !== dragItem.detail);
    if (!newData[targetIndex].details.includes(dragItem.detail)) newData[targetIndex].details.push(dragItem.detail);
    setData(newData);
    setDragItem(null); setDragOverIndex(null);
  }

  function handleDragEnd() { setDragItem(null); setDragOverIndex(null); }

  function removeDetail(cardIndex, detail) {
    setData(data.map((item, i) => i !== cardIndex ? item : { ...item, details: item.details.filter(d => d !== detail) }));
  }

  function addDetail(cardIndex) {
    if (!newDetail.trim()) return;
    setData(data.map((item, i) => i !== cardIndex ? item : {
      ...item, details: item.details.includes(newDetail.trim()) ? item.details : [...item.details, newDetail.trim()]
    }));
    setNewDetail("");
  }

  function addLeadSource() {
    if (!newSourceName.trim()) return;
    const p = PALETTE[newSourcePalette];
    setData([...data, { leadSource: newSourceName.trim(), color: p.color, accent: p.accent, details: [] }]);
    setNewSourceName(""); setAddingSource(false);
  }

  function removeLeadSource(index) {
    if (window.confirm(`Remove "${data[index].leadSource}"? Its details will be lost.`))
      setData(data.filter((_, i) => i !== index));
  }

  function resetToDefault() {
    if (window.confirm("Reset all changes to default? This cannot be undone.")) {
      setData(DEFAULT_DATA); setRetired(DEFAULT_RETIRED);
    }
  }

  const hasAsterisks = data.some(item => item.details.some(d => d.endsWith("*")));

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#F7F6F3", minHeight: "100vh", padding: "28px 32px" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.5px", margin: 0 }}>
              Lead Source → Detail Mapping
            </h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 5, fontFamily: "'Helvetica Neue', sans-serif" }}>
              Drag detail pills between cards · Click + to add details · Click × to remove · Changes save automatically
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {savedIndicator && <span style={{ fontSize: 12, color: "#4CAF82", fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600 }}>✓ Saved</span>}
            <button onClick={() => setAddingSource(true)} style={btnStyle("#4CAF82")}>+ Add Lead Source</button>
            <button onClick={resetToDefault} style={btnStyle("#888")}>Reset</button>
            <button onClick={() => exportCSV(data)} style={btnStyle("#4A7FE8")}>Export CSV</button>
          </div>
        </div>

        {/* Add Lead Source Modal */}
        {addingSource && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: "'Helvetica Neue', sans-serif", color: "#1A1A1A" }}>Add New Lead Source</h2>
              <label style={{ fontSize: 12, fontFamily: "'Helvetica Neue', sans-serif", color: "#666", display: "block", marginBottom: 6 }}>Name</label>
              <input
                autoFocus value={newSourceName}
                onChange={e => setNewSourceName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLeadSource(); if (e.key === "Escape") setAddingSource(false); }}
                placeholder="e.g. Direct Mail"
                style={{ width: "100%", fontSize: 14, padding: "8px 12px", border: "2px solid #E0E0E0", borderRadius: 10, fontFamily: "'Helvetica Neue', sans-serif", outline: "none", marginBottom: 20, boxSizing: "border-box" }}
              />
              <label style={{ fontSize: 12, fontFamily: "'Helvetica Neue', sans-serif", color: "#666", display: "block", marginBottom: 8 }}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {PALETTE.map((p, i) => (
                  <div key={i} onClick={() => setNewSourcePalette(i)}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: p.accent, cursor: "pointer", border: newSourcePalette === i ? "3px solid #1A1A1A" : "3px solid transparent", transition: "border 0.1s" }} />
                ))}
              </div>
              <div style={{ background: PALETTE[newSourcePalette].color, border: `2px solid ${PALETTE[newSourcePalette].accent}`, borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", fontFamily: "'Helvetica Neue', sans-serif", color: "#1A1A1A" }}>
                  {newSourceName || "Preview"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setAddingSource(false)} style={btnStyle("#888")}>Cancel</button>
                <button onClick={addLeadSource} style={{ background: PALETTE[newSourcePalette].accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600 }}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {data.map((item, i) => (
            <div key={item.leadSource}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              onDragOver={e => handleDragOver(e, i)} onDrop={e => handleDrop(e, i)} onDragLeave={() => setDragOverIndex(null)}
              style={{
                background: item.color,
                border: `2px solid ${dragOverIndex === i ? item.accent : hovered === i ? item.accent + "80" : "transparent"}`,
                borderRadius: 16, padding: "16px 18px", transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: dragOverIndex === i ? `0 6px 24px ${item.accent}40` : hovered === i ? `0 3px 16px ${item.accent}25` : "0 1px 4px rgba(0,0,0,0.06)",
              }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1A1A", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                    {item.leadSource}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setEditingCard(editingCard === i ? null : i)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: item.accent, padding: "0 2px", lineHeight: 1, opacity: 0.8 }} title="Add detail">+</button>
                  <button onClick={() => removeLeadSource(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc", padding: "0 2px", lineHeight: 1 }} title="Remove lead source">×</button>
                </div>
              </div>

              <div style={{ height: 1, background: `${item.accent}35`, marginBottom: 10 }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 28 }}>
                {item.details.map((d, j) => (
                  <div key={j} draggable onDragStart={e => handleDragStart(e, i, d)} onDragEnd={handleDragEnd}
                    style={{
                      background: d.endsWith("*") ? "#FFF3E8" : "#FFFFFF", border: `1px solid ${d.endsWith("*") ? "#E8884A" : item.accent + "50"}`,
                      borderRadius: 20, padding: "3px 8px 3px 10px", fontSize: 11.5, color: d.endsWith("*") ? "#C45F0A" : "#333",
                      fontFamily: "'Helvetica Neue', sans-serif", display: "flex", alignItems: "center", gap: 4,
                      cursor: "grab", opacity: dragItem?.detail === d && dragItem?.sourceIndex === i ? 0.4 : 1,
                      transition: "opacity 0.15s", userSelect: "none", fontStyle: d === "TBD" ? "italic" : "normal",
                    }}>
                    <PillLabel d={d} />
                    <button onClick={e => { e.stopPropagation(); removeDetail(i, d); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#999", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }} title="Remove">×</button>
                  </div>
                ))}
                {item.details.length === 0 && <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Helvetica Neue', sans-serif", fontStyle: "italic" }}>Drop details here</span>}
              </div>

              {editingCard === i && (
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <input autoFocus value={newDetail} onChange={e => setNewDetail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addDetail(i); if (e.key === "Escape") setEditingCard(null); }}
                    placeholder="New detail... (add * for new value)"
                    style={{ flex: 1, fontSize: 11, padding: "4px 8px", border: `1px solid ${item.accent}60`, borderRadius: 8, background: "#fff", fontFamily: "'Helvetica Neue', sans-serif", outline: "none" }} />
                  <button onClick={() => addDetail(i)}
                    style={{ background: item.accent, color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Helvetica Neue', sans-serif" }}>Add</button>
                </div>
              )}

              {item.note && hovered === i && (
                <div style={{ marginTop: 10, fontSize: 10.5, color: item.accent, fontFamily: "'Helvetica Neue', sans-serif", fontStyle: "italic", lineHeight: 1.5 }}>
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {hasAsterisks && (
          <div style={{ marginTop: 14, fontSize: 11.5, color: "#E8884A", fontFamily: "'Helvetica Neue', sans-serif", fontStyle: "italic" }}>
            * New value — not yet in Salesforce picklist
          </div>
        )}

        {/* Retired */}
        <div style={{ marginTop: 32 }}>
          <button onClick={() => setShowRetired(!showRetired)}
            style={{ background: "none", border: "2px solid #E05C5C", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#E05C5C", fontFamily: "'Helvetica Neue', sans-serif", cursor: "pointer", fontWeight: 600, letterSpacing: "0.3px" }}>
            {showRetired ? "▲ Hide" : "▼ Show"} Retired Values ({retired.length})
          </button>
          {showRetired && (
            <div style={{ marginTop: 14, background: "#FFF5F5", border: "2px solid #F5C0C0", borderRadius: 16, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", fontFamily: "'Helvetica Neue', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Deactivate in Salesforce — do not delete
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {retired.map((r, i) => (
                  <span key={i} style={{ background: "#FFFFFF", border: "1px solid #F5C0C0", borderRadius: 20, padding: "3px 12px", fontSize: 11.5, color: "#C0392B", fontFamily: "'Helvetica Neue', sans-serif", textDecoration: "line-through", opacity: 0.8 }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "#bbb", fontFamily: "'Helvetic Neue', sans-serif" }}>
          Changes save automatically. Export CSV to share with your team or import into Salesforce.
        </div>
      </div>
    </div>
  );
}
