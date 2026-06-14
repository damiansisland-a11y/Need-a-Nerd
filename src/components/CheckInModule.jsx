import React, { useState, useEffect, useMemo } from 'react';
import { Settings, RefreshCw, X, Plus, Trash2, Users, PieChart, GripHorizontal } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- DEFAULT CONFIGURATIONS ---
const defaultFeelings = [
  { id: "happy", emoji: "😊", label: "Happy", help: "Feeling good", colour: "#22c55e" },
  { id: "excited", emoji: "🤩", label: "Excited", help: "Big energy", colour: "#f97316" },
  { id: "calm", emoji: "😌", label: "Calm", help: "Relaxed / okay", colour: "#3b82f6" },
  { id: "worried", emoji: "😟", label: "Worried", help: "Something on my mind", colour: "#eab308" },
  { id: "sad", emoji: "😢", label: "Sad", help: "Feeling low", colour: "#6366f1" },
  { id: "tired", emoji: "🥱", label: "Tired", help: "Low energy", colour: "#a855f7" },
  { id: "angry", emoji: "😠", label: "Angry", help: "Cross / mad", colour: "#ef4444" },
  { id: "sick", emoji: "🤢", label: "Sick", help: "Body not okay", colour: "#10b981" }
];

const defaultStudents = [
  { id: "s1", name: "Student 1", photoDataUrl: null },
  { id: "s2", name: "Student 2", photoDataUrl: null },
  { id: "s3", name: "Student 3", photoDataUrl: null },
  { id: "s4", name: "Student 4", photoDataUrl: null },
  { id: "s7", name: "Damian", photoDataUrl: null }
];

