
import { useState, useEffect, useRef } from "react";

// --- NOTION DATABASE IDS -----------------------------------------------------
const NOTION_DBS = {
  patients: "a1c93e3769b948e396fd62cb579eb82d",
  visits: "45d6909837154fe2bdb81d293305f49b",
  finance: "a7eb8139a90c4a408da241cb5e149e70",
  images: "a1cda07ed0e24f66b49c641a3d92c175",
  learning: "42b5a0de7c8242c2bc5146b5b55585a8",
};

// --- MOCK DATA ----------------------------------------------------------------
const MOCK_PATIENTS = [
  {
    id: "p001", name: "林美玲", dob: "1980-05-12", phone: "0912-345-678",
    gender: "female", vip: true, referralSource: "朋友介紹", bloodType: "A",
    allergy: "Penicillin", personality: "細心有點焦慮,每次需要多解釋步驟",
    complaints: ["對假牙顏色很在意", "怕痛,需要多打麻藥"],
    tags: ["全瓷冠", "前牙美學", "DSD"],
    totalSelfPay: 185000, status: "active",
    nextVisit: "2026-03-18", referralCount: 3,
    avatar: null,
    medicalHistory: "高血壓(控制中)",
    currentTreatments: [
      { item: "前牙全瓷冠 6顆", fee: 120000, status: "agreed", scheduledDate: "2026-03-18", tooth: "#11-16", progress: 30 },
      { item: "DSD 美學設計", fee: 15000, status: "completed", tooth: "", progress: 100 },
    ],
    visitSummary: "病患主訴前牙美觀,DSD完成,正進行全瓷冠製作中"
  },
  {
    id: "p002", name: "陳志明", dob: "1975-09-23", phone: "0923-456-789",
    gender: "male", vip: false, referralSource: "網路搜尋", bloodType: "O",
    allergy: "無", personality: "話不多,決定快,不喜歡聽太多解釋",
    complaints: ["右下後牙疼痛已久"],
    tags: ["根管治療", "全瓷冠"],
    totalSelfPay: 42000, status: "active",
    nextVisit: "2026-03-20", referralCount: 0,
    medicalHistory: "無特殊",
    currentTreatments: [
      { item: "右下第一大臼齒根管治療", fee: 12000, status: "in_progress", scheduledDate: "2026-03-20", tooth: "#46", progress: 60 },
      { item: "全瓷冠 #46", fee: 18000, status: "considering", tooth: "#46", progress: 0 },
    ],
    visitSummary: "右下#46根管治療中,第二次複診"
  },
  {
    id: "p003", name: "王雅婷", dob: "1992-01-15", phone: "0934-567-890",
    gender: "female", vip: true, referralSource: "自費項目多", bloodType: "B",
    allergy: "無", personality: "非常積極主動,對美觀要求高,預算充足",
    complaints: ["全口重建需求", "咬合不正"],
    tags: ["全口重建", "矯正", "前牙美學", "牙周病"],
    totalSelfPay: 680000, status: "active",
    nextVisit: "2026-03-15", referralCount: 5,
    medicalHistory: "無",
    currentTreatments: [
      { item: "全口重建 Phase 1 - 牙周治療", fee: 80000, status: "in_progress", tooth: "全口", progress: 80 },
      { item: "矯正治療", fee: 180000, status: "agreed", tooth: "全口", progress: 10 },
      { item: "前牙美學重建", fee: 240000, status: "agreed", tooth: "#11-25", progress: 0 },
    ],
    visitSummary: "全口重建計劃進行中,牙周第一期治療接近完成,即將進入矯正階段"
  },
];

const TODAY_SCHEDULE = [
  { time: "09:00", patientId: "p003", patientName: "王雅婷", type: "初診/美學諮詢", duration: 60, status: "confirmed", chair: "診療椅1", notes: "帶DSD模型" },
  { time: "10:00", patientId: "p001", patientName: "林美玲", type: "全瓷冠試戴", duration: 45, status: "confirmed", chair: "診療椅1", notes: "" },
  { time: "11:00", patientId: "p002", patientName: "陳志明", type: "根管治療複診", duration: 60, status: "confirmed", chair: "診療椅2", notes: "第二根管" },
  { time: "14:00", patientId: null, patientName: "黃小明(新患者)", type: "初診", duration: 60, status: "pending", chair: "診療椅1", notes: "電話轉介" },
  { time: "15:30", patientId: "p001", patientName: "林美玲", type: "回診檢查", duration: 30, status: "confirmed", chair: "診療椅2", notes: "" },
];

const TREATMENT_TAGS = ["牙周病", "前牙美學", "全瓷冠", "全口重建", "根管治療", "手術", "矯正", "DSD", "植牙", "拔牙", "洗牙", "補牙"];
const TOOTH_REGIONS = ["全口", "上顎前牙", "下顎前牙", "右上", "左上", "右下", "左下", "#11","#12","#13","#14","#15","#16","#17","#21","#22","#23","#24","#25","#26","#27","#31","#32","#33","#34","#35","#36","#37","#41","#42","#43","#44","#45","#46","#47"];
const STAFF = ["Dr. 戴醫師", "護士小陳", "助理小林", "護士小王"];

// --- ICONS -------------------------------------------------------------------
const Icon = ({ name, size = 16 }) => {
  const icons = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    plus: "M12 4v16m8-8H4",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
    tooth: "M12 2C8 2 5 5 5 9c0 2.5 1.5 5 1.5 7.5S7 21 9 21s3-2 3-2 1 2 3 2 2.5-2 2.5-4.5S19 11.5 19 9c0-4-3-7-7-7z",
    dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    list: "M4 6h16M4 10h16M4 14h16M4 18h16",
    grid: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    arrow_right: "M13 7l5 5m0 0l-5 5m5-5H6",
    chevron_down: "M19 9l-7 7-7-7",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    notification: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={icons[name] || icons.home} />
    </svg>
  );
};

