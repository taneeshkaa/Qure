import { useState } from "react";
import api from "../../api/axios";

export default function DoctorHeader({ profile, onToggleAvailability }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await api.patch("/doctor/dashboard/availability");
      onToggleAvailability(res.isAvailable);
    } catch (err) {
      console.error(err);
      alert("Error toggling availability");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Loading Profile...</div>;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", marginBottom: "24px" }}>
      <div>
        <h2 style={{ margin: "0 0 4px 0", color: "#111827", fontSize: "1.25rem" }}>{profile.name}</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>{profile.specialization} &bull; {profile.hospital?.name}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: profile.isAvailable ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", padding: "6px 12px", borderRadius: "20px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: profile.isAvailable ? "#10b981" : "#ef4444", boxShadow: profile.isAvailable ? "0 0 8px #10b981" : "0 0 8px #ef4444" }} />
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: profile.isAvailable ? "#047857" : "#b91c1c" }}>
            {profile.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        <button 
          onClick={handleToggle} 
          disabled={loading} 
          style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: loading ? "wait" : "pointer", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s" }}
        >
          Toggle Availability
        </button>
      </div>
    </div>
  );
}