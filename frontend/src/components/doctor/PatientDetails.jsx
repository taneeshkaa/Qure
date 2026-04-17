export default function PatientDetails({ patient }) {
  if (!patient) {
    return (
      <div style={{ padding: "32px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", textAlign: "center", color: "#6b7280", border: "2px dashed #e5e7eb" }}>
        Select a patient from the queue to view details
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)", marginBottom: "24px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#111827", fontSize: "1.125rem", fontWeight: 700 }}>Patient Details</h3>
      <div style={{ display: "grid", gap: "16px", background: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>Name</span>
          <div style={{ fontWeight: 600, color: "#111827" }}>{patient.patientName}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>Token Number</span>
          <div style={{ fontWeight: 600, color: "var(--accent)" }}>#{patient.token}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>Status</span>
          <div style={{ fontWeight: 600, color: "#111827" }}>{patient.status}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>Symptom Notes</span>
          <div style={{ fontWeight: 400, color: "#4b5563", fontSize: "0.95rem", background: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
            {patient.notes || "No additional notes provided."}
          </div>
        </div>
      </div>
    </div>
  );
}