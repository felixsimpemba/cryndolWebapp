import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronRight, ShieldCheck, PieChart, Users, Wallet,
  Smartphone, Globe, Sun, Moon, CheckCircle, ArrowRight,
  Clock, TrendingUp, Bell, FileText, Star, Zap, Lock, RefreshCw
} from 'lucide-react';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';

/* ─── Animation Variants ──────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
};

/* ─── Data ────────────────────────────────────────────────────── */
const STATS = [
  { value: '5,000+', label: 'Active Lenders' },
  { value: 'K480M+', label: 'Loans Tracked' },
  { value: '98.4%', label: 'Repayment Rate' },
  { value: '< 2 min', label: 'Loan Setup Time' },
];

const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up in under 2 minutes. No paperwork, no setup fees. Just an email and a password.',
    icon: <Zap size={22} />,
    color: 'emerald',
  },
  {
    step: '02',
    title: 'Add Your Borrowers',
    desc: 'Import existing clients or add new ones with full KYC details, NRC copies, and contact info.',
    icon: <Users size={22} />,
    color: 'blue',
  },
  {
    step: '03',
    title: 'Issue Loans Instantly',
    desc: 'Set interest rates, repayment schedules, and penalties. Cryndol calculates everything automatically.',
    icon: <Wallet size={22} />,
    color: 'violet',
  },
  {
    step: '04',
    title: 'Track & Get Paid',
    desc: 'Receive real-time alerts for payments due, defaults, and completed loans from any device.',
    icon: <Bell size={22} />,
    color: 'orange',
  },
];

const FEATURES = [
  {
    icon: <Users size={24} />,
    color: 'blue',
    title: 'Borrower Profiles',
    desc: 'Store KYC data, scanned documents, employment records, next-of-kin, and full credit history per client.',
    tags: ['NRC Upload', 'Credit Score', 'Document Vault'],
    wide: true,
  },
  {
    icon: <Wallet size={24} />,
    color: 'emerald',
    title: 'Smart Loans',
    desc: 'Automated amortisation, flat-rate, or reducing-balance interest — pick the method that fits.',
    tags: ['Auto Schedule', 'Late Fees', 'Rollover'],
    tall: true,
  },
  {
    icon: <PieChart size={24} />,
    color: 'orange',
    title: 'Live Analytics',
    desc: 'Revenue trends, collection rates, and overdue ageing reports at a glance.',
    tags: ['Revenue Chart', 'Overdue Ageing'],
  },
  {
    icon: <Bell size={24} />,
    color: 'rose',
    title: 'Smart Reminders',
    desc: 'Automated SMS & push notifications remind borrowers before and on payment day.',
    tags: ['SMS Alerts', 'Push Notify'],
  },
  {
    icon: <FileText size={24} />,
    color: 'violet',
    title: 'Instant Reports',
    desc: 'Export PDF loan statements, receipts, and portfolio summaries in one click.',
    tags: ['PDF Export', 'Excel Export'],
  },
  {
    icon: <ShieldCheck size={24} />,
    color: 'teal',
    title: 'Bank-Grade Security',
    desc: 'AES-256 encryption, two-factor auth, and role-based access control for your whole team.',
    tags: ['2FA', 'Role Access', 'Encrypted'],
    wide: true,
  },
];

