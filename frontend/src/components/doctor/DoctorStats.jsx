export default function DoctorStats({ queue = [] }) {
  const total = queue?.length || 0;
  const completed = queue?.filter(q => q.status === "COMPLETED")?.length || 0;
  const pending = queue?.filter(q => q.status === "WAITING" || q.status === "IN_PROGRESS")?.length || 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
      <div style={{ padding: "24px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent)" }}>{total}</div>
        <div style={{ color: "#6b7280", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Total Today</div>
      </div>
      <div style={{ padding: "24px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", textAlign: "center", borderLeft: "4px solid #10b981", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#10b981" }}>{completed}</div>
        <div style={{ color: "#6b7280", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Completed</div>
      </div>
      <div style={{ padding: "24px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", textAlign: "center", borderLeft: "4px solid #f59e0b", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f59e0b" }}>{pending}</div>
        <div style={{ color: "#6b7280", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Pending</div>
      </div>
    </div>
  );
}