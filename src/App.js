import { useState, useRef, useEffect } from "react";

// ─── LEAD SOURCE DATA ───────────────────────────────────────────────────────

const DEFAULT_DATA = [
  { leadSource: "Content Syndication", color: "#E8F4FD", accent: "#5BA4CF", details: ["Demand Science"] },
  { leadSource: "Event", color: "#E8FAF0", accent: "#4CAF82", details: ["Tradeshow", "Webinar", "1:1 Meetings", "Partner"] },
  { leadSource: "Organic Search", color: "#FEF9E7", accent: "#D4AC0D", details: ["Google", "Bing", "ChatGPT", "Perplexity", "Claude"] },
  { leadSource: "Paid Search", color: "#FDF2FB", accent: "#C471B5", details: ["Google", "Bing"] },
  { leadSource: "Paid Social", color: "#EEF2FF", accent: "#6674CC", details: ["LinkedIn", "Facebook", "Instagram", "Reddit"] },
  {
    leadSource: "Prospecting", color: "#FFF3E8", accent: "#E8884A",
    details: ["BDR", "Sales*", "DemandZen"],
    note: "Lead Source Detail separates Marketing outbound (BDR, DemandZen) from Sales outbound (Sales). * = New value",
  },
  {
    leadSource: "Referral", color: "#F3EEF8", accent: "#9B6DC5",
    details: ["Word of Mouth", "Employee", "Board of Directors", "ELT", "Advisory Board"],
  },
  { leadSource: "Social Media", color: "#FFF0F3", accent: "#E05C7A", details: ["LinkedIn", "Facebook", "Instagram", "Reddit", "X/Twitter"] },
  { leadSource: "Existing Customer", color: "#F5F0FA", accent: "#8B5FB8", details: ["Customer Referral", "SSKY Player"] },
  { leadSource: "Partner", color: "#E8F0FE", accent: "#4A7FE8", details: ["Partner: Agency", "Partner: Allied Solutions", "Partner: Other"] },
  { leadSource: "Display Advertising", color: "#FFF0E8", accent: "#E87850", details: ["Programmatic", "CTV - QR Code*"] },
  { leadSource: "Intent", color: "#F0FBF8", accent: "#3AAC8A", details: ["RB2B"] },
  { leadSource: "Third-Party Data", color: "#F0FAF0", accent: "#5BAD6F", details: ["ZoomInfo", "SalesIntel"] },
];

const DEFAULT_RETIRED = [
  "RightBound", "LinkedIn Mining", "LinkedIn Sales Navigator", "Executive: Marc Zionts",
  "Advisor: David Edelman", "Former Customer", "Customer: Unknown",
  "Prospecting (as detail)", "Prospecting - Other", "ZoomInfo",
];

const MAP_STORAGE_KEY = "lead-source-map-v4";
const CHECKLIST_KEY = "sf-checklist-v1";

const PALETTE = [
  { color: "#E8F4FD", accent: "#5BA4CF" }, { color: "#E8FAF0", accent: "#4CAF82" },
  { color: "#FEF9E7", accent: "#D4AC0D" }, { color: "#FDF2FB", accent: "#C471B5" },
  { color: "#EEF2FF", accent: "#6674CC" }, { color: "#FFF3E8", accent: "#E8884A" },
  { color: "#F3EEF8", accent: "#9B6DC5" }, { color: "#FFF0F3", accent: "#E05C7A" },
  { color: "#F0FAF0", accent: "#5BAD6F" }, { color: "#FEF5E7", accent: "#E8A838" },
  { color: "#F5F0FA", accent: "#8B5FB8" }, { color: "#E8F0FE", accent: "#4A7FE8" },
  { color: "#F0FBF8", accent: "#3AAC8A" }, { color: "#FFF0E8", accent: "#E87850" },
];

