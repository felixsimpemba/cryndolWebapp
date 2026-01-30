import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, ShieldCheck, PieChart, Users, Wallet, Smartphone, Globe, Sun, Moon } from 'lucide-react';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-50 font-sans selection:bg-emerald-500/30 transition-colors duration-300">

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-white dark:bg-[#0F172A] px-6 py-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <img src={logo} alt="Cryndol" className="h-12 w-auto" />
              <button onClick={toggleMenu} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-6 text-2xl font-medium">
              {/* <a onClick={toggleMenu} href="#features" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-white">Features</a>
              <a onClick={toggleMenu} href="#security" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-white">Security</a> */}
              <div className="flex items-center gap-4 py-2" onClick={toggleTheme}>
                <span className="text-slate-600 dark:text-slate-300">Theme</span>
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-900 font-bold text-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-900 font-bold text-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-3' : 'py-6 bg-transparent'
        }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Cryndol Logo" className="h-10 md:h-12 w-auto" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {/* <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#security" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors">Security</a>
             */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-4 ml-4">
              {isAuthenticated ? (
                <Link to="/app/dashboard" className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/10">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Log In</Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-105 shadow-md shadow-emerald-500/10">
                    Get App
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleMenu} className="p-2 text-slate-600 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-800/50 rounded-full backdrop-blur-md">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-12 px-6 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] -z-10 opacity-70 pointer-events-none"></div>

        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
              V 2.0 Now Available
            </span> */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
              Lending made <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                mobile & simple.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Manage your borrowers, track loans, and automate repayments from anywhere. The pocket-sized powerhouse for Zambian lenders.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 text-white dark:text-slate-900 font-bold text-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight size={20} />
              </button>
              {/* <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                Web Dashboard
              </button> */}
            </div>
          </motion.div>

          {/* App Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mt-20 mx-auto max-w-4xl"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"></div>
              {/* Mock UI */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {/* Left Col (Mobile hidden) */}
                <div className="hidden md:flex flex-col gap-4">
                  <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                  <div className="h-12 w-3/4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                  <div className="h-12 w-5/6 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                </div>

                {/* Center Col (Main Content) */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-8 w-40 bg-slate-100 dark:bg-white/10 rounded"></div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-500"></div>
                  </div>

                  {/* Widgets */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Active Loans</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">K1.2M</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Borrowers</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">842</div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-end justify-between p-4 px-6 gap-2">
                    {[35, 60, 45, 75, 55, 80, 65].map((h, i) => (
                      <div key={i} className="w-full bg-emerald-500/10 dark:bg-emerald-500/20 rounded-t-sm relative group h-full flex items-end">
                        <div className="w-full bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -right-4 -top-8 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl hidden sm:block rotate-6 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-green-500/20 flex items-center justify-center text-emerald-600 dark:text-green-400"><CheckCircle2 size={20} /></div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Loan Approved</div>
                  <div className="font-bold text-slate-900 dark:text-white">K5,000.00</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 md:text-center max-w-3xl md:mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything in one place.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Designed for the modern lender who needs speed, accuracy, and mobility.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]"
          >
            {/* Feature 1: Large Box */}
            <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-[#0F172A] rounded-[32px] p-8 md:p-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customer Profiles</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm">Detailed KYC data, document storage, and credit history for every borrower.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-500/5 dark:from-blue-500/10 to-transparent rounded-tl-full translate-x-12 translate-y-12"></div>
            </motion.div>

            {/* Feature 2: Tall Box */}
            <motion.div variants={itemVariants} className="md:row-span-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-[32px] p-8 border border-emerald-100 dark:border-emerald-900/50 relative overflow-hidden group hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                <Wallet size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Smart Loans</h3>
              <p className="text-slate-600 dark:text-emerald-100/60 mb-8">Automated repayment schedules and interest calculations.</p>
              {/* Abstract mobile mock */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-64 bg-white dark:bg-[#0F172A] rounded-t-[24px] border-t-4 border-x-4 border-slate-200 dark:border-slate-800 opacity-80 shadow-lg">
                <div className="p-4 space-y-3">
                  <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto"></div>
                  <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-20 w-full bg-emerald-50 content-center dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20"></div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Standard Box */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                <PieChart size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Real-time revenue & growth charts.</p>
            </motion.div>

            {/* Feature 4: Standard Box */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secure</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Bank-grade data encryption.</p>
            </motion.div>

            {/* Feature 5: Wide Box */}
            <motion.div variants={itemVariants} className="md:col-span-3 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/40 dark:to-[#0F172A] rounded-[32px] p-8 md:p-12 border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ready for Mobile Business?</h3>
                <p className="text-indigo-900/70 dark:text-indigo-200">Access your dashboard from any device. Seamlessly consistent experience across phone, tablet, and desktop.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0F172A] flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm">
                  <Smartphone size={20} />
                </div>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0F172A] flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm">
                  <Globe size={20} />
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-900 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Start Lending <span className="text-emerald-400">Today.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10">Zero setup fees.</p>
          <button
            onClick={() => navigate('/register')}
            className="w-full md:w-auto px-12 py-5 rounded-full bg-emerald-500 text-slate-900 font-bold text-xl hover:bg-emerald-400 transition-colors"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0B1120]">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <img src={logo} alt="Cryndol" className="h-8 w-auto" />
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <Link to="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-slate-500 dark:text-slate-600 text-sm">
            © 2026 Cryndol Inc. Powered By Feltech
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Helper Icon for floating element
const CheckCircle2 = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default LandingPage;
