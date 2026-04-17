import { useState } from "react";
import api from "../../api/axios";

export default function PrescriptionForm({ patient }) {
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!patient) return null; // Don't show form if no patient selected

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicines.trim()) return alert("Medicines cannot be empty");
    setLoading(true);
    setSuccess(false);

    try {
      await api.post("/doctor/dashboard/prescription", {
        patientId: patient.patientId || patient.id, // Depending on queue object format
        medicines,
        notes
      });
      setSuccess(true);
      setMedicines("");
      setNotes("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error sending prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(11,120,100,0.05)" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#111827", fontSize: "1.125rem", fontWeight: 700 }}>
        Write Prescription for <span style={{ color: "var(--accent)" }}>{patient.patientName}</span>
      </h3>
      {success && <div style={{ padding: "12px", background: "rgba(16,185,129,0.1)", color: "#065f46", borderLeft: "4px solid #10b981", borderRadius: "4px", marginBottom: "16px", fontWeight: 500 }}>Prescription sent successfully!</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>Medicines *</label>
          <textarea
            required
            value={medicines}
            onChange={(e) => setMedicines(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", resize: "vertical", fontSize: "1rem", outline: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}
            placeholder="e.g. Paracetamol 500mg - 1 tablet after meals (3 days)"
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", resize: "vertical", fontSize: "1rem", outline: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}
            placeholder="Additional instructions like rest, diet, or follow-up schedule..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "14px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: loading ? "wait" : "pointer", fontWeight: 600, fontSize: "1rem", transition: "background 0.2s" }}
        >
          {loading ? "Sending..." : "Send Prescription"}
        </button>
      </form>
    </div>
  );
}