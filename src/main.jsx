import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const UPI_ID = 'bapi.debnath08-1@oksbi';
const QR_IMAGE = '/upi-qr-bapi-debnath.jpeg';

const modules = [
  { id: 1, name: 'Career Clarity', lessons: ['Why Most Careers Fail Without Direction', 'How to Find Your Career Path', 'Skill vs Degree vs Experience', 'Career Mapping for 6 Months', 'Avoid Random Job Switching'] },
  { id: 2, name: 'CV Evaluation & Optimization', lessons: ['What HR Sees in 10 Seconds', 'ATS-Friendly Resume Format', 'Fresher Resume Formula', 'Experienced Resume Formula', 'Common CV Mistakes'] },
  { id: 3, name: 'HR Mindset', lessons: ['What Recruiters Really Want', 'Why Good Candidates Get Rejected', 'How HR Shortlists Candidates', 'Company Culture Fit', 'How to Build Trust in Interview'] },
  { id: 4, name: 'Interview Cracking System', lessons: ['Tell Me About Yourself', 'Strengths & Weaknesses', 'Why Should We Hire You', 'Handling Difficult Questions', 'Final Interview Strategy'] },
  { id: 5, name: 'Salary Negotiation Mastery', lessons: ['Know Your Market Value', 'Current CTC vs Expected CTC', 'Negotiation Without Fear', 'Offer Letter Evaluation', 'Joining Decision Framework'] },
  { id: 6, name: 'Job Switching Strategy', lessons: ['Smart Switch vs Emotional Switch', 'When to Change Job', 'How to Resign Professionally', 'Counter Offer Trap', 'Long-Term Career Growth'] },
  { id: 7, name: 'AI Skills for Career Growth', lessons: ['AI Skills Every Candidate Needs', 'ChatGPT for Resume Writing', 'ChatGPT for Interview Practice', 'AI for LinkedIn Profile', 'AI Productivity at Work'] },
  { id: 8, name: 'Personal Branding & LinkedIn', lessons: ['LinkedIn Profile Setup', 'Headline & About Section', 'How to Message Recruiters', 'Content Posting Strategy', 'Networking Without Begging'] },
  { id: 9, name: 'Corporate Behavior & Growth', lessons: ['Office Communication', 'Email & WhatsApp Etiquette', 'Boss & Team Handling', 'Discipline & Ownership', 'Promotion Mindset'] },
  { id: 10, name: 'Long-Term Career Planning', lessons: ['1-Year Career Plan', '3-Year Growth Plan', 'Skill Upgrade Calendar', 'Financial Discipline for Career', 'Final Career Transformation Plan'] },
];

const lessons = modules.flatMap((m) => m.lessons.map((title, i) => ({
  id: (m.id - 1) * 5 + i + 1,
  moduleId: m.id,
  moduleName: m.name,
  title,
  duration: `${6 + ((m.id + i) % 6)} min`,
})));

const sampleQuestions = [
  { q: 'Most careers fail mainly because of what?', options: ['Lack of talent', 'Lack of direction', 'Lack of luck', 'Lack of English'], answer: 1 },
  { q: 'Changing jobs every 6 months only for small increment creates what risk?', options: ['Strong stability', 'Better trust', 'Weak career credibility', 'Guaranteed promotion'], answer: 2 },
  { q: 'What should guide career path selection?', options: ['Only salary', 'Only family pressure', 'Education + skill + interest + market demand', 'Random trend'], answer: 2 },
  { q: 'What does HR usually scan first in a CV?', options: ['Relevant skills and role match', 'Photo only', 'Hobbies only', 'Long paragraphs'], answer: 0 },
  { q: 'Minimum score needed to unlock next lesson is:', options: ['50%', '75%', '90%', '95%'], answer: 3 },
];

function calculateScore(questions, answers) {
  if (!questions.length) return 0;
  const correct = questions.reduce((sum, item, index) => sum + (answers[index] === item.answer ? 1 : 0), 0);
  return Math.round((correct / questions.length) * 100);
}

function shouldUnlockNext(score, selectedLessonId, unlockedUntil, totalLessons) {
  return score >= 95 && selectedLessonId === unlockedUntil && unlockedUntil < totalLessons;
}