// ─── CHECKLIST DATA ──────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "p1", title: "Phase 1 — Lead Source Detail Picklist", color: "#5BA4CF",
    items: [
      { id: "p1-1", label: "Add new picklist value: Sales (under Prospecting)", tag: "new" },
      { id: "p1-2", label: "Add new picklist value: CTV - QR Code (under Display Advertising)", tag: "new" },
      { id: "p1-3", label: "Add new picklist value: 1:1 Meetings (under Event)", tag: "new" },
      { id: "p1-4", label: "Add new picklist value: ChatGPT (under Organic Search)", tag: "new" },
      { id: "p1-5", label: "Add new picklist value: Perplexity (under Organic Search)", tag: "new" },
      { id: "p1-6", label: "Add new picklist value: Claude (under Organic Search)", tag: "new" },
      { id: "p1-7", label: "Add new picklist value: ELT (under Referral)", tag: "new" },
      { id: "p1-8", label: "Add new picklist value: Advisory Board (under Referral)", tag: "new" },
      { id: "p1-9", label: "Add new picklist value: Customer Referral (under Existing Customer)", tag: "new" },
      { id: "p1-10", label: "Add new Lead Source: Display Advertising (with values: Programmatic, CTV - QR Code)", tag: "new" },
      { id: "p1-11", label: "Add new Lead Source: Intent (with value: RB2B)", tag: "new" },
      { id: "p1-12", label: "Add new Lead Source: Third-Party Data (with values: ZoomInfo, SalesIntel)", tag: "new" },
      { id: "p1-13", label: "Confirm X/Twitter is live ✓ (already done)" },
      { id: "p1-14", label: "Deactivate (do NOT delete): RightBound" },
      { id: "p1-15", label: "Deactivate (do NOT delete): LinkedIn Mining" },
      { id: "p1-16", label: "Deactivate (do NOT delete): LinkedIn Sales Navigator" },
      { id: "p1-17", label: "Deactivate (do NOT delete): Executive: Marc Zionts" },
      { id: "p1-18", label: "Deactivate (do NOT delete): Advisor: David Edelman" },
      { id: "p1-19", label: "Deactivate (do NOT delete): Former Customer" },
      { id: "p1-20", label: "Deactivate (do NOT delete): Customer: Unknown" },
      { id: "p1-21", label: "Deactivate (do NOT delete): Prospecting (as detail)" },
      { id: "p1-22", label: "Deactivate (do NOT delete): Prospecting - Other" },
      { id: "p1-23", label: "Deactivate (do NOT delete): In-Person (if previously added)" },
      { id: "p1-24", label: "Deactivate (do NOT delete): Virtual (if previously added)" },
      { id: "p1-25", label: "Deactivate (do NOT delete): Target Account (under Prospecting)" },
      { id: "p1-26", label: "Deactivate (do NOT delete): StackAdapt (under Content Syndication)" },
      { id: "p1-27", label: "Deactivate (do NOT delete): Partner: Merkle (under Partner)" },
      { id: "p1-28", label: "Deactivate (do NOT delete): Website - Direct lead source" },
      { id: "p1-29", label: "Deactivate (do NOT delete): Paid Meeting lead source" },
      { id: "p1-30", label: "Deactivate (do NOT delete): Email lead source" },
      { id: "p1-31", label: "Deactivate (do NOT delete): Video lead source" },
    ]
  },
  {
    id: "p2", title: "Phase 2 — Dependent Picklist Setup", color: "#9B6DC5",
    items: [
      { id: "p2-1", label: "Enable dependent picklist: Lead Source → Lead Source Detail" },
      { id: "p2-2", label: "Map each Lead Source Detail value to its correct Lead Source parent per the mapping app" },
      { id: "p2-3", label: "Test all mappings in sandbox before pushing to production" },
    ]
  },
  {
    id: "p3", title: "Phase 3 — New Fields", color: "#4CAF82",
    items: [
      { id: "p3-1", label: "Create field: MQL Lead Source (picklist, Contact)", tag: "new" },
      { id: "p3-2", label: "Create field: MQL Lead Source Detail (picklist, Contact)", tag: "new" },
      { id: "p3-3", label: "Create field: MQL Date (date, Contact)", tag: "new" },
      { id: "p3-4", label: "Create field: Created by BDR? (checkbox, Opportunity)", tag: "new" },
      { id: "p3-5", label: "Create field: Which BDR (lookup to User, Opportunity)", tag: "new" },
      { id: "p3-6", label: "Create field: Sourced By (picklist, Opportunity — values: Marketing, Sales, Referral)", tag: "new" },
    ]
  },
  {
    id: "p4", title: "Phase 4 — Automation", color: "#E8884A",
    items: [
      { id: "p4-1", label: "Build flow: on MQL checkbox = TRUE → set MQL Lead Source, MQL Lead Source Detail, MQL Date", tag: "pending" },
      { id: "p4-2", label: "Build flow: at Opportunity creation → set Lead Source based on Created by BDR? → MQL check → fallback logic", tag: "pending" },
      { id: "p4-3", label: "Build flow: at Opportunity creation → set Sourced By based on Lead Source Detail value", tag: "pending" },
      { id: "p4-4", label: "Build flow: uncheck MQL after decay window with no Opportunity created (confirm window with Eric first)", tag: "pending" },
    ]
  },
  {
    id: "p5", title: "Phase 5 — Validation & Testing", color: "#E05C7A",
    items: [
      { id: "p5-1", label: "Test inbound demo path (Created by BDR = false) → Sourced By = Marketing" },
      { id: "p5-2", label: "Test SDR-created opp with recent MQL → Sourced By = Marketing" },
      { id: "p5-3", label: "Test SDR-created opp with no MQL → fallback to Contact Lead Source Detail" },
      { id: "p5-4", label: "Test Sales detail value → Sourced By = Sales" },
      { id: "p5-5", label: "Test BDR/DemandZen detail values → Sourced By = Marketing" },
      { id: "p5-6", label: "Confirm retired values are hidden from UI but historical data preserved" },
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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
  a.href = url; a.download = "lead-source-mapping.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

function Nav({ page, setPage }) {
  const font = "'Helvetica Neue', Arial, sans-serif";
  return (
    <div style={{ background: "#fff", borderBottom: "1.5px solid #eee", padding: "0 28px", display: "flex", gap: 0, fontFamily: font }}>
      {[["map", "Lead Source Map"], ["checklist", "SF Checklist"]].map(([id, label]) => (
        <button key={id} onClick={() => setPage(id)} style={{
          background: "none", border: "none", borderBottom: page === id ? "2px solid #5BA4CF" : "2px solid transparent",
          padding: "12px 18px", fontSize: 12.5, fontWeight: page === id ? 700 : 400,
          color: page === id ? "#5BA4CF" : "#888", cursor: "pointer", fontFamily: font, marginBottom: -1.5,
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── CHECKLIST PAGE ──────────────────────────────────────────────────────────

function ChecklistPage() {
  const font = "'Helvetica Neue', Arial, sans-serif";
  const [checked, setChecked] = useState(() => {
    try { const s = localStorage.getItem(CHECKLIST_KEY); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
  });
  const [openPhases, setOpenPhases] = useState({ p1: true, p2: true, p3: true, p4: true, p5: true });

  useEffect(() => {
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked)); } catch(e) {}
  }, [checked]);

  const total = PHASES.reduce((a, p) => a + p.items.length, 0);
  const done = PHASES.reduce((a, p) => a + p.items.filter(i => checked[i.id]).length, 0);
  const pct = total ? Math.round(done / total * 100) : 0;

  function toggle(id) { setChecked(prev => ({ ...prev, [id]: !prev[id] })); }
  function togglePhase(id) { setOpenPhases(prev => ({ ...prev, [id]: !prev[id] })); }

  return (
    <div style={{ padding: "28px 28px", fontFamily: font, maxWidth: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>Salesforce Implementation Checklist</h1>
          <p style={{ fontSize: 12, color: "#888", margin: "4px 0 16px" }}>Changes save automatically to your browser.</p>
        </div>
        <button onClick={() => { if (window.confirm("Reset all checkboxes?")) setChecked({}); }}
          style={{ fontSize: 11, color: "#bbb", background: "none", border: "1px solid #eee", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: font }}>
          Reset all
        </button>
      </div>

      {/* Progress */}
      <div style={{ background: "#eee", borderRadius: 99, height: 8, marginBottom: 6 }}>
        <div style={{ background: "#4CAF82", height: 8, borderRadius: 99, width: pct + "%", transition: "width 0.3s" }} />
      </div>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 20 }}>{done} of {total} complete ({pct}%)</p>

      {/* Open items warning */}
      <div style={{ background: "#FEF9E7", border: "1.5px solid #D4AC0D40", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#b8860b", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>
          ⚠ Open Items — Resolve Before Phase 4
        </div>
        {["Confirm MQL decay window (60 days?) with Eric", "Decide MQL attribution expiry for Opportunity credit (90 days? 6 months? 1 year?)", "Confirm Paid Meeting detail values (which vendor?)"].map((t, i) => (
          <div key={i} style={{ fontSize: 12.5, color: "#7a6200", padding: "4px 0" }}>⚠ {t}</div>
        ))}
      </div>

      {/* Phases */}
      {PHASES.map(phase => {
        const phaseDone = phase.items.filter(i => checked[i.id]).length;
        const isOpen = openPhases[phase.id];
        return (
          <div key={phase.id} style={{ background: "#fff", border: "1.5px solid #eee", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => togglePhase(phase.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: phase.color, display: "inline-block" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#333", letterSpacing: "0.3px" }}>{phase.title}</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>{phaseDone}/{phase.items.length}</span>
              </div>
              <span style={{ fontSize: 10, color: "#bbb", transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
            </div>
            {isOpen && (
              <div style={{ padding: "0 16px 12px" }}>
                {phase.items.map(item => (
                  <div key={item.id} onClick={() => toggle(item.id)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderTop: "1px solid #f5f5f5", cursor: "pointer" }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      background: checked[item.id] ? "#4CAF82" : "none",
                      border: "2px solid " + (checked[item.id] ? "#4CAF82" : "#ddd"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked[item.id] && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12.5, color: checked[item.id] ? "#bbb" : "#555", textDecoration: checked[item.id] ? "line-through" : "none", lineHeight: 1.5 }}>
                      {item.label}
                      {item.tag === "new" && <span style={{ marginLeft: 6, fontSize: 10, background: "#FFF3E8", color: "#C45F0A", border: "1px solid #E8884A", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>NEW</span>}
                      {item.tag === "pending" && <span style={{ marginLeft: 6, fontSize: 10, background: "#FEF9E7", color: "#b8860b", border: "1px solid #D4AC0D", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>PENDING</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── LEAD SOURCE MAP PAGE ────────────────────────────────────────────────────

function MapPage() {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(MAP_STORAGE_KEY); if (s) return JSON.parse(s).data; } catch(e) {}
    return DEFAULT_DATA;
  });
  const [retired, setRetired] = useState(() => {
    try { const s = localStorage.getItem(MAP_STORAGE_KEY); if (s) return JSON.parse(s).retired; } catch(e) {}
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
  const font = "'Helvetica Neue', Arial, sans-serif";

  useEffect(() => {
    try { localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify({ data, retired })); } catch(e) {}
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
    if (!dragItem || dragItem.sourceIndex === targetIndex) { setDragItem(null); setDragOverIndex(null); return; }
    setData(data.map((item, i) => {
      if (i === dragItem.sourceIndex) return { ...item, details: item.details.filter(d => d !== dragItem.detail) };
      if (i === targetIndex) return { ...item, details: [...item.details, dragItem.detail] };
      return item;
    }));
    setDragItem(null); setDragOverIndex(null);
  }

  function removeDetail(ci, detail) { setData(data.map((item, i) => i === ci ? { ...item, details: item.details.filter(d => d !== detail) } : item)); }
  function addDetail(ci) {
    const val = newDetail.trim(); if (!val) return;
    setData(data.map((item, i) => i === ci ? { ...item, details: [...item.details, val] } : item));
    setNewDetail(""); setEditingCard(null);
  }
  function removeCard(ci) { setData(data.filter((_, i) => i !== ci)); }
  function addLeadSource() {
    const name = newSourceName.trim(); if (!name) return;
    const p = PALETTE[newSourcePalette];
    setData([...data, { leadSource: name, color: p.color, accent: p.accent, details: [] }]);
    setNewSourceName(""); setAddingSource(false);
  }

  return (
    <div style={{ fontFamily: font }}>
      {/* Zoom bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#F7F6F3", borderBottom: "1px solid #e8e8e8", padding: "8px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Zoom</span>
        <input type="range" min="0.7" max="2" step="0.05" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))}
          style={{ width: 140, accentColor: "#5BA4CF", cursor: "pointer" }} />
        <span style={{ fontSize: 11, color: "#888", width: 36 }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(1)} style={{ fontSize: 10, color: "#aaa", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontFamily: font }}>Reset</button>
      </div>

      <div style={{ padding: "32px 28px", transformOrigin: "top left", transform: "scale(" + zoom + ")", width: "calc(100% / " + zoom + ")" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.3px" }}>Lead Source &rarr; Detail Mapping</h1>
            <p style={{ fontSize: 12, color: "#888", margin: "5px 0 0" }}>
              Drag detail pills between cards to reassign. Click &times; to remove. Changes save automatically.
              {savedFlash && <span style={{ color: "#4CAF82", marginLeft: 8, fontWeight: 600 }}>&#10003; Saved</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { if (window.confirm("Reset to default data?")) { setData(DEFAULT_DATA); setRetired(DEFAULT_RETIRED); } }}
              style={{ background: "none", border: "2px solid #ccc", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#666", fontFamily: font, cursor: "pointer", fontWeight: 600 }}>Reset</button>
            <button onClick={() => exportCSV(data)}
              style={{ background: "none", border: "2px solid #5BA4CF", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#5BA4CF", fontFamily: font, cursor: "pointer", fontWeight: 600 }}>Export CSV</button>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {data.map((item, i) => (
            <div key={i} onDragOver={e => { e.preventDefault(); setDragOverIndex(i); }} onDrop={e => handleDrop(e, i)}
              style={{ background: item.color, border: "1.5px solid " + (dragOverIndex === i ? item.accent : item.accent + "40"), borderRadius: 14, padding: "14px 14px 16px", transition: "border-color 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.accent, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.accent, letterSpacing: "0.6px", textTransform: "uppercase" }}>{item.leadSource}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditingCard(editingCard === i ? null : i)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: item.accent, padding: 0, lineHeight: 1 }}>+</button>
                  <button onClick={() => removeCard(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#bbb", padding: 0, lineHeight: 1 }}>&times;</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 28 }}>
                {item.details.map((d, j) => {
                  const isNew = d.endsWith("*");
                  const label = isNew ? d.slice(0, -1) : d;
                  return (
                    <div key={j} draggable onDragStart={e => handleDragStart(e, i, d)} onDragEnd={() => { setDragItem(null); setDragOverIndex(null); }}
                      style={{ background: isNew ? "#FFF3E8" : "#FFFFFF", border: "1px solid " + (isNew ? "#E8884A" : item.accent + "50"), borderRadius: 20, padding: "3px 8px 3px 10px", fontSize: 11.5, color: isNew ? "#C45F0A" : "#333", fontFamily: font, display: "flex", alignItems: "center", gap: 4, cursor: "grab", userSelect: "none", fontStyle: d === "TBD" ? "italic" : "normal" }}>
                      <span>{label}</span>
                      {isNew && <span style={{ fontSize: 9, color: "#E8884A", fontWeight: 700, lineHeight: 1 }}>*</span>}
                      <button onClick={e => { e.stopPropagation(); removeDetail(i, d); }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#999", padding: 0, lineHeight: 1 }}>&times;</button>
                    </div>
                  );
                })}
                {item.details.length === 0 && <span style={{ fontSize: 11, color: "#bbb", fontFamily: font, fontStyle: "italic" }}>Drop details here</span>}
              </div>
              {editingCard === i && (
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <input autoFocus value={newDetail} onChange={e => setNewDetail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addDetail(i); if (e.key === "Escape") setEditingCard(null); }}
                    placeholder="Detail value (add * for new)"
                    style={{ flex: 1, fontSize: 11.5, border: "1px solid " + item.accent + "80", borderRadius: 6, padding: "4px 8px", fontFamily: font, outline: "none" }} />
                  <button onClick={() => addDetail(i)}
                    style={{ fontSize: 11.5, background: item.accent, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: font }}>Add</button>
                </div>
              )}
              {item.note && <p style={{ fontSize: 10.5, color: item.accent, marginTop: 10, marginBottom: 0, lineHeight: 1.5, fontStyle: "italic" }}>{item.note}</p>}
            </div>
          ))}

          {!addingSource ? (
            <div onClick={() => setAddingSource(true)}
              style={{ border: "2px dashed #ccc", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 80, color: "#aaa", fontSize: 13, fontFamily: font }}>
              + Add Lead Source
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1.5px solid #ccc", borderRadius: 14, padding: 14 }}>
              <input autoFocus value={newSourceName} onChange={e => setNewSourceName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLeadSource(); if (e.key === "Escape") setAddingSource(false); }}
                placeholder="Lead Source name"
                style={{ width: "100%", fontSize: 12, border: "1px solid #ddd", borderRadius: 6, padding: "5px 8px", fontFamily: font, marginBottom: 10, boxSizing: "border-box" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {PALETTE.map((p, idx) => (
                  <div key={idx} onClick={() => setNewSourcePalette(idx)}
                    style={{ width: 20, height: 20, borderRadius: "50%", background: p.accent, cursor: "pointer", border: newSourcePalette === idx ? "2px solid #333" : "2px solid transparent" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addLeadSource} style={{ fontSize: 11.5, background: PALETTE[newSourcePalette].accent, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: font }}>Add</button>
                <button onClick={() => setAddingSource(false)} style={{ fontSize: 11.5, background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: font, color: "#666" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Retired */}
        <div style={{ marginTop: 28 }}>
          <button onClick={() => setShowRetired(!showRetired)}
            style={{ background: "none", border: "2px solid #E05C7A", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#E05C7A", fontFamily: font, cursor: "pointer", fontWeight: 600 }}>
            {showRetired ? "▼" : "▶"} Show Retired Values ({retired.length})
          </button>
          {showRetired && (
            <div style={{ marginTop: 12, background: "#fff", border: "1.5px solid #eee", borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 10px", fontStyle: "italic" }}>Deactivate in Salesforce — do not delete</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {retired.map((r, i) => (
                  <span key={i} style={{ fontSize: 11.5, color: "#aaa", textDecoration: "line-through", background: "#f7f7f7", border: "1px solid #eee", borderRadius: 20, padding: "3px 10px", fontFamily: font }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 10.5, color: "#bbb", margin: 0 }}>Changes are saved automatically to your browser. Export CSV to share with your team or import into Salesforce.</p>
          <p style={{ fontSize: 10.5, color: "#bbb", margin: 0 }}>
            <span style={{ background: "#FFF3E8", border: "1px solid #E8884A", borderRadius: 10, padding: "1px 7px", color: "#C45F0A", fontWeight: 600 }}>*</span>
            {" "}New value — not yet in Salesforce picklist
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("map");
  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3" }}>
      <Nav page={page} setPage={setPage} />
      {page === "map" ? <MapPage /> : <ChecklistPage />}
    </div>
  );
}
