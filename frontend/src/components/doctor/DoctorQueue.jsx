import { useState } from "react";
import api from "../../api/axios";

export default function DoctorQueue({ queue, onSelectPatient }) {
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (id, action) => {
    setLoadingAction(id);
    try {
      await api.patch(`/doctor/dashboard/queue/${id}`, { action });
      // Socket.io will trigger parent state update automatically
    } catch (err) {
      console.error(err);
      alert("Error updating queue");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!queue || queue.length === 0) {
    return <div style={{ padding: "24px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", color: "#6b7280", textAlign: "center" }}>No patients in the queue today.</div>;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "WAITING": return { bg: "#fef3c7", text: "#92400e" };
      case "IN_PROGRESS": return { bg: "#d1fae5", text: "#065f46" };
      case "COMPLETED": return { bg: "#e0e7ff", text: "#1e40af" };
      case "SKIPPED": return { bg: "#fee2e2", text: "#991b1b" };
      default: return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", padding: "24px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#111827", fontSize: "1.125rem", fontWeight: 700 }}>Today's Queue</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {queue.map(entry => {
          const colors = getStatusColor(entry.status);
          return (
            <div 
              key={entry.id} 
              onClick={() => onSelectPatient(entry)} 
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: entry.status === "IN_PROGRESS" ? "2px solid var(--accent)" : "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", background: entry.status === "IN_PROGRESS" ? "rgba(11,120,100,0.02)" : "#fff", transition: "all 0.2s" }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "1.125rem", color: "#111827" }}>#{entry.token}</strong>
                  <span style={{ fontSize: "1rem", color: "#374151", fontWeight: 500 }}>{entry.patientName}</span>
                </div>
                <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, background: colors.bg, color: colors.text }}>
                  {entry.status}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "8px" }}>
                {entry.status !== "COMPLETED" && entry.status !== "SKIPPED" && (
                  <>
                    <button 
                      disabled={loadingAction === entry.id} 
                      onClick={(e) => { e.stopPropagation(); handleAction(entry.id, "CALL_NEXT") }} 
                      style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
                    >
                      Call Next
                    </button>
                    <button 
                      disabled={loadingAction === entry.id} 
                      onClick={(e) => { e.stopPropagation(); handleAction(entry.id, "COMPLETE") }} 
                      style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
                    >
                      Complete
                    </button>
                    <button 
                      disabled={loadingAction === entry.id} 
                      onClick={(e) => { e.stopPropagation(); handleAction(entry.id, "SKIP") }} 
                      style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}