function runSanityTests() {
  console.assert(modules.length === 10, 'Expected 10 modules');
  console.assert(lessons.length === 50, 'Expected 50 lessons');
  console.assert(calculateScore(sampleQuestions, { 0: 1, 1: 2, 2: 2, 3: 0, 4: 3 }) === 100, 'Expected perfect score');
  console.assert(shouldUnlockNext(100, 1, 1, 50) === true, 'Expected unlock on 100%');
  console.assert(shouldUnlockNext(80, 1, 1, 50) === false, 'Expected lock on 80%');
}
runSanityTests();

function Logo() {
  return <div className="logo"><div className="logoMark">🎓</div><div><div className="brand">JSS Career Academy</div><div className="tag">Education · HR Guidance · AI Career Growth</div></div></div>;
}

function Header({ go }) {
  return <header className="header"><div className="nav"><Logo /><nav className="links"><a href="#course">Course</a><a href="#pricing">Pricing</a><a href="#payment">UPI Payment</a><a href="#dashboard">Demo</a></nav><button className="btn" onClick={() => go('payment')}>Start Now</button></div></header>;
}

function Hero({ go }) {
  return <section className="hero"><div className="heroGrid"><div><span className="pill">India-focused education and career growth platform</span><h1 className="h1">Start Your Career with True Guidance</h1><p className="lead">A 6-month, 50-video AI avatar course by Bapi Debnath, built from 20+ years of real HR experience. Learn career clarity, CV optimization, interviews, salary negotiation, AI skills and LinkedIn growth.</p><div className="actions"><button className="btn" onClick={() => go('payment')}>Join with UPI Payment</button><button className="btn secondary" onClick={() => go('auth')}>Signup / Login</button></div><div className="stats"><div className="stat"><b>50</b><br/>AI videos</div><div className="stat"><b>95%</b><br/>Pass rule</div><div className="stat"><b>₹199</b><br/>Starter plan</div></div></div><div className="mentorCard"><div className="mentorTop"><div className="mentorRow"><div className="avatar">BD</div><div><h2>Bapi Debnath</h2><p>Founder Mentor · 20+ Years HR</p></div></div><div className="current"><small>Current lesson</small><h3>Why Most Careers Fail Without Direction</h3><div className="progress"><span /></div></div></div></div></div></section>;
}

