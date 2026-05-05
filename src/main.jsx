import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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
  { id: 10, name: 'Long-Term Career Planning', lessons: ['1-Year Career Plan', '3-Year Growth Plan', 'Skill Upgrade Calendar', 'Financial Discipline for Career', 'Final Career Transformation Plan'] }
];
const lessons = modules.flatMap(m => m.lessons.map((title, i) => ({ id: (m.id - 1) * 5 + i + 1, moduleId: m.id, moduleName: m.name, title, duration: `${6 + ((m.id + i) % 6)} min` })));
const plans = [
  { id: 'starter', name: 'Starter', amount: 199, features: ['50 videos', 'Quiz unlock system', 'Progress tracking'] },
  { id: 'growth', name: 'Growth', amount: 299, badge: 'Popular', features: ['Everything in Starter', 'Community access', 'AI CV score'] },
  { id: 'pro', name: 'Pro', amount: 499, features: ['Interview simulator', 'Certificate', 'Salary calculator'] },
  { id: 'lifetime', name: 'Lifetime', amount: 1999, badge: 'Best Value', features: ['One-time payment', 'Future updates', 'Lifetime access'] }
];
const questions = [
  { q: 'Most careers fail mainly because of what?', options: ['Lack of talent', 'Lack of direction', 'Lack of luck', 'Lack of English'], answer: 1 },
  { q: 'A candidate changing jobs every 6 months only for small increment creates what risk?', options: ['Strong stability', 'Better trust', 'Weak career credibility', 'Guaranteed promotion'], answer: 2 },
  { q: 'What should guide career path selection?', options: ['Only salary', 'Only family pressure', 'Education + skill + interest + market demand', 'Random trend'], answer: 2 },
  { q: 'What does HR usually scan first in a CV?', options: ['Relevant skills and role match', 'Photo only', 'Hobbies only', 'Long paragraphs'], answer: 0 },
  { q: 'Minimum score needed to unlock next lesson is:', options: ['50%', '75%', '90%', '95%'], answer: 3 }
];

function score(q, a) { return Math.round(q.reduce((s, it, i) => s + (a[i] === it.answer ? 1 : 0), 0) / q.length * 100); }
function Icon({ type }) { const icons = { cap: '🎓', play: '▶', lock: '🔒', check: '✅', file: '📄', chat: '💬', chart: '📊', users: '👥', video: '🎥', trophy: '🏆', card: '💳', login: '🔐', phone: '📱' }; return <span className="icon">{icons[type] || '✨'}</span>; }
function Logo() { return <div className="logo"><div className="logoMark"><Icon type="cap" /></div><div><b>JSS Career Academy</b><small>Education · HR Guidance · AI Career Growth</small></div></div>; }
function Button({ children, secondary, onClick, disabled }) { return <button disabled={disabled} onClick={onClick} className={secondary ? 'btn secondary' : 'btn'}>{children}</button>; }
function Card({ children, className = '' }) { return <div className={'card ' + className}>{children}</div>; }

function AuthModal({ onClose, setUser }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  async function submit(e) {
    e.preventDefault();
    setMessage('Processing...');
    try {
      if (supabase) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { name: form.name, phone: form.phone } } });
          if (error) throw error;
          setUser({ email: form.email, name: form.name || form.email, phone: form.phone, id: data.user?.id || 'pending' });
          setMessage('Signup done. Check email if confirmation is enabled.');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
          if (error) throw error;
          setUser({ email: data.user.email, name: data.user.user_metadata?.name || data.user.email, id: data.user.id });
          setMessage('Login successful.');
        }
      } else {
        setUser({ email: form.email || 'demo@jsscareeracademy.com', name: form.name || 'Demo Student', phone: form.phone, id: 'demo-user' });
        setMessage('Demo login active. Add Supabase keys in Vercel for real login.');
      }
      setTimeout(onClose, 700);
    } catch (err) { setMessage(err.message); }
  }
  return <div className="modal"><Card className="modalBox"><button className="close" onClick={onClose}>×</button><h2><Icon type="login" /> {mode === 'signup' ? 'Create Student Account' : 'Student Login'}</h2><p>Login is required before payment and course access.</p><form onSubmit={submit}>{mode === 'signup' && <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}<input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />{mode === 'signup' && <input placeholder="Mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />}<input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><Button>{mode === 'signup' ? 'Create Account' : 'Login'}</Button></form><button className="textBtn" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Already registered? Login' : 'New student? Create account'}</button>{message && <div className="notice">{message}</div>}</Card></div>;
}

