import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import api from "../../api/axios";
import { 
  Bell, CheckCircle, Clock, Calendar, User, Droplet, 
  Activity, Phone, Plus, Trash2, ChevronRight, FileText, Send, Save, AlertCircle
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
  : "http://localhost:5000";

// --- Subcomponents ---

const Counter = ({ from, to }) => {
  const [count, setCount] = useState(from);
  useEffect(() => {
    let start = from;
    const end = parseInt(to);
    if (start === end) return;
    let totalMilSecDur = 1000;
    let incrementTime = (totalMilSecDur / end) * 2;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [from, to]);
  return <span>{count}</span>;
};

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalToday: 0, completed: 0, pending: 0, upcoming: 0 });
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState("today"); // today, upcoming, past
  const [activePatient, setActivePatient] = useState(null);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [rightTab, setRightTab] = useState("overview");

  // Prescription Form State
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfileAndStats = async () => {
    try {
      const [profRes, statsRes] = await Promise.all([
        api.get("/doctor/dashboard/me"),
        api.get("/doctor/dashboard/stats")
      ]);
      setProfile(profRes?.data);
      setStats(statsRes?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const res = await api.get(`/doctor/dashboard/appointments?filter=${filter}`);
      setQueue(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchAppointmentDetails = async (apptId) => {
    try {
      const res = await api.get(`/doctor/dashboard/appointments/${apptId}`);
      const data = res?.data;
      setActivePatient(data);
      
      // Load prescription if exists
      if (data.prescription) {
        setMedicines(data.prescription.medicines || []);
        setTests(data.prescription.tests || []);
        setDiagnosis(data.prescription.diagnosis || "");
        setDoctorNotes(data.prescription.doctorNotes || "");
        setPrescriptionSent(data.prescription.sentToPharmacy);
      } else {
        setMedicines([]);
        setTests([]);
        setDiagnosis("");
        setDoctorNotes("");
        setPrescriptionSent(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on("connect", () => {
      if (profile?.hospital_id) {
        socket.emit("join-hospital", profile.hospital_id);
      }
    });

    socket.on("queue:updated", (data) => {
      fetchQueue();
      fetchProfileAndStats(); // Update stats
      showToast("New patient added to your queue");
    });

    return () => socket.disconnect();
  }, [profile]);

  const toggleAvailability = async () => {
    try {
      const res = await api.patch("/doctor/dashboard/availability");
      setProfile(prev => ({ ...prev, is_available: res?.data?.is_available }));
    } catch (err) {
      console.error(err);
    }
  };

  const completeActiveAppt = async () => {
    if (!activePatient) return;
    try {
      await api.patch(`/doctor/dashboard/appointments/${activePatient.id}/complete`);
      showToast("Appointment Completed");
      fetchQueue();
      fetchProfileAndStats();
      setActivePatient(null);
    } catch (err) {
      console.error(err);
    }
  };

  const savePrescription = async (sendToPharmacy = false) => {
    if (!activePatient) return;
    setIsSavingPrescription(true);
    try {
      const res = await api.post("/doctor/dashboard/prescriptions", {
        appointmentId: activePatient.id,
        medicines,
        tests,
        diagnosis,
        doctorNotes
      });
      
      if (sendToPharmacy) {
        await api.patch(`/doctor/dashboard/prescriptions/${res?.data?.id}/send-to-pharmacy`);
        setPrescriptionSent(true);
        showToast("Prescription sent to pharmacy!");
      } else {
        showToast("Draft saved!");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving prescription");
    } finally {
      setIsSavingPrescription(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const glassCard = "bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(at 0% 0%, hsla(169,100%,94%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(208,100%,94%,1) 0px, transparent 50%)" }}>
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2"
          >
            <Bell size={18} />
            <span className="font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Navbar */}
        <header className={`${glassCard} p-4 px-6 flex items-center justify-between mb-8`}>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              Dr. {profile?.full_name}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {profile?.specialization} • {profile?.hospital?.hospital_name}
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="relative cursor-pointer text-gray-400 hover:text-teal-600 transition-colors">
                <Bell size={24} />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {stats.pending}
                  </span>
                )}
             </div>
             
             {/* Availability Pill */}
             <button 
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  profile?.is_available 
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 border border-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)]" 
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
             >
                <div className={`w-2.5 h-2.5 rounded-full ${profile?.is_available ? "bg-teal-500 animate-pulse" : "bg-gray-400"}`}></div>
                {profile?.is_available ? "Available" : "Away"}
             </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Today" count={stats.totalToday} icon={<Activity size={24} className="text-teal-500" />} color="teal" />
            <StatCard title="Completed" count={stats.completed} icon={<CheckCircle size={24} className="text-emerald-500" />} color="emerald" />
            <StatCard title="Pending" count={stats.pending} icon={<Clock size={24} className="text-amber-500" />} color="amber" />
            <StatCard title="Upcoming" count={stats.upcoming} icon={<Calendar size={24} className="text-blue-500" />} color="blue" />
        </div>

        {/* Main 60/40 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
            
            {/* Left Col: Queue */}
            <div className="flex flex-col gap-6">
                
                {/* Call Next Button */}
                {activePatient && activePatient.status !== "COMPLETED" && (
                  <button 
                    onClick={completeActiveAppt}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                     Mark Complete & Move Queue
                  </button>
                )}

                <div className={`${glassCard} p-6 flex flex-col h-[700px] overflow-hidden flex-1`}>
                    {/* Tabs */}
                    <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6">
                        {["today", "upcoming", "past"].map((f) => (
                           <button 
                             key={f}
                             onClick={() => setFilter(f)}
                             className={`flex-1 capitalize py-2.5 text-sm font-medium rounded-lg transition-all ${filter === f ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                           >
                             {f}
                           </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                       {loadingQueue ? (
                         <div className="space-y-4">
                           {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200/50 rounded-xl animate-pulse"></div>)}
                         </div>
                       ) : queue.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Clock size={48} className="mb-4 opacity-50" />
                            <p>No appointments found for {filter}</p>
                         </div>
                       ) : (
                         <AnimatePresence>
                           {queue.map((appt, i) => (
                             <motion.div
                               key={appt.id}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: i * 0.05 }}
                               onClick={() => fetchAppointmentDetails(appt.id)}
                               className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                                 activePatient?.id === appt.id 
                                  ? "bg-teal-50/50 border-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.15)]" 
                                  : "bg-white/60 border-gray-100 hover:border-teal-200 hover:shadow-md"
                               }`}
                             >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                       activePatient?.id === appt.id ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-700"
                                     }`}>
                                        {appt.token_number}
                                     </div>
                                     <div>
                                        <h3 className="font-semibold text-gray-800">{appt.patient?.full_name}</h3>
                                        <p className="text-xs text-gray-500">{appt.patient?.age} yrs • {appt.patient?.gender}</p>
                                     </div>
                                  </div>
                                  {activePatient?.id === appt.id && appt.status !== "COMPLETED" && (
                                     <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-md font-medium border border-teal-200">
                                       In Consultation
                                     </span>
                                  )}
                                  {appt.status === "COMPLETED" && (
                                     <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-medium">Completed</span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg text-sm border border-gray-50">
                                  <div className="text-gray-600 truncate max-w-[180px]">
                                    <span className="text-teal-600 font-medium mr-1">Reason:</span>
                                    {appt.problem_description}
                                  </div>
                                  <div className="font-medium text-gray-700">{appt.slot}</div>
                                </div>
                             </motion.div>
                           ))}
                         </AnimatePresence>
                       )}
                    </div>
                </div>
            </div>

            {/* Right Col: Patient Panel */}
            <div className={`${glassCard} flex flex-col h-[700px] overflow-hidden`}>
               {!activePatient ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8">
                   <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100">
                     <User size={48} className="text-teal-300" />
                   </div>
                   <h2 className="text-xl font-semibold text-gray-800 mb-2">Select a patient</h2>
                   <p className="text-gray-500 max-w-sm">Click on a patient from the queue to view their medical profile, write prescriptions, and check booking details.</p>
                 </div>
               ) : (
                 <>
                   {/* Panel Header */}
                   <div className="p-6 border-b border-gray-100 bg-white/40">
                      <div className="flex justify-between items-start">
                         <div>
                            <h2 className="text-2xl font-bold text-gray-800">{activePatient.patient.full_name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Token #{activePatient.token_number} • {activePatient.slot}</p>
                         </div>
                         <div className="flex gap-2">
                            {["overview", "prescription", "details"].map(tab => (
                              <button 
                                key={tab}
                                onClick={() => setRightTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                                  rightTab === tab ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                                }`}
                              >
                                {tab === "details" ? "Booking Info" : tab}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Panel Content Area */}
                   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                     <AnimatePresence mode="wait">
                       
                       {/* TAB 1: OVERVIEW */}
                       {rightTab === "overview" && (
                         <motion.div key="overview" initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                            {/* Health Vitals Card */}
                            <div className="bg-gradient-to-br from-white to-teal-50/30 p-5 rounded-2xl border border-teal-100/50 flex gap-8 mb-8 shadow-sm">
                               <div>
                                 <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Age</p>
                                 <p className="text-lg font-bold text-gray-800">{activePatient.patient.age} Yrs</p>
                               </div>
                               <div>
                                 <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Gender</p>
                                 <p className="text-lg font-bold text-gray-800">{activePatient.patient.gender}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Droplet size={12}/> Blood</p>
                                 <p className="text-lg font-bold text-red-500">{activePatient.patient.blood_group || "N/A"}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Phone size={12}/> Contact</p>
                                 <p className="text-lg font-bold text-gray-800">{activePatient.patient.phone}</p>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                               <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                  <h4 className="flex items-center gap-2 text-red-700 font-semibold mb-3"><AlertCircle size={16}/> Allergies</h4>
                                  <div className="flex flex-wrap gap-2">
                                     {activePatient.patient.allergies?.length > 0 ? activePatient.patient.allergies.map((al, idx) => (
                                       <span key={idx} className="bg-red-100 text-red-600 px-3 py-1 text-xs font-medium rounded-md">{al}</span>
                                     )) : <span className="text-sm text-red-400">No known allergies</span>}
                                  </div>
                               </div>
                               <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                  <h4 className="flex items-center gap-2 text-amber-700 font-semibold mb-3"><Activity size={16}/> Chronic Conditions</h4>
                                  <div className="flex flex-wrap gap-2">
                                     {activePatient.patient.chronic_conditions?.length > 0 ? activePatient.patient.chronic_conditions.map((cc, idx) => (
                                       <span key={idx} className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-medium rounded-md">{cc}</span>
                                     )) : <span className="text-sm text-amber-600/70">No chronic conditions</span>}
                                  </div>
                               </div>
                            </div>

                            {/* Past Visits */}
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 px-1">
                               <Clock size={18} className="text-teal-500" /> Past Visits with You
                            </h4>
                            <div className="space-y-4">
                               {activePatient.pastVisits?.length > 0 ? activePatient.pastVisits.map((visit) => (
                                 <div key={visit.id} className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-teal-100 last:before:bg-transparent">
                                    <div className="absolute left-[3px] top-2 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-white shadow-sm"></div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                       <div className="flex justify-between items-center mb-2">
                                          <span className="font-semibold text-gray-800">{new Date(visit.date).toLocaleDateString()}</span>
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{visit.problem_description}</span>
                                       </div>
                                       {visit.prescription?.diagnosis && (
                                         <p className="text-sm text-gray-600"><span className="font-medium text-teal-700">Diagnosis:</span> {visit.prescription.diagnosis}</p>
                                       )}
                                    </div>
                                 </div>
                               )) : (
                                 <p className="text-sm text-gray-500 italic pl-1">No previous visits recorded.</p>
                               )}
                            </div>
                         </motion.div>
                       )}

                       {/* TAB 2: PRESCRIPTION */}
                       {rightTab === "prescription" && (
                         <motion.div key="rx" initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="flex flex-col h-full">
                            
                            {prescriptionSent && (
                              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                   <CheckCircle size={18} />
                                   <span className="font-medium text-sm">Prescription sent to pharmacy</span>
                                 </div>
                                 <span className="text-xs bg-emerald-100 px-2 py-1 rounded font-bold">SENT</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-8 mb-6">
                               {/* Medicines List */}
                               <div>
                                  <div className="flex justify-between items-center mb-3">
                                     <h4 className="font-bold text-gray-700 flex items-center gap-2"><Plus size={16} className="text-teal-500"/> Medicines</h4>
                                     <button onClick={() => setMedicines([...medicines, {name: "", dosage: "", frequency: "Once daily", duration: "", instructions: ""}])} className="text-teal-600 text-xs hover:bg-teal-50 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors">
                                       Add <Plus size={12}/>
                                     </button>
                                  </div>
                                  <div className="space-y-3">
                                    {medicines.map((med, idx) => (
                                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 relative group">
                                         <button onClick={() => setMedicines(medicines.filter((_,i) => i !== idx))} className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                         <input type="text" placeholder="Medicine Name" className="w-full text-sm font-semibold mb-2 border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400" value={med.name} onChange={(e) => {const newM = [...medicines]; newM[idx].name = e.target.value; setMedicines(newM);}} />
                                         <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Dosage (e.g. 500mg)" className="text-xs border rounded p-1.5 focus:border-teal-400 outline-none" value={med.dosage} onChange={(e) => {const newM = [...medicines]; newM[idx].dosage = e.target.value; setMedicines(newM);}} />
                                            <select className="text-xs border rounded p-1.5 focus:border-teal-400 outline-none text-gray-600" value={med.frequency} onChange={(e) => {const newM = [...medicines]; newM[idx].frequency = e.target.value; setMedicines(newM);}}>
                                              <option>Once daily</option><option>Twice daily</option><option>Thrice daily</option><option>As needed</option>
                                            </select>
                                         </div>
                                         <div className="grid grid-cols-[1fr_2fr] gap-2 mt-2">
                                            <input type="text" placeholder="Days" className="text-xs border rounded p-1.5 focus:border-teal-400 outline-none" value={med.duration} onChange={(e) => {const newM = [...medicines]; newM[idx].duration = e.target.value; setMedicines(newM);}} />
                                            <input type="text" placeholder="Instructions" className="text-xs border rounded p-1.5 focus:border-teal-400 outline-none" value={med.instructions} onChange={(e) => {const newM = [...medicines]; newM[idx].instructions = e.target.value; setMedicines(newM);}} />
                                         </div>
                                      </div>
                                    ))}
                                    {medicines.length === 0 && <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">No medicines added</div>}
                                  </div>
                               </div>

                               {/* Tests List */}
                               <div>
                                  <div className="flex justify-between items-center mb-3">
                                     <h4 className="font-bold text-gray-700 flex items-center gap-2"><Activity size={16} className="text-teal-500"/> Lab Tests</h4>
                                     <button onClick={() => setTests([...tests, {testName: "", notes: ""}])} className="text-teal-600 text-xs hover:bg-teal-50 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors">
                                       Add <Plus size={12}/>
                                     </button>
                                  </div>
                                  <div className="space-y-3">
                                    {tests.map((test, idx) => (
                                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 relative group">
                                         <button onClick={() => setTests(tests.filter((_,i) => i !== idx))} className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                         <input type="text" placeholder="Test Name" className="w-full text-sm font-semibold mb-2 border-b border-gray-100 pb-1 focus:border-teal-400 outline-none placeholder-gray-400" value={test.testName} onChange={(e) => {const newT = [...tests]; newT[idx].testName = e.target.value; setTests(newT);}} />
                                         <input type="text" placeholder="Notes/Reason" className="w-full text-xs outline-none text-gray-600" value={test.notes} onChange={(e) => {const newT = [...tests]; newT[idx].notes = e.target.value; setTests(newT);}} />
                                      </div>
                                    ))}
                                    {tests.length === 0 && <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">No tests prescribed</div>}
                                  </div>
                               </div>
                            </div>

                            {/* Diagnosis & Notes */}
                            <div className="grid grid-cols-2 gap-8 mb-6 mt-auto">
                               <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Diagnosis</label>
                                 <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none h-24" placeholder="Enter clinical diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)}></textarea>
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes (Internal)</label>
                                 <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none h-24" placeholder="Additional observations..." value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}></textarea>
                               </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                               <button 
                                 onClick={() => savePrescription(false)}
                                 disabled={isSavingPrescription}
                                 className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition flex items-center gap-2"
                               >
                                 <Save size={16}/> {isSavingPrescription ? "Saving..." : "Save Draft"}
                               </button>
                               <button 
                                 onClick={() => savePrescription(true)}
                                 disabled={prescriptionSent || isSavingPrescription}
                                 className="relative overflow-hidden group px-8 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-400 text-white font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 <span className="absolute w-0 h-full bg-white/20 top-0 left-0 -skew-x-12 transition-all duration-500 group-hover:w-full"></span>
                                 <Send size={16}/> {prescriptionSent ? "Sent to Pharmacy" : "Send to Pharmacy"}
                               </button>
                            </div>
                         </motion.div>
                       )}

                       {/* TAB 3: BOOKING DETAILS */}
                       {rightTab === "details" && (
                         <motion.div key="details" initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                               <h3 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                                 <FileText size={18} className="text-teal-500" /> Patient's Booking Input
                               </h3>
                               <div className="space-y-6">
                                  <div>
                                     <p className="text-xs uppercase font-bold text-gray-400 mb-1">Reason For Visit</p>
                                     <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">{activePatient.problem_description}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                       <p className="text-xs uppercase font-bold text-gray-400 mb-1">Appointment Slot</p>
                                       <p className="text-gray-800 font-medium">{new Date(activePatient.date).toLocaleDateString()} • {activePatient.slot}</p>
                                    </div>
                                    <div>
                                       <p className="text-xs uppercase font-bold text-gray-400 mb-1">Token Number</p>
                                       <p className="text-teal-600 font-bold text-xl">#{activePatient.token_number}</p>
                                    </div>
                                  </div>
                                  <div>
                                     <p className="text-xs uppercase font-bold text-gray-400 mb-1">Booked On</p>
                                     <p className="text-gray-600 text-sm">{new Date(activePatient.createdAt).toLocaleString()}</p>
                                  </div>
                               </div>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </>
               )}
            </div>
        </div>

      </div>
    </div>
  );
}

// Custom Stat Card
const StatCard = ({ title, count, icon, color }) => {
  const colors = {
    teal: "from-teal-50/50 to-teal-100/30 text-teal-700 border-teal-200",
    emerald: "from-emerald-50/50 to-emerald-100/30 text-emerald-700 border-emerald-200",
    amber: "from-amber-50/50 to-amber-100/30 text-amber-700 border-amber-200",
    blue: "from-blue-50/50 to-blue-100/30 text-blue-700 border-blue-200",
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} p-5 rounded-2xl border shadow-sm flex items-center justify-between backdrop-blur-md transition-transform hover:-translate-y-1`}
    >
       <div>
         <p className="text-sm font-semibold opacity-80 mb-1">{title}</p>
         <h3 className="text-3xl font-bold font-sans tracking-tight">
           <Counter from={0} to={count} />
         </h3>
       </div>
       <div className={`w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shadow-inner`}>
         {icon}
       </div>
    </motion.div>
  );
};