const TESTIMONIALS = [
  {
    name: 'Mwila Banda',
    role: 'Independent Lender, Lusaka',
    text: 'Before Cryndol I tracked everything in a notebook. Now I manage 120 borrowers from my phone without missing a single repayment date.',
    rating: 5,
  },
  {
    name: 'Chanda Mutale',
    role: 'Microfinance Officer, Ndola',
    text: 'The automatic repayment schedules alone saved me 4 hours a week. The PDF statements look incredibly professional to clients.',
    rating: 5,
  },
  {
    name: 'Grace Phiri',
    role: 'SME Lender, Kitwe',
    text: 'I was skeptical at first, but setup took less than 10 minutes. My collection rate jumped from 82% to 96% in two months.',
    rating: 5,
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for individuals just getting started.',
    features: ['Up to 20 borrowers', 'Loan tracking', 'Basic analytics', 'PDF statements'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'K299',
    period: '/month',
    desc: 'For growing lenders who need more power.',
    features: ['Unlimited borrowers', 'SMS reminders', 'Advanced analytics', 'Excel exports', 'Priority support', 'Multi-device access'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: 'K799',
    period: '/month',
    desc: 'For teams and microfinance institutions.',
    features: ['Everything in Pro', 'Team accounts (5 users)', 'Role-based access', 'API access', 'Custom branding', 'Dedicated account manager'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', tag: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', tag: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  orange: { bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', tag: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  violet: { bg: 'bg-violet-500/10 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', tag: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
  rose: { bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', tag: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
  teal: { bg: 'bg-teal-500/10 dark:bg-teal-500/15', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', tag: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
};

/* ─── CheckCircle2 SVG ────────────────────────────────────────── */
const CheckCircle2 = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
);

/* ─── Main Component ──────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-50 font-sans selection:bg-emerald-500/30 transition-colors duration-300">

      {/* ── Mobile Nav Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-white dark:bg-[#0F172A] px-6 py-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <img src={logo} alt="Cryndol" className="h-12 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-6 text-lg font-medium">
              {['features', 'how-it-works', 'pricing'].map(s => (
                <a key={s} href={`#${s}`} onClick={() => setIsMenuOpen(false)} className="text-slate-600 dark:text-slate-300 capitalize py-1">
                  {s.replace('-', ' ')}
                </a>
              ))}
              <div className="flex items-center gap-4 py-2" onClick={toggleTheme}>
                <span className="text-slate-600 dark:text-slate-300">Theme</span>
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated ? (
                <button onClick={() => navigate('/app/dashboard')} className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-900 font-bold text-lg">Go to Dashboard</button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-semibold text-lg">Log In</button>
                  <button onClick={() => navigate('/register')} className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-900 font-bold text-lg">Get Started Free</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-3' : 'py-6 bg-transparent'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <img src={logo} alt="Cryndol Logo" className="h-10 md:h-12 w-auto" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors">Pricing</a>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-3 ml-2">
              {isAuthenticated ? (
                <Link to="/app/dashboard" className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/10">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Log In</Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/10">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-800/50 rounded-full">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="pt-36 pb-16 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fade} className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by  lenders across Zambia
            </motion.span>

            <motion.h1 variants={fade} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.08]">
              Lending made <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                mobile & simple.
              </span>
            </motion.h1>

            <motion.p variants={fade} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Manage borrowers, track loans, automate repayments — all from your pocket. The complete lending platform built for Zambian lenders.
            </motion.p>

            <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 text-white dark:text-slate-900 font-bold text-base hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                Get Started Free <ChevronRight size={18} />
              </button>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                Log In
              </button>
            </motion.div>

            <motion.p variants={fade} className="text-sm text-slate-500 dark:text-slate-500">
              No credit card required · Free plan available · Set up in &lt; 2 minutes
            </motion.p>
          </motion.div>

          {/* App Preview */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} className="relative mt-20 mx-auto max-w-4xl">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="hidden md:flex flex-col gap-3">
                  <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  {['Dashboard', 'Borrowers', 'Loans', 'Reports'].map(l => (
                    <div key={l} className={`h-10 rounded-xl flex items-center px-4 text-xs font-medium ${l === 'Dashboard' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>{l}</div>
                  ))}
                </div>
                <div className="md:col-span-2 flex flex-col gap-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                      <div className="h-7 w-36 bg-slate-100 dark:bg-white/10 rounded" />
                    </div>
                    <div className="h-9 w-9 rounded-full bg-emerald-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['Active Loans', 'K1.2M', 'emerald'], ['Borrowers', '842', 'slate'], ['Overdue', '12', 'rose']].map(([label, val, c]) => (
                      <div key={label} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="text-slate-400 dark:text-slate-500 text-[10px] mb-1">{label}</div>
                        <div className={`text-lg font-bold ${c === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : c === 'rose' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-end justify-between p-4 px-6 gap-2">
                    {[35, 60, 45, 75, 55, 80, 65].map((h, i) => (
                      <div key={i} className="w-full h-full flex items-end">
                        <div className="w-full bg-emerald-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-4 -top-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl hidden sm:flex items-center gap-3 rotate-3 animate-float">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Payment Received</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">K5,000.00</div>
              </div>
            </div>
            <div className="absolute -left-6 bottom-8 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl hidden sm:flex items-center gap-3 -rotate-2 animate-float-slow">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp size={16} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">This Month</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">+24% Revenue</div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Stats Strip ────────────────────────────────────────── */}
      {/* <section className="py-14 px-6 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fade} custom={i}>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{s.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 dark:bg-[#0F172A]">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 text-center max-w-2xl mx-auto">
            <motion.p variants={fade} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Get started in minutes</motion.p>
            <motion.h2 variants={fade} className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">How Cryndol Works</motion.h2>
            <motion.p variants={fade} className="text-slate-600 dark:text-slate-400 text-lg">From signup to your first issued loan — it's faster than you think.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const c = colorMap[step.color];
              return (
                <motion.div key={i} variants={fade} custom={i} className="relative bg-white dark:bg-slate-900 rounded-[28px] p-7 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-10" />
                  )}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                    <span className="text-3xl font-black text-slate-100 dark:text-slate-800 leading-none">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Features Bento ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 md:text-center max-w-3xl md:mx-auto">
            <motion.p variants={fade} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Built for lenders</motion.p>
            <motion.h2 variants={fade} className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Everything in one place.</motion.h2>
            <motion.p variants={fade} className="text-slate-600 dark:text-slate-400 text-lg">Designed for the modern lender who needs speed, accuracy, and mobility.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(200px,auto)]">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              const cls = [
                'relative bg-slate-50 dark:bg-[#0F172A] rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 overflow-hidden group hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm flex flex-col',
                f.wide ? 'md:col-span-2' : '',
                f.tall ? 'md:row-span-2' : '',
              ].join(' ');
              return (
                <motion.div key={i} variants={fade} custom={i} className={cls}>
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center mb-5 flex-shrink-0`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 flex-1">{f.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map(tag => (
                      <span key={tag} className={`text-xs font-medium px-3 py-1 rounded-full ${c.tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div className={`absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tl ${c.bg} to-transparent rounded-tl-full translate-x-10 translate-y-10 opacity-40 group-hover:opacity-60 transition-opacity`} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-[#0F172A]">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14 text-center max-w-2xl mx-auto">
            <motion.p variants={fade} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Real results</motion.p>
            <motion.h2 variants={fade} className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Lenders love Cryndol.</motion.h2>
            <motion.p variants={fade} className="text-slate-600 dark:text-slate-400 text-lg">Join thousands of lenders who've transformed their business.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fade} custom={i} className="bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      {/* <section id="pricing" className="py-24 px-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14 text-center max-w-2xl mx-auto">
            <motion.p variants={fade} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Simple pricing</motion.p>
            <motion.h2 variants={fade} className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Plans for every lender.</motion.h2>
            <motion.p variants={fade} className="text-slate-600 dark:text-slate-400 text-lg">Start free, upgrade when you're ready. No hidden fees.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div key={i} variants={fade} custom={i} className={`relative rounded-[28px] p-8 flex flex-col transition-all hover:-translate-y-1 ${plan.highlight
                ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 border-0'
                : 'bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-4 rounded-full tracking-wide">MOST POPULAR</div>
                )}
                <div className="mb-6">
                  <div className={`text-sm font-bold uppercase tracking-widest mb-3 ${plan.highlight ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{plan.name}</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle size={15} className={plan.highlight ? 'text-emerald-100 flex-shrink-0' : 'text-emerald-500 flex-shrink-0'} />
                      <span className={plan.highlight ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] ${plan.highlight
                    ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-900'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm text-slate-500 dark:text-slate-500 mt-8">
            All plans include a 14-day free trial of Pro features. No credit card required.
          </motion.p>
        </div>
      </section> */}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-900 dark:bg-[#0B1120] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12)_0%,_transparent_70%)] pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fade} className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4">Ready to grow?</motion.p>
            <motion.h2 variants={fade} className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-5">
              Start Lending <span className="text-emerald-400">Today.</span>
            </motion.h2>
            <motion.p variants={fade} className="text-xl text-slate-400 mb-10">
              Zero setup fees. Cancel anytime. Your data, your control.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-10 py-4 rounded-full bg-emerald-500 text-slate-900 font-bold text-base hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/10 text-white font-semibold text-base hover:bg-white/15 transition-all border border-white/10">
                Sign In
              </button>
            </motion.div>
            <motion.p variants={fade} className="text-sm text-slate-500 mt-6">No credit card required · Set up in under 2 minutes</motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-14 px-6 border-t border-slate-800 bg-[#0B1120]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <img src={logo} alt="Cryndol" className="h-10 w-auto mb-4 opacity-90" />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                The pocket-sized powerhouse for Zambian lenders. Manage your entire lending business from any device.
              </p>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-4">Product</div>
              <div className="flex flex-col gap-3">
                {['Features', 'How It Works', 'Pricing', 'Security'].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-4">Company</div>
              <div className="flex flex-col gap-3">
                <Link to="/privacy-policy" className="text-slate-400 text-sm hover:text-white transition-colors">Privacy Policy</Link>
                <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2026 Cryndol Inc. Powered by Feltech.</p>
            <p className="text-slate-500 text-sm">Made with ❤️ for Zambian lenders.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;