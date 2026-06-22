import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Phone, ArrowLeft, RefreshCw, KeyRound, Eye, EyeOff, ShieldCheck, Zap, Globe, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { handleApiError } from '../utils/errorHandler';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const COUNTRIES = [
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
];

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuthStore();
  const { theme } = useUIStore();
  const logo = theme === 'dark' ? logoDark : logoLight;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+260',
    phoneBody: '',
    password: '',
    password_confirmation: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pastedData.forEach((val, i) => { if (i < 6) newOtp[i] = val; });
      setOtp(newOtp);
      if (newOtp[5]) otpRefs.current[5].focus();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneBody.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Required';
    return newErrors;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${formData.countryCode}${formData.phoneBody.replace(/^0+/, '')}`;
      const submissionData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: fullPhoneNumber,
        password: formData.password,
        acceptTerms: formData.acceptTerms,
      };

      const response = await register(submissionData);
      if (response && response.verificationRequired) {
        setStep('verify');
        toast.success(`Code sent to ${formData.email}`);
      } else {
        toast.success('Welcome to Cryndol!');
        navigate('/app/dashboard');
      }
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { user, greeting } = await verifyOtp(formData.email, code);
      toast.success(greeting || 'Verified!');
      // Corrected redirect path to /onboarding
      navigate(user.hasBusinessProfile ? '/app/dashboard' : '/onboarding');
    } catch (error) {
      toast.error(handleApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await resendOtp(formData.email);
      setResendTimer(60);
      setCanResend(false);
      toast.success('Code resent!');
    } catch (error) {
      toast.error(handleApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-dark-950 overflow-hidden">
      {/* Left Side: Premium Brand Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-primary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <img src={logoDark} alt="Cryndol" className="h-10 brightness-0 invert" />
          <div className="mt-24 space-y-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Scale your lending <br />
                <span className="text-primary-200">business with precision.</span>
              </h2>
              <p className="mt-6 text-primary-100 text-lg max-w-md">
                The most sophisticated micro-finance platform built for modern credit officers and business owners.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shadow-xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Bank-Grade</h4>
                  <p className="text-primary-100 text-sm">Enterprise security</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shadow-xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Real-time</h4>
                  <p className="text-primary-100 text-sm">Automated processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <Globe size={18} />
            <span>Trusted by 500+ lending institutions across Zambia</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        <div className="lg:hidden absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <img src={logo} alt="Cryndol" className="h-8 lg:hidden mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {step === 'register' ? 'Join Cryndol' : 'Verify your email'}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-gray-400">
              {step === 'register' ? 'Create your account to start managing loans.' : `We've sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'register' ? (
              <motion.form key="register-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    leftIcon={<User size={18} />}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    leftIcon={<Mail size={18} />}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 ml-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-32 shrink-0">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="w-full h-[42px] sm:h-[46px] pl-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm sm:text-base text-slate-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                      <div className="grow">
                        <Input
                          name="phoneBody"
                          type="tel"
                          placeholder="97..."
                          value={formData.phoneBody}
                          onChange={handleChange}
                          error={errors.phoneNumber}
                          className="h-[42px] sm:h-[46px]"
                          containerClassName="w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      leftIcon={<Lock size={18} />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                      required
                    />
                    {formData.password && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Security Strength</span>
                          <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${passwordStrength.strength}%` }} className={`h-full ${passwordStrength.color} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    error={errors.password_confirmation}
                    leftIcon={<Lock size={18} />}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input type="checkbox" id="acceptTerms" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="acceptTerms" className="text-sm text-slate-500 dark:text-gray-400 cursor-pointer">
                    I agree to the <Link to="/terms" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-xs text-red-500 -mt-2">{errors.acceptTerms}</p>}

                <Button type="submit" variant="primary" className="w-full py-4 text-base font-semibold shadow-xl shadow-primary-500/20" isLoading={isLoading} leftIcon={<UserPlus size={20} />}>
                  Create Account
                </Button>
                <p className="text-center text-slate-500 dark:text-gray-400 text-sm pt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Sign in</Link>
                </p>
              </motion.form>
            ) : (
              <motion.form key="verify-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerify} className="space-y-8">
                <div className="flex justify-between gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-full h-14 text-center text-2xl font-bold rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
                <Button type="submit" variant="primary" className="w-full py-4 text-base font-semibold shadow-xl shadow-primary-500/20" isLoading={isLoading} leftIcon={<ShieldCheck size={20} />}>
                  Verify Account
                </Button>
                <div className="flex flex-col items-center gap-6">
                  <button type="button" onClick={handleResend} disabled={!canResend || isLoading} className={`flex items-center gap-2 text-sm font-semibold transition-all ${canResend ? 'text-primary-600 hover:text-primary-700 cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}>
                    <RefreshCw size={18} className={!canResend && resendTimer > 0 ? "animate-spin" : ""} />
                    {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
                  </button>
                  <button type="button" onClick={() => setStep('register')} className="text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to registration
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