function AuthPanel({ supabase, session, setSession }) {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const disabled = !supabase;

  async function submit(e) {
    e.preventDefault();
    setMessage('Please wait...');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === 'signup' ? 'Signup done. If email confirmation is enabled, check inbox.' : 'Login successful.');
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } catch (err) {
      setMessage(err.message || 'Auth error');
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return <section id="auth" className="section"><div className="wrap"><h2 className="sectionTitle">Signup / Login</h2><p className="sub">Create your student account before submitting UPI payment proof.</p>{disabled && <div className="notice">Supabase keys are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Environment Variables.</div>}{session ? <div className="card"><h3>Logged in</h3><p>{session.user.email}</p><button className="btn secondary" onClick={logout}>Logout</button></div> : <form className="card form" onSubmit={submit}><div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@email.com" /></div><div><label className="label">Password</label><input className="input" type="password" required minLength="6" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters" /></div><div className="actions"><button type="button" className="btn secondary" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Switch to Login' : 'Switch to Signup'}</button><button className="btn" type="submit">{mode === 'signup' ? 'Create Account' : 'Login'}</button></div>{message && <div className="notice">{message}</div>}</form>}</div></section>;
}

function PaymentPanel({ supabase, session }) {
  const [form, setForm] = useState({ name: '', email: session?.user?.email || '', phone: '', plan: 'Starter ₹199', amount: 199, transaction_id: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [latestPayment, setLatestPayment] = useState(null);

  useEffect(() => { setForm(f => ({ ...f, email: session?.user?.email || f.email })); }, [session?.user?.email]);
  useEffect(() => { if (supabase && session) loadLatestPayment(); }, [supabase, session]);

  async function loadLatestPayment() {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!error) setLatestPayment(data);
  }

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function updatePlan(value) {
    const amount = value.includes('Growth') ? 299 : value.includes('Pro') ? 499 : value.includes('Lifetime') ? 1999 : 199;
    setForm(prev => ({ ...prev, plan: value, amount }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!supabase) return setMessage('Supabase is not connected.');
    if (!session) return setMessage('Please signup/login first, then submit payment proof.');
    if (!file) return setMessage('Please upload payment screenshot.');
    setMessage('Uploading screenshot and submitting proof...');
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '-');
      const path = `${session.user.id}/${Date.now()}-${safeName}`;
      const upload = await supabase.storage.from('payment-screenshots').upload(path, file, { upsert: false });
      if (upload.error) throw upload.error;
      const insert = await supabase.from('payments').insert({
        user_id: session.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        plan: form.plan,
        amount: Number(form.amount),
        upi_id: UPI_ID,
        transaction_id: form.transaction_id,
        screenshot_path: path,
        status: 'pending'
      }).select().single();
      if (insert.error) throw insert.error;
      setLatestPayment(insert.data);
      setMessage('Payment proof submitted successfully. Status: Pending approval.');
    } catch (err) {
      setMessage(err.message || 'Payment proof submission failed.');
    }
  }

  const status = latestPayment?.status;

  return <section id="payment" className="section"><div className="wrap"><h2 className="sectionTitle">UPI Payment + Screenshot Upload</h2><p className="sub">Pay using any UPI app, then submit transaction ID and screenshot. Course unlocks after manual approval.</p><div className="payGrid"><div className="card qrBox"><img className="qr" src={QR_IMAGE} alt="Bapi Debnath UPI QR Code" /><div className="upiLine"><span className="code">{UPI_ID}</span><button className="btn small secondary" onClick={() => navigator.clipboard.writeText(UPI_ID)}>Copy UPI ID</button></div><p className="sub">Scan this QR with Google Pay, PhonePe, Paytm, BHIM or any UPI app.</p></div><div className="card"><h3>Submit Payment Proof</h3>{!session && <div className="notice">Please signup/login before submitting payment proof.</div>}{status && <div className={`status ${status}`}>Latest payment status: {status.toUpperCase()}{status === 'approved' ? ' — Course unlocked.' : status === 'pending' ? ' — Admin approval pending.' : ' — Please contact support.'}</div>}<form className="form" onSubmit={submit}><div><label className="label">Plan</label><select className="input" value={form.plan} onChange={e => updatePlan(e.target.value)}><option>Starter ₹199</option><option>Growth ₹299</option><option>Pro ₹499</option><option>Lifetime ₹1999</option></select></div><div><label className="label">Name</label><input className="input" required value={form.name} onChange={e => update('name', e.target.value)} /></div><div><label className="label">Email</label><input className="input" required type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div><div><label className="label">Mobile Number</label><input className="input" required value={form.phone} onChange={e => update('phone', e.target.value)} /></div><div><label className="label">UPI Transaction ID / UTR</label><input className="input" required value={form.transaction_id} onChange={e => update('transaction_id', e.target.value)} placeholder="Example: 412345678901" /></div><div><label className="label">Payment Screenshot</label><input className="input" required type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} /></div><button className="btn teal" type="submit">Submit Payment Proof</button>{message && <div className="notice">{message}</div>}</form></div></div></div></section>;
}

function CourseSection() {
  return <section id="course" className="section course"><div className="wrap"><h2 className="sectionTitle">10 modules, 50 locked progression videos</h2><p className="sub" style={{color:'#e0f2fe'}}>Each video includes practical HR insights, assessment questions, and a 95% pass rule.</p><div className="modules">{modules.map(m => <div className="module" key={m.id}><small>Module {m.id}</small><h3>{m.name}</h3><p>5 videos</p></div>)}</div></div></section>;
}

function PricingSection({ go }) {
  const items = [
    ['Starter', '₹199', ['50 videos', 'Quizzes', 'Progress tracking']],
    ['Growth', '₹299', ['Everything in Starter', 'Community', 'AI CV score']],
    ['Pro', '₹499', ['Interview simulator', 'Certificate', 'Salary calculator']],
    ['Lifetime', '₹1,999', ['One-time access', 'Future updates', 'Best value']],
  ];
  return <section id="pricing" className="section"><div className="wrap"><h2 className="sectionTitle">Affordable Indian Market Pricing</h2><p className="sub">No payment gateway charges. Manual UPI approval system.</p><div className="pricing">{items.map(([name, price, features]) => <div className="card" key={name}><h3>{name}</h3><div className="price">{price}</div><ul className="list">{features.map(f => <li key={f}>{f}</li>)}</ul><button className="btn" onClick={() => go('payment')}>Pay via UPI</button></div>)}</div></div></section>;
}