function PaymentModal({ onClose, user, setUser }) {
  const [message, setMessage] = useState('');
  function loadRazorpay() { return new Promise(resolve => { if (window.Razorpay) return resolve(true); const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s); }); }
  async function buy(plan) {
    if (!user) { setMessage('Please login first.'); return; }
    if (!razorpayKey) { setUser({ ...user, paid: true, plan: plan.name }); setMessage(`${plan.name} activated in demo mode. Add Razorpay keys for real payment.`); return; }
    setMessage('Opening secure payment...');
    const ok = await loadRazorpay();
    if (!ok) { setMessage('Razorpay checkout could not load.'); return; }
    const res = await fetch('/api/create-razorpay-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: plan.amount, planName: plan.name }) });
    const order = await res.json();
    if (!res.ok) { setMessage(order.error || 'Unable to create order.'); return; }
    const checkout = new window.Razorpay({ key: razorpayKey, amount: order.amount, currency: 'INR', name: 'JSS Career Academy', description: plan.name, order_id: order.orderId, prefill: { name: user.name, email: user.email, contact: user.phone }, handler: () => { setUser({ ...user, paid: true, plan: plan.name }); setMessage('Payment successful. Course unlocked.'); setTimeout(onClose, 900); }, theme: { color: '#0284c7' } });
    checkout.open();
  }
  return <div className="modal"><Card className="modalBox wide"><button className="close" onClick={onClose}>×</button><h2><Icon type="card" /> Choose Payment Plan</h2><p>After successful payment, dashboard and course progression become active.</p><div className="pricing compact">{plans.map(p => <Card key={p.id}><>{p.badge && <span className="badge">{p.badge}</span>}<h3>{p.name}</h3><h2>₹{p.amount}{p.id !== 'lifetime' && <small>/mo</small>}</h2>{p.features.map(f => <p className="feature" key={f}>✅ {f}</p>)}<Button onClick={() => buy(p)}>Pay ₹{p.amount}</Button></></Card>)}</div>{message && <div className="notice">{message}</div>}</Card></div>;
}

function Pricing({ openPayment }) { return <section id="pricing" className="section"><div className="container center"><h2>Affordable Indian Market Pricing</h2><p>Login first, then choose your plan.</p><div className="pricing">{plans.map(p => <Card key={p.id} className={p.id === 'lifetime' ? 'life' : ''}><>{p.badge && <span className="badge">{p.badge}</span>}<h3>{p.name}</h3><h2>₹{p.amount}{p.id !== 'lifetime' && <small>/mo</small>}</h2>{p.features.map(f => <p className="feature" key={f}>✅ {f}</p>)}<Button secondary={p.id === 'lifetime'} onClick={openPayment}>Join Now</Button></></Card>)}</div></div></section>; }

