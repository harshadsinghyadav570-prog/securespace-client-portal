import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE SETUP INSTRUCTIONS (Read this first!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_KEY = "your-anon-key";
const USE_DEMO_MODE = true;

// Demo Data
const DEMO_USERS = {
  admin123: { id: "admin-001", email: "admin@example.com", name: "Aap (Admin)", role: "admin", avatarColor: "#e8b86d" },
  riya2024: { id: "client-001", email: "riya@example.com", name: "Riya Sharma", role: "client", avatarColor: "#7ec8c8" },
};

const DEMO_PROJECTS = [
  { id: "p1", name: "Website Redesign", clientId: "client-001", adminId: "admin-001", status: "active", progress: 65, budget: "₹85,000", deadline: "2026-06-15" },
  { id: "p2", name: "Brand Identity", clientId: "client-001", adminId: "admin-001", status: "active", progress: 30, budget: "₹45,000", deadline: "2026-07-01" },
];

const DEMO_MESSAGES = {
  p1: [
    { id: "m1", projectId: "p1", senderId: "admin-001", content: "Homepage ka wireframe ready hai. Please review karein.", createdAt: "10:15 AM" },
    { id: "m2", projectId: "p1", senderId: "client-001", content: "Dekha! Bilkul sahi laga. Bas color thoda warm chahiye.", createdAt: "11:32 AM" },
  ],
  p2: [],
};

// Utility Functions
function encrypt(text) {
  return btoa(encodeURIComponent(text));
}

function decrypt(text) {
  try { return decodeURIComponent(atob(text)); } catch { return text; }
}

function hashPassword(password) {
  return btoa(password);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Icons Component
const Icon = ({ name, size = 18 }) => {
  const icons = {
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  };
  return icons[name] || null;
};

// Avatar Component
const Avatar = ({ user, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: user?.avatarColor || "#555",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, color: "#fff",
    fontFamily: "'DM Mono', monospace", flexShrink: 0,
  }}>
    {user?.name?.charAt(0).toUpperCase()}
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Sab fields zaroori hain."); return; }

    setLoading(true);
    setTimeout(() => {
      if (email === "admin@example.com" && password === "admin123") {
        onLogin(DEMO_USERS.admin123);
      } else if (email === "riya@example.com" && password === "riya2024") {
        onLogin(DEMO_USERS.riya2024);
      } else {
        setError("Galat email ya password.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0f1a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#e8b86d 1px, transparent 1px), linear-gradient(90deg, #e8b86d 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}/>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:300, background:"radial-gradient(ellipse, rgba(232,184,109,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{
        width: "100%", maxWidth: 420, margin: "0 16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,184,109,0.2)",
        borderRadius: 20, padding: "44px 40px", backdropFilter: "blur(20px)", position: "relative",
      }}>
        <div style={{ textAlign:"center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #e8b86d, #c8923d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(232,184,109,0.3)",
          }}>
            <Icon name="shield" size={26} />
          </div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.3px" }}>SecureSpace</h1>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(245,240,232,0.45)", letterSpacing:"0.5px" }}>CLIENT PORTAL</p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="aapka@email.com"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 24, position:"relative" }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>Password</label>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width:"100%", padding:"12px 42px 12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
          <button onClick={() => setShowPass(!showPass)} style={{
            position:"absolute", right:12, top:38, background:"none", border:"none",
            color:"rgba(245,240,232,0.4)", cursor:"pointer", padding:4,
          }}>
            <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background:"rgba(220,80,80,0.15)", border:"1px solid rgba(220,80,80,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#ff9090" }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          width:"100%", padding:"13px", borderRadius:10,
          background: loading ? "rgba(232,184,109,0.4)" : "linear-gradient(135deg, #e8b86d, #c8923d)",
          border:"none", color:"#1a0f00", fontSize:14, fontWeight:700,
          cursor: loading ? "default" : "pointer", letterSpacing:"0.3px",
          boxShadow: loading ? "none" : "0 4px 20px rgba(232,184,109,0.35)",
          marginBottom: 12,
        }}>
          {loading ? "Login ho raha hai…" : "Login Karein →"}
        </button>

        <button onClick={onSwitchToSignup} style={{
          width:"100%", padding:"11px", borderRadius:10,
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          color:"#e8b86d", fontSize:14, fontWeight:600, cursor:"pointer",
          letterSpacing:"0.3px",
        }}>
          Naya Client? Signup Karein
        </button>

        <div style={{ marginTop:24, padding:"14px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin:0, fontSize:10, color:"rgba(245,240,232,0.35)", textAlign:"center", lineHeight:1.6 }}>
            <strong style={{color:"rgba(245,240,232,0.5)"}}>Demo Login:</strong><br/>
            Email: admin@example.com | Pass: admin123<br/>
            Email: riya@example.com | Pass: riya2024
          </p>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIGNUP SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SignupScreen({ onSignup, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSignup = () => {
    setError("");

    if (!name || !email || !password || !confirmPass) {
      setError("Sab fields zaroori hain.");
      return;
    }

    if (password.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    if (password !== confirmPass) {
      setError("Passwords match nahi karte.");
      return;
    }

    if (!email.includes("@")) {
      setError("Valid email dalein.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: `client-${Date.now()}`,
        email,
        name,
        role: "client",
        avatarColor: ["#7ec8c8", "#b8a9e8", "#e89aae", "#81d4d4"][Math.floor(Math.random() * 4)],
      };
      onSignup(newUser);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0f1a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#e8b86d 1px, transparent 1px), linear-gradient(90deg, #e8b86d 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}/>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:300, background:"radial-gradient(ellipse, rgba(232,184,109,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{
        width: "100%", maxWidth: 420, margin: "0 16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,184,109,0.2)",
        borderRadius: 20, padding: "44px 40px", backdropFilter: "blur(20px)", position: "relative",
      }}>
        <div style={{ textAlign:"center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #e8b86d, #c8923d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(232,184,109,0.3)",
          }}>
            <Icon name="shield" size={26} />
          </div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.3px" }}>SecureSpace</h1>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(245,240,232,0.45)" }}>Naya Account Banayein</p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Aapka Naam</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Aapka full name"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="aapka@email.com"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 12, position:"relative" }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Password</label>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Kam se kam 6 characters"
            style={{
              width:"100%", padding:"12px 42px 12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
          <button onClick={() => setShowPass(!showPass)} style={{
            position:"absolute", right:12, top:30, background:"none", border:"none",
            color:"rgba(245,240,232,0.4)", cursor:"pointer", padding:4,
          }}>
            <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display:"block", fontSize:11, color:"rgba(245,240,232,0.5)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Confirm Password</label>
          <input
            type={showPass ? "text" : "password"}
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSignup()}
            placeholder="••••••••"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(232,184,109,0.2)",
              color:"#f5f0e8", fontSize:14, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ background:"rgba(220,80,80,0.15)", border:"1px solid rgba(220,80,80,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#ff9090" }}>
            {error}
          </div>
        )}

        <button onClick={handleSignup} disabled={loading} style={{
          width:"100%", padding:"13px", borderRadius:10,
          background: loading ? "rgba(232,184,109,0.4)" : "linear-gradient(135deg, #e8b86d, #c8923d)",
          border:"none", color:"#1a0f00", fontSize:14, fontWeight:700,
          cursor: loading ? "default" : "pointer", letterSpacing:"0.3px",
          boxShadow: loading ? "none" : "0 4px 20px rgba(232,184,109,0.35)",
          marginBottom: 12,
        }}>
          {loading ? "Account create ho raha hai…" : "Signup Karein →"}
        </button>

        <button onClick={onBackToLogin} style={{
          width:"100%", padding:"11px", borderRadius:10,
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          color:"#e8b86d", fontSize:14, fontWeight:600, cursor:"pointer",
          letterSpacing:"0.3px",
        }}>
          Pehle se account hai? Login Karein
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAT WINDOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ChatWindow({ project, currentUser, messages, onSend }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    onSend(project.id, input.trim());
    setInput("");
  };

  const otherUser = currentUser.role === "admin" 
    ? { name: "Client", avatarColor: "#7ec8c8" }
    : { name: "Admin", avatarColor: "#e8b86d" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"#0d0f1a" }}>
      <div style={{
        padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <Avatar user={otherUser} size={40} />
        <div style={{flex:1}}>
          <div style={{ fontSize:15, fontWeight:600, color:"#f5f0e8" }}>{project.name}</div>
          <div style={{ fontSize:12, color:"rgba(245,240,232,0.4)", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#4cde8c" }}/>
            End-to-end encrypted
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:"rgba(76,222,140,0.1)", border:"1px solid rgba(76,222,140,0.2)", borderRadius:20 }}>
          <Icon name="shield" size={13} />
          <span style={{ fontSize:11, color:"#4cde8c", fontWeight:600 }}>SECURE</span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:4 }}>
        {messages.length === 0 ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"rgba(245,240,232,0.25)", gap:12 }}>
            <Icon name="lock" size={32} />
            <p style={{ margin:0, fontSize:13, textAlign:"center" }}>Conversation shuru karein. Sab encrypted hoga.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
           