export default function CheckInModule({ user, db }) {
  // --- STATE ---
  const [students, setStudents] = useState(defaultStudents);
  const [feelings, setFeelings] = useState(defaultFeelings);
  
  // Votes mapping: studentId -> feelingId
  const [studentVotes, setStudentVotes] = useState({});
  // Anonymous votes: feelingId -> count
  const [anonymousVotes, setAnonymousVotes] = useState({});
  
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready for check-in.");

  // --- AUDIO (Safe fallback) ---
  const playSound = (type) => {
    try {
      const src = type === 'student' ? '/assets/select-student.mp3' : '/assets/select-feeling.mp3';
      const audio = new Audio(src);
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Catch silent failures if asset is missing
    } catch (e) {}
  };

  // --- FIREBASE SYNC ---
  const appId = 'portfolio-engine';

  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'checkin_state', 'current');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIsRemoteUpdate(true);
        if (data.students) setStudents(data.students);
        if (data.feelings) setFeelings(data.feelings);
        if (data.studentVotes) setStudentVotes(data.studentVotes);
        if (data.anonymousVotes) setAnonymousVotes(data.anonymousVotes);
      }
    }, (error) => {
      console.error("Sync error:", error);
    });

    return () => unsubscribe();
  }, [user, db]);

  // Debounced save to Firebase
  useEffect(() => {
    if (!user || !db || isRemoteUpdate) {
      setIsRemoteUpdate(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'checkin_state', 'current');
      setDoc(docRef, {
        students,
        feelings,
        studentVotes,
        anonymousVotes,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [students, feelings, studentVotes, anonymousVotes, user, db]);

  // --- DERIVED STATS ---
  const stats = useMemo(() => {
    const counts = {};
    feelings.forEach(f => counts[f.id] = 0);
    
    // Tally student votes
    Object.values(studentVotes).forEach(feelingId => {
      if (counts[feelingId] !== undefined) counts[feelingId]++;
    });
    
    // Tally anonymous votes
    Object.entries(anonymousVotes).forEach(([feelingId, count]) => {
      if (counts[feelingId] !== undefined) counts[feelingId] += count;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }, [studentVotes, anonymousVotes, feelings]);

  // --- INTERACTION HANDLERS ---
  const handleStudentClick = (studentId) => {
    setActiveStudentId(studentId === activeStudentId ? null : studentId);
    if (studentId !== activeStudentId) playSound('student');
  };

  const handleFeelingClick = (feelingId) => {
    const feeling = feelings.find(f => f.id === feelingId);
    
    if (activeStudentId) {
      setStudentVotes(prev => ({ ...prev, [activeStudentId]: feelingId }));
      setActiveStudentId(null);
      setStatusMessage(`${students.find(s => s.id === activeStudentId)?.name} is feeling ${feeling?.label}.`);
    } else {
      setAnonymousVotes(prev => ({ ...prev, [feelingId]: (prev[feelingId] || 0) + 1 }));
      setStatusMessage(`Anonymous check-in: ${feeling?.label}.`);
    }
    playSound('feeling');
  };

  const handleDragStart = (e, studentId) => {
    e.dataTransfer.setData("studentId", studentId);
    setActiveStudentId(studentId);
  };

  const handleDrop = (e, feelingId) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("studentId");
    if (studentId) {
      const feeling = feelings.find(f => f.id === feelingId);
      setStudentVotes(prev => ({ ...prev, [studentId]: feelingId }));
      setActiveStudentId(null);
      setStatusMessage(`${students.find(s => s.id === studentId)?.name} is feeling ${feeling?.label}.`);
      playSound('feeling');
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear all current check-ins?")) {
      setStudentVotes({});
      setAnonymousVotes({});
      setActiveStudentId(null);
      setStatusMessage("Poll reset. Ready for check-in.");
    }
  };

  // --- RENDERERS ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="text-indigo-500" /> Student Check-in
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{statusMessage}</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold rounded-full hover:bg-rose-100 transition-colors"
            >
              <RefreshCw size={18} /> Reset
            </button>
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={18} /> Setup
            </button>
          </div>
        </div>

        {/* Students Strip */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tap student, then tap feeling (or drag & drop)</p>
          <div className="flex gap-4 pb-4 min-w-max">
            {students.map(student => {
              const currentFeelingId = studentVotes[student.id];
              const feelingColor = currentFeelingId ? feelings.find(f => f.id === currentFeelingId)?.colour : 'transparent';
              const isActive = activeStudentId === student.id;

              return (
                <div 
                  key={student.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, student.id)}
                  onClick={() => handleStudentClick(student.id)}
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-2' : 'hover:scale-105'}`}
                >
                  <div 
                    className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center border-4 transition-all"
                    style={{ 
                      backgroundImage: student.photoDataUrl ? `url(${student.photoDataUrl})` : 'none',
                      borderColor: isActive ? '#6366f1' : (currentFeelingId ? feelingColor : 'transparent'),
                      boxShadow: currentFeelingId && !isActive ? `0 0 15px ${feelingColor}40` : 'none'
                    }}
                  >
                    {!student.photoDataUrl && <Users className="w-8 h-8 m-3 text-slate-400" />}
                  </div>
                  <span className={`text-sm font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {student.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Feelings Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {feelings.map(feeling => {
              const count = stats.counts[feeling.id];
              return (
                <button
                  key={feeling.id}
                  onClick={() => handleFeelingClick(feeling.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, feeling.id)}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-transparent shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  style={{ '--hover-color': feeling.colour }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = feeling.colour}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  {/* Subtle background glow based on feeling color */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: feeling.colour }}></div>
                  
                  <div className="text-5xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">{feeling.emoji}</div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{feeling.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{feeling.help}</p>
                  
                  {/* Vote Badge */}
                  {count > 0 && (
                    <div 
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm shadow-md animate-in zoom-in"
                      style={{ backgroundColor: feeling.colour }}
                    >
                      {count}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Legend */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <PieChart className="text-indigo-500" /> Current Overview
            </h3>
            
            {stats.total === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-500 font-medium">No check-ins yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500 uppercase">Total Responses</span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total}</span>
                </div>
                
                {feelings.map(feeling => {
                  const count = stats.counts[feeling.id];
                  if (count === 0) return null;
                  const percentage = Math.round((count / stats.total) * 100);
                  
                  return (
                    <div key={`stat-${feeling.id}`} className="space-y-1">
                      <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-2">{feeling.emoji} {feeling.label}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%`, backgroundColor: feeling.colour }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SETUP MODAL */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                <Settings className="text-indigo-500"/> Roster & Config
              </h2>
              <button onClick={() => setIsSetupOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500">
                <X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow space-y-8">
              {/* Roster Setup */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Roster</h3>
                  <button 
                    onClick={() => setStudents([...students, { id: `s${Date.now()}`, name: `New Student`, photoDataUrl: null }])}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full"
                  >
                    <Plus size={16}/> Add Student
                  </button>
                </div>
                <div className="space-y-3">
                  {students.map((student, idx) => (
                    <div key={student.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <GripHorizontal className="text-slate-400 cursor-move hidden md:block" size={16} />
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: student.photoDataUrl ? `url(${student.photoDataUrl})` : 'none' }}></div>
                      <input 
                        type="text" 
                        value={student.name}
                        onChange={(e) => {
                          const newStudents = [...students];
                          newStudents[idx].name = e.target.value;
                          setStudents(newStudents);
                        }}
                        className="flex-grow bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold"
                      />
                      <button 
                        onClick={() => {
                          setStudents(students.filter(s => s.id !== student.id));
                          const newVotes = { ...studentVotes };
                          delete newVotes[student.id];
                          setStudentVotes(newVotes);
                        }}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button 
                onClick={() => setIsSetupOpen(false)}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}