function Dashboard({ user }) { const [unlocked, setUnlocked] = useState(1); const [selected, setSelected] = useState(lessons[0]); const [answers, setAnswers] = useState({}); const [result, setResult] = useState(null); const current = useMemo(() => modules.find(m => m.id === selected.moduleId), [selected]); const progress = Math.round((unlocked - 1) / lessons.length * 100); function submit() { const s = score(questions, answers); setResult(s); if (s >= 95 && selected.id === unlocked && unlocked < lessons.length) setUnlocked(unlocked + 1); } return <section id="dashboard" className="section soft"><div className="container"><div className="sectionHead"><div><span className="eyebrow">Student Dashboard</span><h2>{user?.paid ? `Welcome, ${user.name}` : 'Locked Dashboard: Login + Payment Required'}</h2><p>{user?.paid ? `Active plan: ${user.plan || 'Demo'}` : 'User can see demo, but real course access is unlocked after payment.'}</p></div><div className="progressBox"><b>Overall Progress</b><div className="progress"><div style={{ width: `${progress}%` }} /></div><small>{progress}% completed</small></div></div><div className="dashboard"><Card className="lessonList">{lessons.map(l => { const locked = !user?.paid || l.id > unlocked, done = l.id < unlocked; return <button key={l.id} disabled={locked} onClick={() => { setSelected(l); setAnswers({}); setResult(null); }} className={selected.id === l.id ? 'lesson active' : 'lesson'}><div><small>Video {l.id} · Module {l.moduleId}</small><b>{l.title}</b><small>{l.duration} · {l.moduleName}</small></div><Icon type={locked ? 'lock' : done ? 'check' : 'play'} /></button>; })}</Card><div><Card><small className="sky">{current?.name}</small><h2>Video {selected.id}: {selected.title}</h2><div className="video"><Icon type={user?.paid ? 'play' : 'lock'} /><h3>{user?.paid ? 'AI Avatar Video Placeholder' : 'Please complete payment to unlock'}</h3><p>Bapi Debnath founder-style Hindi + English guidance video</p></div></Card>{user?.paid && <Card><h2>Assessment Test</h2><p>Score 95% or above to unlock next video.</p>{questions.map((it, i) => <div className="question" key={it.q}><b>{i + 1}. {it.q}</b><div className="options">{it.options.map((op, j) => <button key={op} onClick={() => setAnswers({ ...answers, [i]: j })} className={answers[i] === j ? 'chosen' : ''}>{op}</button>)}</div></div>)}<Button onClick={submit}>Submit Assessment</Button>{result !== null && <span className={result >= 95 ? 'pass result' : 'fail result'}>Score: {result}%. {result >= 95 ? 'Passed. Next video unlocked.' : 'Retry required with feedback.'}</span>}</Card>}</div></div></div></section>; }
function VideoStudio() { return <section id="videos" className="section"><div className="container"><span className="eyebrow">AI Video Production Studio</span><h2>50 videos ready for script → avatar → quiz workflow</h2><div className="table">{lessons.map(l => <div className="row" key={l.id}><b>{l.id}</b><div><b>{l.title}</b><small>{l.moduleName}</small></div><span>Script Ready</span><span>Quiz Ready</span><span>Video Pending</span></div>)}</div></div></section>; }
function App() { const [user, setUser] = useState(null); const [authOpen, setAuthOpen] = useState(false); const [payOpen, setPayOpen] = useState(false); const needLoginThenPay = () => user ? setPayOpen(true) : setAuthOpen(true); return <div><header><Logo /><nav><a href="#course">Course</a><a href="#pricing">Pricing</a><a href="#dashboard">Dashboard</a><a href="#videos">Videos</a></nav><div className="headerActions">{user && <span className="userChip">{user.paid ? 'Paid' : 'Logged in'} · {user.name}</span>}<Button onClick={needLoginThenPay}>{user?.paid ? 'Dashboard' : 'Start Now'}</Button></div></header><section className="hero"><div className="container heroGrid"><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><span className="pill">Login + Payment System Added</span><h1>Start Your Career with True Guidance</h1><p>A 6-month, 50-video AI avatar course with login, payment flow, locked dashboard and 95% quiz progression.</p><div className="actions"><Button onClick={needLoginThenPay}>Join at ₹199/month →</Button><Button secondary onClick={() => setAuthOpen(true)}>Student Login</Button></div><div className="stats"><div><b>50</b><small>AI videos</small></div><div><b>95%</b><small>pass rule</small></div><div><b>₹199</b><small>start plan</small></div></div></motion.div><Card className="mentor"><div className="mentorTop"><div className="avatar">BD</div><div><h2>Bapi Debnath</h2><p>Founder Mentor · 20+ Years HR</p></div></div><div className="current"><small>Access Status</small><h3>{user?.paid ? 'Course Unlocked' : user ? 'Login Done - Payment Pending' : 'Login Required'}</h3><div className="progress"><div style={{ width: user?.paid ? '100%' : user ? '50%' : '20%' }} /></div></div><div className="miniGrid"><div><Icon type="login" /><b>Login</b></div><div><Icon type="card" /><b>Payment</b></div></div></Card></div></section><section id="course" className="section blue"><div className="container"><span className="eyebrow light">Course Architecture</span><h2>10 modules, 50 locked progression videos</h2><div className="moduleGrid">{modules.map(m => <div key={m.id}><small>Module {m.id}</small><b>{m.name}</b><p>5 videos</p></div>)}</div></div></section><Pricing openPayment={needLoginThenPay} /><Dashboard user={user} /><VideoStudio /><section id="tools" className="section soft"><div className="container"><h2>AI Career Tools Built Into Platform</h2><div className="tools">{[['file', 'Resume Analyzer', 'ATS score, HR impression and rewrite tips.'], ['chat', 'Interview Simulator', 'Role-wise AI interview practice.'], ['chart', 'Salary Calculator', 'Market value and negotiation script.'], ['users', 'Community', 'Level-wise groups by module progress.']].map(x => <Card key={x[1]}><Icon type={x[0]} /><h3>{x[1]}</h3><p>{x[2]}</p></Card>)}</div></div></section><footer><Logo /><p>© 2026 JSS Career Academy. Built for career transformation.</p></footer>{authOpen && <AuthModal onClose={() => setAuthOpen(false)} setUser={setUser} />}{payOpen && <PaymentModal onClose={() => setPayOpen(false)} user={user} setUser={setUser} />}</div>; }

createRoot(document.getElementById('root')).render(<App />);