function Dashboard({ approved }) {
  const [unlockedUntil, setUnlockedUntil] = useState(approved ? 1 : 0);
  const [selected, setSelected] = useState(lessons[0]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => { setUnlockedUntil(approved ? 1 : 0); }, [approved]);
  const progress = Math.round((Math.max(unlockedUntil - 1, 0) / lessons.length) * 100);
  function scoreQuiz() {
    const score = calculateScore(sampleQuestions, answers);
    setResult(score);
    if (shouldUnlockNext(score, selected.id, unlockedUntil, lessons.length)) setUnlockedUntil(unlockedUntil + 1);
  }
  return <section id="dashboard" className="section dashboard"><div className="wrap"><h2 className="sectionTitle">Student Dashboard Demo</h2><p className="sub">Course opens only after UPI payment is approved.</p>{!approved && <div className="notice">Course locked. Submit UPI payment proof and wait for admin approval.</div>}<div className="stats"><div className="stat"><b>{progress}%</b><br/>Completed</div><div className="stat"><b>{unlockedUntil}</b><br/>Unlocked lesson</div><div className="stat"><b>95%</b><br/>Pass rule</div></div><div className="dashGrid" style={{marginTop:24}}><div className="card lessonList">{lessons.map(l => { const locked = !approved || l.id > unlockedUntil; return <button key={l.id} disabled={locked} className={`lesson ${locked?'locked':''} ${selected.id===l.id?'active':''}`} onClick={() => { setSelected(l); setAnswers({}); setResult(null); }}><b>Video {l.id}</b><br/>{l.title}<br/><small>{l.moduleName} · {l.duration}</small></button>; })}</div><div className="card"><h3>Video {selected.id}: {selected.title}</h3><div className="videoBox"><div><div style={{fontSize:60}}>▶</div><h3>AI Avatar Video Placeholder</h3><p>Bapi Debnath Hindi + English guidance video</p></div></div><h3>Assessment Test</h3>{sampleQuestions.map((q, qi) => <div key={q.q} className="card" style={{boxShadow:'none',marginTop:12}}><b>{qi+1}. {q.q}</b>{q.options.map((o, oi) => <label key={o} style={{display:'block',marginTop:10}}><input type="radio" name={`q${qi}`} checked={answers[qi]===oi} onChange={() => setAnswers({...answers,[qi]:oi})} /> {o}</label>)}</div>)}<button className="btn" onClick={scoreQuiz} disabled={!approved}>Submit Assessment</button>{result !== null && <div className={`status ${result >= 95 ? 'approved' : 'pending'}`}>Score: {result}%. {result >= 95 ? 'Passed. Next video unlocked.' : 'Retry required.'}</div>}</div></div></div></section>;
}

function AdminGuide() {
  return <section className="section"><div className="wrap"><h2 className="sectionTitle">Admin Approval Process</h2><div className="card"><ol className="sub"><li>Open Supabase → Table Editor → payments.</li><li>Check name, phone, transaction ID and screenshot_path.</li><li>Verify payment in your UPI app/bank.</li><li>Change status from <b>pending</b> to <b>approved</b>.</li><li>User refreshes app and course unlocks.</li></ol></div></div></section>;
}

function ToolsSection() {
  return <section className="section" style={{background:'#f0f9ff'}}><div className="wrap"><h2 className="sectionTitle">AI Career Tools Built Into Platform</h2><div className="tools"><div className="card"><h3>Resume Analyzer</h3><p>ATS score and HR impression.</p></div><div className="card"><h3>Interview Simulator</h3><p>Role-wise AI interview practice.</p></div><div className="card"><h3>Salary Calculator</h3><p>Market value and negotiation script.</p></div><div className="card"><h3>Community</h3><p>Level-wise student groups.</p></div></div></div></section>;
}

function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [approved, setApproved] = useState(false);

  function go(id) { setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 30); }

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/env');
        const cfg = await res.json();
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          const client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
          setSupabase(client);
          const { data } = await client.auth.getSession();
          setSession(data.session);
          client.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
        }
      } catch (err) { console.error(err); }
    }
    init();
  }, []);

  useEffect(() => {
    async function checkApproval() {
      if (!supabase || !session) { setApproved(false); return; }
      const { data } = await supabase.from('payments').select('status').eq('status', 'approved').limit(1).maybeSingle();
      setApproved(Boolean(data));
    }
    checkApproval();
  }, [supabase, session]);

  return <><Header go={go} /><Hero go={go} /><AuthPanel supabase={supabase} session={session} setSession={setSession} /><CourseSection /><PricingSection go={go} /><PaymentPanel supabase={supabase} session={session} /><Dashboard approved={approved} /><AdminGuide /><ToolsSection /><footer className="footer"><div className="wrap"><Logo /><div>© 2026 JSS Career Academy. UPI payment enabled.</div></div></footer></>;
}

createRoot(document.getElementById('root')).render(<App />);