// --- STATUS BADGE -------------------------------------------------------------
const StatusBadge = ({ status }) => {
  const map = {
    agreed: { label: "已約診", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    in_progress: { label: "進行中", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    considering: { label: "考慮中", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    completed: { label: "已完成", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
    rejected: { label: "不考慮", color: "bg-red-500/20 text-red-300 border-red-500/30" },
    confirmed: { label: "已確認", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    pending: { label: "待確認", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  };
  const s = map[status] || { label: status, color: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>{s.label}</span>;
};

// --- MODAL WRAPPER ------------------------------------------------------------
const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
    <div className={`relative bg-[#0f1923] border border-[#1e3048] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${wide ? "w-full max-w-5xl max-h-[90vh]" : "w-full max-w-2xl max-h-[85vh]"}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3048] bg-[#0a1420]">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><Icon name="x" size={20} /></button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">{children}</div>
    </div>
  </div>
);

// --- INPUT COMPONENTS ---------------------------------------------------------
const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-[#1a2535] border border-[#2a3a50] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition-colors" />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full bg-[#1a2535] border border-[#2a3a50] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition-colors resize-none" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      className="w-full bg-[#1a2535] border border-[#2a3a50] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// --- VOICE AI RECORDER --------------------------------------------------------
const VoiceRecorder = ({ onTranscript, onAudioBlob }) => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioBlob && onAudioBlob(audioBlob);
        
        // Mock Transcription for now (Wait for real Whisper/Notion AI API)
        const mock = "病患主訴右下後牙疼痛約兩週,進食時加劇,冷熱敏感視診#46遠心面大面積充填物鬆脫,叩診(+),牙周囊袋正常建議根管治療後全瓷冠修復,病患已同意治療計劃";
        setTranscript(mock);
        onTranscript && onTranscript(mock);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("無法存取麥克風，請檢查權限設定");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const toggle = () => recording ? stopRecording() : startRecording();

  return (
    <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={toggle} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${recording ? "bg-red-500 text-white animate-pulse" : "bg-[#1e3048] text-cyan-400 hover:bg-[#2a4060]"}`}>
          <Icon name="mic" size={16} />
          {recording ? `錄音中 ${Math.floor(seconds/60).toString().padStart(2,"0")}:${(seconds%60).toString().padStart(2,"0")}` : "開始語音記錄"}
        </button>
        <span className="text-xs text-gray-500">將語音檔上傳至 Notion</span>
      </div>
      {transcript && (
        <div className="bg-[#1a2535] rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">AI 轉錄結果</p>
          <p className="text-sm text-gray-200 leading-relaxed">{transcript}</p>
        </div>
      )}
    </div>
  );
};

// --- TAG SELECTOR -------------------------------------------------------------
const TagSelector = ({ selected, onChange, options, label }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(t => (
        <button key={t} onClick={() => onChange(selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t])}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected.includes(t) ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "bg-[#1a2535] text-gray-400 border-[#2a3a50] hover:border-gray-500"}`}>
          {t}
        </button>
      ))}
    </div>
  </div>
);

// --- DASHBOARD / TODAY SCHEDULE -----------------------------------------------
const DashboardView = ({ patients, schedule, onOpenPatient, onOpenVisit, onAddPatient, onSaveVisit }) => {
  const today = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const totalRevenue = 285000;
  const confirmedCount = schedule.filter(s => s.status === "confirmed").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "今日看診", value: schedule.length, sub: `${confirmedCount} 已確認`, icon: "calendar", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
          { label: "預估自費業績", value: "NT$128,000", sub: "今日約診", icon: "dollar", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "本月累積預估", value: "NT$680,000", sub: "自費業績", icon: "chart", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "追蹤考慮中", value: "4", sub: "需助理追蹤", icon: "notification", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((s, i) => (
          <div key={i} className={`bg-[#0a1420] border ${s.bg} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <span className={s.color}><Icon name={s.icon} size={20} /></span>
              <span className="text-xs text-gray-500">{today.split("星期")[0]}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3048]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400"><Icon name="calendar" size={18} /></span>
            今日約診清單
            <span className="text-xs font-normal text-gray-400">{today}</span>
          </h2>
          <button onClick={onAddPatient} className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
            <Icon name="plus" size={14} /> 新增病患
          </button>
        </div>
        <div className="divide-y divide-[#1e3048]">
          {schedule.map((appt, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#111e2e] transition-colors group">
              <div className="text-sm font-mono text-cyan-400 w-12 shrink-0">{appt.time}</div>
              <div className={`w-1.5 h-12 rounded-full shrink-0 ${appt.status === "confirmed" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{appt.patientName}</span>
                  <StatusBadge status={appt.status} />
                  <span className="text-xs text-gray-500">{appt.chair}</span>
                </div>
                <div className="text-xs text-gray-400">{appt.type}  {appt.duration}分鐘 {appt.notes && ` ${appt.notes}`}</div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {appt.patientId && (
                  <button onClick={() => onOpenPatient(appt.patientId)} className="text-xs bg-[#1a2535] hover:bg-[#2a3a50] text-gray-300 px-2.5 py-1 rounded-lg transition-colors">
                    病歷首頁
                  </button>
                )}
                <button onClick={() => onOpenVisit(appt)} className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-colors">
                  開始看診
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="text-violet-400"><Icon name="chart" size={16} /></span>本月業績概況</h3>
          <div className="space-y-3">
            {[
              { label: "健保實際業績", value: 420000, max: 600000, color: "bg-blue-500" },
              { label: "自費實際業績", value: 340000, max: 680000, color: "bg-emerald-500" },
              { label: "自費預估(已約)", value: 680000, max: 680000, color: "bg-violet-500", dashed: true },
            ].map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{b.label}</span>
                  <span className="text-white font-medium">NT${b.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[#1a2535] rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${(b.value/b.max)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><span className="text-amber-400"><Icon name="notification" size={16} /></span>待處理事項</h3>
          <div className="space-y-2">
            {[
              { text: "王雅婷 -- 矯正醫師回報待確認", type: "orthodontics", urgent: true },
              { text: "林美玲 -- 術後照待上傳(增信賴感)", type: "photo", urgent: false },
              { text: "陳志明 -- 考慮中療程 請追蹤", type: "follow", urgent: false },
              { text: "今日健保業績待輸入", type: "finance", urgent: false },
            ].map((t, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${t.urgent ? "bg-red-500/10 border-red-500/20" : "bg-[#1a2535] border-[#2a3a50]"}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${t.urgent ? "bg-red-400" : "bg-gray-500"}`} />
                <span className="text-xs text-gray-300">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW PATIENT MODAL --------------------------------------------------------
const NewPatientModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", dob: "", phone: "", gender: "female", bloodType: "A", allergy: "", medicalHistory: "", referralSource: "朋友介紹", personality: "" });
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Modal title="新增病患" onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <Input label="姓名" value={form.name} onChange={f("name")} required />
        <Input label="出生日期" value={form.dob} onChange={f("dob")} type="date" required />
        <Input label="電話" value={form.phone} onChange={f("phone")} />
        <Select label="性別" value={form.gender} onChange={f("gender")} options={[{value:"female",label:"女"},{value:"male",label:"男"}]} />
        <Select label="血型" value={form.bloodType} onChange={f("bloodType")} options={["A","B","O","AB"].map(v=>({value:v,label:v}))} />
        <Input label="藥物過敏" value={form.allergy} onChange={f("allergy")} placeholder="無 / 填寫藥物名稱" />
        <Select label="轉介來源" value={form.referralSource} onChange={f("referralSource")} options={["朋友介紹","網路搜尋","自費項目多","矯正轉介","其他"].map(v=>({value:v,label:v}))} />
        <Select label="VIP狀態" value={form.vip ? "true" : "false"} onChange={v => setForm(p => ({...p, vip: v==="true"}))} options={[{value:"false",label:"一般"},{value:"true",label:" VIP"}]} />
        <div className="col-span-2">
          <Textarea label="病史" value={form.medicalHistory} onChange={f("medicalHistory")} rows={2} placeholder="高血壓糖尿病心臟病等" />
        </div>
        <div className="col-span-2">
          <Textarea label="個性備注" value={form.personality} onChange={f("personality")} rows={2} placeholder="記錄個性特點溝通方式偏好..." />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#2a3a50] text-gray-400 text-sm hover:bg-[#1a2535] transition-colors">取消</button>
        <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">建立病歷</button>
      </div>
    </Modal>
  );
};

// --- VISIT RECORD MODAL -------------------------------------------------------
const VisitModal = ({ appt, patient, onClose, onSave }) => {
  const [tab, setTab] = useState("record");
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [treatments, setTreatments] = useState([{ item: "", tooth: [], tags: [], fee: 0, status: "considering", reason: "", followUp: false, scheduledDate: "", scheduledFeeDate: "", scheduledFee: 0 }]);
  const [images, setImages] = useState([]);
  const [checklist, setChecklist] = useState({ sendSummary: false, sendEduCard: false, beforeAfterPhoto: false });
  const [staff, setStaff] = useState("");
  const [staffTime, setStaffTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageType, setImageType] = useState("口內照");

  const addTreatment = () => setTreatments(p => [...p, { item: "", tooth: [], tags: [], fee: 0, status: "considering", reason: "", followUp: false, scheduledDate: "", scheduledFeeDate: "", scheduledFee: 0 }]);
  const updateTreatment = (i, k, v) => setTreatments(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  const totalFee = treatments.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);
  const tabs = [{ id: "record", label: "就診記錄" }, { id: "treatment", label: "自費療程" }, { id: "images", label: "影像上傳" }, { id: "followup", label: "助理審核" }];

  const handleSaveVisit = () => {
    const visitData = {
      patientId: appt.patientId,
      patientName: appt.patientName,
      date: new Date().toISOString().split('T')[0],
      type: appt.type,
      notes,
      transcript,
      audioBlob,
      selectedTags,
      treatments,
      checklist,
      staff,
      staffTime
    };
    onSave(visitData);
    onClose();
  };

  return (
    <Modal title={`看診紀錄 -- ${appt?.patientName || "未知"} ${appt?.time || ""}`} onClose={onClose} wide>
      <div className="flex gap-1 mb-5 bg-[#0a1420] rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${tab === t.id ? "bg-cyan-500 text-black" : "text-gray-400 hover:text-white"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "record" && (
        <div className="space-y-4">
          <div className="bg-[#1a2535] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400"><Icon name="user" size={18} /></div>
            <div>
              <div className="font-medium text-white">{appt?.patientName}</div>
              <div className="text-xs text-gray-400">{appt?.type}  {appt?.chair}</div>
            </div>
            {patient?.vip && <span className="ml-auto text-amber-400 text-lg"></span>}
          </div>
          <VoiceRecorder onTranscript={setTranscript} onAudioBlob={setAudioBlob} />
          <Textarea label="主訴 / 病歷摘要" value={notes} onChange={setNotes} rows={4} placeholder="主訴視診治療計劃..." />
          <TagSelector label="AI 生成標籤(依摘要自動建議)" selected={selectedTags} onChange={setSelectedTags} options={TREATMENT_TAGS} />
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "sendSummary", label: "傳病例摘要給病患" },
              { key: "sendEduCard", label: "傳衛教圖卡" },
              { key: "beforeAfterPhoto", label: "術前術後照(增信賴感)" },
            ].map(c => (
              <button key={c.key} onClick={() => setChecklist(p => ({ ...p, [c.key]: !p[c.key] }))} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${checklist[c.key] ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-[#1a2535] border-[#2a3a50] text-gray-400"}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checklist[c.key] ? "bg-cyan-500 border-cyan-500" : "border-gray-500"}`}>
                  {checklist[c.key] && <Icon name="check" size={10} />}
                </div>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "treatment" && (
        <div className="space-y-4">
          {treatments.map((t, i) => (
            <div key={i} className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">療程 #{i + 1}</span>
                {treatments.length > 1 && <button onClick={() => setTreatments(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><Icon name="trash" size={14} /></button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="治療項目" value={t.item} onChange={v => updateTreatment(i, "item", v)} placeholder="全瓷冠根管治療..." />
                <Input label="自費金額 (NT$)" value={t.fee} onChange={v => updateTreatment(i, "fee", v)} type="number" />
              </div>
              <Select label="牙位 / 區域" value={t.tooth[0] || ""} onChange={v => updateTreatment(i, "tooth", [v])} options={TOOTH_REGIONS.map(r => ({ value: r, label: r }))} />
              <TagSelector label="治療標籤" selected={t.tags} onChange={v => updateTreatment(i, "tags", v)} options={TREATMENT_TAGS} />
              <Select label="狀態" value={t.status} onChange={v => updateTreatment(i, "status", v)} options={[
                { value: "considering", label: "考慮中" },
                { value: "agreed", label: "已約診" },
                { value: "rejected", label: "不考慮" },
                { value: "completed", label: "已完成" },
              ]} />
              {t.status === "agreed" && (
                <div className="grid grid-cols-2 gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <Input label="下次約診日期" value={t.scheduledDate} onChange={v => updateTreatment(i, "scheduledDate", v)} type="date" />
                  <Input label="預計收費日期" value={t.scheduledFeeDate} onChange={v => updateTreatment(i, "scheduledFeeDate", v)} type="date" />
                  <Input label="預計收費金額" value={t.scheduledFee} onChange={v => updateTreatment(i, "scheduledFee", v)} type="number" />
                </div>
              )}
              {t.status === "considering" && (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <button onClick={() => updateTreatment(i, "followUp", !t.followUp)} className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${t.followUp ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-[#1a2535] border-[#2a3a50] text-gray-400"}`}>
                    <Icon name="refresh" size={12} /> 請助理追蹤
                  </button>
                  <span className="text-xs text-gray-400">讓助理後續聯繫病患</span>
                </div>
              )}
              {t.status === "rejected" && (
                <Input label="不考慮原因" value={t.reason} onChange={v => updateTreatment(i, "reason", v)} placeholder="費用時間恐懼..." />
              )}
            </div>
          ))}
          <button onClick={addTreatment} className="w-full py-2.5 border border-dashed border-[#2a3a50] rounded-xl text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-1.5">
            <Icon name="plus" size={14} /> 新增療程
          </button>
          {totalFee > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-gray-300">本次建議療程總計</span>
              <span className="text-xl font-bold text-emerald-400">NT${totalFee.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {tab === "images" && (
        <div className="space-y-4">
          <div className="bg-[#1a2535] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-3">上傳影像後自動帶入:病患姓名拍攝日期影像類型</p>
            <Select label="影像類型" value={imageType} onChange={setImageType} options={["口內照","口外照","X光片","DSD","術後照","矯正囑言截圖","其他"].map(v=>({value:v,label:v}))} />
          </div>
          <div className="border-2 border-dashed border-[#2a3a50] hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors group">
            <div className="text-gray-400 group-hover:text-cyan-400 transition-colors mb-2"><Icon name="upload" size={32} /></div>
            <p className="text-sm text-gray-400 mb-1">點擊或拖拽上傳影像</p>
            <p className="text-xs text-gray-500">支援 JPGPNGDICOMRAW</p>
            <p className="text-xs text-cyan-400 mt-2">可串接 Lightroom 目錄</p>
          </div>
          {images.length === 0 && (
            <div className="grid grid-cols-3 gap-3">
              {["術前X光", "口內照正面", "咬合面"].map((img, i) => (
                <div key={i} className="bg-[#1a2535] rounded-xl aspect-square flex flex-col items-center justify-center border border-[#2a3a50]">
                  <Icon name="image" size={24} />
                  <span className="text-xs text-gray-500 mt-2">{img}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Lightroom 整合工作流</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>1. 在 Lightroom 中標記今日待匯出智慧相簿</p>
              <p>2. 執行一鍵匯出至 /DentalCRM/Images/{"{PatientID}"}/</p>
              <p>3. 系統自動掃描並建立影像頁面</p>
            </div>
          </div>
        </div>
      )}

      {tab === "followup" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-300 mb-1">助理執行審核機制</h4>
            <p className="text-xs text-gray-400">確認助理是否已完成:傳衛教資料安排複診追蹤考慮中病患</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="執行人員" value={staff} onChange={setStaff} options={[{value:"",label:"請選擇"},...STAFF.map(s=>({value:s,label:s}))]} />
            <Input label="完成時間" value={staffTime} onChange={setStaffTime} type="datetime-local" />
          </div>
          <div className="space-y-2">
            {[
              "已傳病例摘要/衛教給病患",
              "已安排下次複診時間",
              "已追蹤考慮中療程病患",
              "已上傳術後照",
              "已記錄病患回饋/抱怨",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#1a2535] border border-[#2a3a50] rounded-lg p-3">
                <div className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <Textarea label="備注 / 病患抱怨回報" rows={3} placeholder="記錄任何病患反饋或需要跟進的事項..." />
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-[#1e3048]">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#2a3a50] text-gray-400 text-sm hover:bg-[#1a2535] transition-colors">取消</button>
        <button onClick={handleSaveVisit} className="flex-2 px-8 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors">儲存就診記錄</button>
      </div>
    </Modal>
  );
};

// --- PATIENT HOME PAGE --------------------------------------------------------
const PatientProfile = ({ patient, onClose, onOpenVisit, onSaveVisit }) => {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "病歷首頁", icon: "user" },
    { id: "visits", label: "就診紀錄", icon: "clipboard" },
    { id: "treatments", label: "療程進度", icon: "chart" },
    { id: "images", label: "影像庫", icon: "image" },
    { id: "orthodontics", label: "矯正跨科", icon: "link" },
    { id: "learning", label: "學習連結", icon: "book" },
  ];

  const agreeedRevenue = patient.currentTreatments.filter(t => t.status === "agreed" || t.status === "in_progress" || t.status === "completed").reduce((s, t) => s + t.fee, 0);

  return (
    <div className="fixed inset-0 z-40 bg-[#060e18] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Patient Header */}
        <div className="flex items-start gap-5 mb-6 bg-[#0a1420] border border-[#1e3048] rounded-2xl p-5">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center text-2xl font-bold text-cyan-400 shrink-0 border border-cyan-500/20">
            {patient.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{patient.name}</h1>
              {patient.vip && <span className="text-amber-400 text-xl" title="VIP"></span>}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${patient.gender === "female" ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>{patient.gender === "female" ? "女" : "男"}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1"><Icon name="phone" size={12} />{patient.phone}</span>
              <span>生日 {patient.dob}</span>
              <span>血型 {patient.bloodType}</span>
              {patient.allergy !== "無" && <span className="text-red-400"> 過敏 {patient.allergy}</span>}
              <span className="text-gray-500">來源 {patient.referralSource}</span>
              <span>介紹 {patient.referralCount} 人</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="x" size={20} /></button>
            <div className="text-right">
              <div className="text-xs text-gray-500">自費累積</div>
              <div className="text-lg font-bold text-emerald-400">NT${patient.totalSelfPay.toLocaleString()}</div>
            </div>
            {patient.nextVisit && <span className="text-xs text-cyan-400">下次 {patient.nextVisit}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-[#0a1420] border border-[#1e3048] rounded-xl p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-cyan-500 text-black" : "text-gray-400 hover:text-white"}`}>
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><span className="text-cyan-400"><Icon name="clipboard" size={15} /></span>病歷摘要</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{patient.visitSummary}</p>
                <div className="mt-3 p-3 bg-[#1a2535] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">個性備注</p>
                  <p className="text-xs text-gray-300">{patient.personality}</p>
                </div>
                {patient.complaints.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">曾抱怨 / 細節記錄</p>
                    <div className="space-y-1">
                      {patient.complaints.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                          <Icon name="alert" size={12} /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><span className="text-emerald-400"><Icon name="check" size={15} /></span>目前同意療程進度</h3>
                <div className="space-y-3">
                  {patient.currentTreatments.filter(t => t.status !== "rejected").map((t, i) => (
                    <div key={i} className="bg-[#1a2535] rounded-xl p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-white">{t.item}</div>
                          {t.tooth && <div className="text-xs text-gray-400 mt-0.5">牙位 {t.tooth}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={t.status} />
                          <span className="text-xs font-bold text-white">NT${t.fee.toLocaleString()}</span>
                        </div>
                      </div>
                      {t.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">進度</span>
                            <span className="text-white">{t.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[#0a1420] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: `${t.progress}%` }} />
                          </div>
                        </div>
                      )}
                      {t.scheduledDate && <div className="text-xs text-cyan-400 mt-2">下次約診 {t.scheduledDate}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">快速資訊</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">病史</span><span className="text-white">{patient.medicalHistory}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">過敏</span><span className={patient.allergy !== "無" ? "text-red-400" : "text-gray-300"}>{patient.allergy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">已同意金額</span><span className="text-emerald-400 font-bold">NT${agreeedRevenue.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">影像預覽</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["術前X光", "DSD口外照", "口內正面", "術後照"].map((img, i) => (
                    <div key={i} className="bg-[#1a2535] rounded-lg aspect-square flex flex-col items-center justify-center border border-[#2a3a50] cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <Icon name="image" size={16} />
                      <span className="text-xs text-gray-500 mt-1 text-center px-1">{img}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => onOpenVisit({ patientId: patient.id, patientName: patient.name, time: "現在", type: "複診" })} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                <Icon name="plus" size={16} /> 新增今日就診
              </button>
            </div>
          </div>
        )}

        {tab === "treatments" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "自費累積", value: `NT$${patient.totalSelfPay.toLocaleString()}`, color: "text-emerald-400" },
                { label: "同意療程", value: patient.currentTreatments.filter(t => ["agreed","in_progress","completed"].includes(t.status)).length, color: "text-cyan-400" },
                { label: "完成療程", value: patient.currentTreatments.filter(t => t.status === "completed").length, color: "text-violet-400" },
              ].map((s, i) => (
                <div key={i} className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {patient.currentTreatments.map((t, i) => (
              <div key={i} className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{t.item}</div>
                    {t.tooth && <div className="text-xs text-gray-400">牙位 {t.tooth}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <span className="font-bold text-white">NT${t.fee.toLocaleString()}</span>
                  </div>
                </div>
                {t.progress > 0 && (
                  <div className="mt-3">
                    <div className="h-2 bg-[#1a2535] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${t.progress}%` }} />
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1">{t.progress}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "images" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["全部", "口內照", "口外照", "X光片", "DSD", "術後照"].map(cat => (
                <button key={cat} className="px-3 py-1.5 text-xs rounded-lg bg-[#1a2535] border border-[#2a3a50] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-[#0a1420] border border-[#1e3048] rounded-xl overflow-hidden group cursor-pointer hover:border-cyan-500/50 transition-all">
                  <div className="aspect-square bg-[#1a2535] flex items-center justify-center">
                    <Icon name="image" size={32} />
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-medium text-white">{["X光片", "口內照", "術後照", "DSD照", "口外照", "X光片2", "口內咬合", "近照", "全口X光"][i]}</div>
                    <div className="text-xs text-gray-500 mt-0.5">2026-03-{(10 + i).toString().padStart(2,"0")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orthodontics" && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2"><Icon name="link" size={15} /> 矯正跨科協作</h3>
              <p className="text-xs text-gray-400">與矯正醫師協作的治療計劃與進度追蹤</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">轉診醫師</p>
                <div className="space-y-2">
                  {["蘇醫師", "周醫師"].map(d => <div key={d} className="flex items-center gap-2 text-sm text-white bg-[#1a2535] rounded-lg px-3 py-2"><Icon name="user" size={14} />{d}</div>)}
                </div>
              </div>
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">目前進度</p>
                <div className="text-sm text-white">牙周治療 Phase 1 完成 80%</div>
                <div className="text-xs text-cyan-400 mt-1">下次矯正約診 2026-04-01</div>
              </div>
            </div>
            <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">矯正醫師回報 Todo List</h4>
              <div className="space-y-2">
                {["檢查右上#16是否有足夠空間", "確認下顎前牙扭轉改善狀況", "評估是否需要拔牙矯正"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-[#1a2535] rounded-lg p-3">
                    <div className="w-4 h-4 rounded border border-gray-500 shrink-0 mt-0.5 cursor-pointer hover:border-cyan-500 transition-colors" />
                    <span className="text-xs text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                <Icon name="plus" size={12} /> 新增回報項目
              </button>
            </div>
            <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">矯正囑言截圖</h4>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({length:3}).map((_, i) => (
                  <div key={i} className="aspect-video bg-[#1a2535] rounded-lg border border-[#2a3a50] flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <Icon name="image" size={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "visits" && (
          <div className="space-y-3">
            {[
              { date: "2026-03-10", type: "全瓷冠試戴", doctor: "戴醫師", summary: "右上前牙全瓷冠試戴,顏色調整一次,病患滿意確認下次黏著時間", tags: ["全瓷冠"], fee: 0 },
              { date: "2026-02-20", type: "根管治療", doctor: "戴醫師", summary: "繼續根管治療,第二根管清潔完成,暫封病患主訴疼痛已大幅改善", tags: ["根管治療"], fee: 0 },
              { date: "2026-01-15", type: "初診/美學諮詢", doctor: "戴醫師", summary: "初診評估全口狀況,主訴前牙美觀問題完成DSD設計提案,病患對治療計劃非常感興趣", tags: ["DSD", "前牙美學"], fee: 15000 },
            ].map((v, i) => (
              <div key={i} className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-cyan-400">{v.date}</span>
                    <span className="text-sm font-medium text-white">{v.type}</span>
                    <span className="text-xs text-gray-500">{v.doctor}</span>
                  </div>
                  {v.fee > 0 && <span className="text-xs font-bold text-emerald-400">NT${v.fee.toLocaleString()}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-2">{v.summary}</p>
                <div className="flex gap-1">
                  {v.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "learning" && (
          <div className="space-y-4">
            <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><span className="text-violet-400"><Icon name="lightbulb" size={15} /></span>本病患的學習記錄</h3>
              <p className="text-xs text-gray-400 mb-3">連結到學習資料庫的相關改善點與技術巧思</p>
              <div className="space-y-2">
                {[
                  { category: "前牙美學", note: "DSD比色時,林美玲的牙齦線不對稱,需特別注意製作時的牙冠長度設計", date: "2026-01-15" },
                  { category: "全瓷冠", note: "試戴時顏色偏灰,下次請瓷燒製師提高透明度 T2", date: "2026-03-10" },
                ].map((l, i) => (
                  <div key={i} className="bg-[#1a2535] border border-[#2a3a50] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">{l.category}</span>
                      <span className="text-xs text-gray-500">{l.date}</span>
                    </div>
                    <p className="text-xs text-gray-300">{l.note}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"><Icon name="plus" size={12} /> 新增學習記錄</button>
            </div>
            <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><span className="text-amber-400"><Icon name="settings" size={15} /></span>SOP 改善記錄</h3>
              <div className="space-y-2">
                {["試戴前需先確認技工所比色記錄表", "初診美學諮詢需預留至少60分鐘"].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    <span className="text-amber-400 mt-0.5"></span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PATIENTS LIST VIEW -------------------------------------------------------
const PatientsView = ({ patients, onOpenPatient, onAddPatient }) => {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const filtered = patients.filter(p =>
    (!search || p.name.includes(search) || p.phone.includes(search)) &&
    (!filterTag || p.tags.includes(filterTag))
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="filter" size={14} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋姓名電話..." className="w-full bg-[#0a1420] border border-[#1e3048] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors" />
        </div>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="bg-[#0a1420] border border-[#1e3048] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
          <option value="">全部標籤</option>
          {TREATMENT_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={onAddPatient} className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Icon name="plus" size={15} /> 新增病患
        </button>
      </div>
      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} onClick={() => onOpenPatient(p.id)} className="bg-[#0a1420] border border-[#1e3048] hover:border-cyan-500/30 rounded-xl p-4 cursor-pointer transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-lg font-bold text-cyan-400 border border-cyan-500/20 shrink-0">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{p.name}</span>
                  {p.vip && <span className="text-amber-400 text-sm"></span>}
                  <span className="text-xs text-gray-500">{p.phone}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {p.tags.slice(0, 4).map(t => <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{t}</span>)}
                  {p.tags.length > 4 && <span className="text-xs text-gray-500">+{p.tags.length - 4}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-emerald-400">NT${p.totalSelfPay.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{p.nextVisit ? `下次 ${p.nextVisit}` : "無預約"}</div>
              </div>
              <span className="text-gray-600 group-hover:text-cyan-400 transition-colors ml-2"><Icon name="arrow_right" size={16} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- LEARNING DB VIEW ---------------------------------------------------------
const LearningView = () => {
  const [selectedCat, setSelectedCat] = useState("全瓷冠");
  const cats = ["牙周病", "前牙美學", "全瓷冠", "全口重建", "根管治療", "手術", "矯正跨科"];
  const notes = {
    "全瓷冠": [
      { title: "比色技巧 -- 自然光 vs 人工光源差異", date: "2026-02-15", patient: "林美玲", content: "試戴時須在自然光下確認,A2比色在診間可能看起來偏亮建議與技工所溝通試戴後拍照確認", type: "技術巧思" },
      { title: "全瓷冠黏著前的預備確認清單", date: "2026-01-20", patient: null, content: "1. 確認清潔度 2. 試著色劑 3. 確認咬合接觸點 4. 邊緣密合度 5. 病患滿意度", type: "SOP改善" },
    ],
    "前牙美學": [
      { title: "DSD設計中牙齦線不對稱的處理策略", date: "2026-01-15", patient: "林美玲", content: "遇到牙齦線左右不對稱超過2mm時,需考慮牙冠增長術或矯正後再做DSD設計", type: "臨床觀察" },
    ],
  };
  const currentNotes = notes[selectedCat] || [];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setSelectedCat(c)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedCat === c ? "bg-violet-500/20 text-violet-300 border-violet-500/40" : "bg-[#0a1420] text-gray-400 border-[#1e3048] hover:border-gray-500"}`}>{c}</button>
        ))}
      </div>
      <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3048]">
          <h2 className="font-semibold text-white flex items-center gap-2"><span className="text-violet-400"><Icon name="book" size={16} /></span>{selectedCat} 學習資料庫</h2>
          <button className="flex items-center gap-1.5 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-all"><Icon name="plus" size={12} /> 新增記錄</button>
        </div>
        {currentNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">尚無 {selectedCat} 的學習記錄</div>
        ) : (
          <div className="divide-y divide-[#1e3048]">
            {currentNotes.map((n, i) => (
              <div key={i} className="p-5 hover:bg-[#111e2e] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{n.title}</h3>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${n.type === "SOP改善" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : n.type === "技術巧思" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-violet-500/20 text-violet-300 border-violet-500/30"}`}>{n.type}</span>
                    <span className="text-xs text-gray-500">{n.date}</span>
                  </div>
                </div>
                {n.patient && <div className="text-xs text-cyan-400 mb-2">來源病患 {n.patient}</div>}
                <p className="text-sm text-gray-400 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- FINANCE VIEW -------------------------------------------------------------
const FinanceView = () => {
  const [month, setMonth] = useState("2026-03");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "本月健保實際", value: "NT$420,000", change: "+12%", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "本月自費實際", value: "NT$340,000", change: "+28%", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "自費預估(已約)", value: "NT$680,000", change: "", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "轉換率", value: "73%", change: "+5%", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((s, i) => (
          <div key={i} className={`bg-[#0a1420] border ${s.bg} rounded-xl p-4`}>
            <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
            {s.change && <div className="text-xs text-emerald-400 mt-0.5">{s.change} vs 上月</div>}
          </div>
        ))}
      </div>
      <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3048]">
          <h2 className="font-semibold text-white flex items-center gap-2"><span className="text-emerald-400"><Icon name="dollar" size={16} /></span>自費約診明細(預計收費)</h2>
          <button className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-all"><Icon name="plus" size={12} /> 新增收費計劃</button>
        </div>
        <div className="divide-y divide-[#1e3048]">
          {[
            { patient: "王雅婷", treatment: "全口重建 Phase 1", amount: 80000, date: "2026-03-25", status: "scheduled" },
            { patient: "林美玲", treatment: "前牙全瓷冠 6顆", amount: 120000, date: "2026-04-10", status: "scheduled" },
            { patient: "陳志明", treatment: "根管治療 #46", amount: 12000, date: "2026-03-20", status: "pending" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 bg-[#1a2535] rounded-lg flex items-center justify-center text-sm font-bold text-cyan-400">{item.patient[0]}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{item.patient}</div>
                <div className="text-xs text-gray-400">{item.treatment}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">NT${item.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{item.date}</div>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><span className="text-blue-400"><Icon name="edit" size={16} /></span>今日業績輸入</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="今日健保業績 (NT$)" placeholder="0" type="number" value="" onChange={() => {}} />
          <Input label="今日自費實際業績 (NT$)" placeholder="0" type="number" value="" onChange={() => {}} />
          <div className="col-span-2">
            <Textarea label="備注" rows={2} placeholder="特殊說明..." value="" onChange={() => {}} />
          </div>
        </div>
        <button className="mt-4 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"><Icon name="check" size={14} /> 儲存今日業績</button>
      </div>
    </div>
  );
};

// --- MAIN APP -----------------------------------------------------------------
export default function DentalCRM() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [visitModal, setVisitModal] = useState(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notion?database_id=${NOTION_DBS.patients}`);
      const data = await res.json();
      if (data.results) {
        const mapped = data.results.map(page => {
          const props = page.properties;
          return {
            id: page.id,
            name: props.Name?.title[0]?.plain_text || "未命名",
            phone: props.Phone?.phone_number || "",
            dob: props.DOB?.date?.start || "",
            gender: props.Gender?.select?.name === "女" ? "female" : "male",
            vip: props.VIP?.checkbox || false,
            referralSource: props.ReferralSource?.select?.name || "",
            bloodType: props.BloodType?.select?.name || "A",
            allergy: props.Allergy?.rich_text[0]?.plain_text || "無",
            medicalHistory: props.MedicalHistory?.rich_text[0]?.plain_text || "",
            personality: props.Personality?.rich_text[0]?.plain_text || "",
            tags: props.Tags?.multi_select?.map(t => t.name) || [],
            totalSelfPay: props.TotalSelfPay?.number || 0,
            referralCount: props.ReferralCount?.number || 0,
            complaints: props.Complaints?.rich_text[0]?.plain_text?.split('\n') || [],
            visitSummary: props.VisitSummary?.rich_text[0]?.plain_text || "尚無摘要",
            currentTreatments: [] // This would need another fetch or a more complex relation mapping
          };
        });
        if (mapped.length > 0) {
          setPatients(mapped);
        }
      }
    } catch (e) {
      console.error("Failed to fetch patients:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const navItems = [
    { id: "dashboard", label: "今日儀表板", icon: "home" },
    { id: "patients", label: "病患列表", icon: "users" },
    { id: "images", label: "影像庫", icon: "image" },
    { id: "finance", label: "業績管理", icon: "dollar" },
    { id: "learning", label: "學習資料庫", icon: "book" },
  ];

  const handleAddPatient = async (form) => {
    const newP = { ...form, id: `p${Date.now()}`, tags: [], currentTreatments: [], vip: form.vip === "true", totalSelfPay: 0, referralCount: 0, complaints: [], visitSummary: "新病患,尚無就診記錄" };
    setPatients(p => [...p, newP]);
    // Save to Notion
    try {
      await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          database_id: NOTION_DBS.patients,
          properties: {
            Name: { title: [{ text: { content: form.name || "" } }] },
            Phone: { phone_number: form.phone || null },
            Gender: { select: form.gender === "female" ? { name: "女" } : { name: "男" } },
            BloodType: { select: { name: form.bloodType || "A" } },
            Allergy: { rich_text: [{ text: { content: form.allergy || "" } }] },
            MedicalHistory: { rich_text: [{ text: { content: form.medicalHistory || "" } }] },
            Personality: { rich_text: [{ text: { content: form.personality || "" } }] },
            ReferralSource: { select: { name: form.referralSource || "其他" } },
            VIP: { checkbox: form.vip === "true" || form.vip === true },
            Status: { select: { name: "Active" } },
            "date:DOB:start": form.dob || null
          }
        })
      });
    } catch(e) { console.error("Notion save failed:", e); }
  };

  const handleSaveVisit = async (visitData) => {
    try {
      let audioFileName = "";
      if (visitData.audioBlob) {
        audioFileName = `visit_${visitData.patientId}_${Date.now()}.webm`;
        console.log("Audio blob ready for upload:", audioFileName);
      }

      // 1. Save Visit Record to Notion with AI Summarization
      await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          database_id: NOTION_DBS.visits,
          fileName: audioFileName,
          summarize: true, // Trigger AI summary in backend
          transcript: visitData.transcript,
          properties: {
            "Patient Name": { title: [{ text: { content: visitData.patientName || "" } }] },
            "Patient ID": { rich_text: [{ text: { content: visitData.patientId || "" } }] },
            "Type": { select: { name: visitData.type || "複診" } },
            "Notes": { rich_text: [{ text: { content: visitData.notes || "" } }] },
            "Transcript": { rich_text: [{ text: { content: visitData.transcript || "" } }] },
            "Staff": { select: { name: visitData.staff || "Dr. 戴醫師" } },
            "Tags": { multi_select: (visitData.selectedTags || []).map(t => ({ name: t })) },
            "date:VisitDate:start": visitData.date
          }
        })
      });

      // 2. Save each Treatment to Finance Database if they have a fee or are "agreed/considering"
      for (const t of visitData.treatments) {
        if (t.item && (t.fee > 0 || t.status !== "rejected")) {
          await fetch("/api/notion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              database_id: NOTION_DBS.finance,
              properties: {
                "Treatment Item": { title: [{ text: { content: t.item } }] },
                "Patient Name": { rich_text: [{ text: { content: visitData.patientName } }] },
                "Fee": { number: Number(t.fee) || 0 },
                "Status": { select: { name: t.status } },
                "Tooth": { select: { name: (t.tooth && t.tooth[0]) || "全口" } },
                "date:ScheduledDate:start": t.scheduledDate || null
              }
            })
          });
        }
      }
      console.log("Visit and treatments saved to Notion");
    } catch (e) {
      console.error("Failed to save visit to Notion:", e);
    }
  };

  if (selectedPatientId) {
    return (
      <>
        <PatientProfile patient={selectedPatient} onClose={() => setSelectedPatientId(null)} onOpenVisit={(appt) => { setVisitModal(appt); }} onSaveVisit={handleSaveVisit} />
        {visitModal && <VisitModal appt={visitModal} patient={selectedPatient} onClose={() => setVisitModal(null)} onSave={handleSaveVisit} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e18] text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[#080f1a] border-r border-[#1e3048] flex flex-col z-30">
        <div className="px-5 py-5 border-b border-[#1e3048]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">牙</div>
            <div>
              <div className="text-sm font-bold text-white">DentalCRM</div>
              <div className="text-xs text-gray-500">診所管理系統</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === item.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white hover:bg-[#111e2e]"}`}>
              <Icon name={item.icon} size={16} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[#1e3048]">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500/30 to-pink-500/30 rounded-full flex items-center justify-center text-xs font-bold text-violet-400">張</div>
            <div>
              <div className="text-xs font-medium text-white">戴醫師</div>
              <div className="text-xs text-gray-500">主治醫師</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56 min-h-screen">
        <header className="sticky top-0 z-20 bg-[#060e18]/90 border-b border-[#1e3048] px-6 py-4 flex items-center justify-between" style={{ backdropFilter: "blur(12px)" }}>
          <h1 className="text-base font-semibold text-white">
            {view === "dashboard" && "今日儀表板"}
            {view === "patients" && "病患管理"}
            {view === "images" && "影像庫"}
            {view === "finance" && "業績管理"}
            {view === "learning" && "學習資料庫"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">2026-03-13 週五</div>
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Icon name="notification" size={18} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white" style={{fontSize:"9px"}}>4</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          {view === "dashboard" && <DashboardView patients={patients} schedule={TODAY_SCHEDULE} onOpenPatient={id => setSelectedPatientId(id)} onOpenVisit={appt => setVisitModal(appt)} onAddPatient={() => setShowNewPatient(true)} onSaveVisit={handleSaveVisit} />}
          {view === "patients" && <PatientsView patients={patients} onOpenPatient={id => setSelectedPatientId(id)} onAddPatient={() => setShowNewPatient(true)} />}
          {view === "finance" && <FinanceView />}
          {view === "learning" && <LearningView />}
          {view === "images" && (
            <div className="space-y-4">
              <div className="bg-[#0a1420] border border-[#1e3048] rounded-xl p-6 text-center">
                <div className="text-cyan-400 mb-3"><Icon name="image" size={40} /></div>
                <h2 className="text-lg font-semibold text-white mb-2">全院影像庫</h2>
                <p className="text-sm text-gray-400 mb-4">集中管理所有病患影像,支援牙位區域類型分類可串接 Lightroom 目錄</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {["口內照", "X光片", "DSD照", "術後照"].map((cat, i) => (
                    <div key={i} className="bg-[#1a2535] border border-[#2a3a50] rounded-xl p-4 text-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <div className="text-2xl mb-2"></div>
                      <div className="text-sm font-medium text-white">{cat}</div>
                      <div className="text-xs text-gray-500 mt-1">{Math.floor(Math.random()*50)+10} 張</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {visitModal && <VisitModal appt={visitModal} patient={patients.find(p => p.id === visitModal.patientId)} onClose={() => setVisitModal(null)} onSave={handleSaveVisit} />}
      {showNewPatient && <NewPatientModal onClose={() => setShowNewPatient(false)} onSave={handleAddPatient} />}
    </div>
  );
}
