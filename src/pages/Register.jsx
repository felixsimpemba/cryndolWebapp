import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Phone, ArrowLeft, RefreshCw, KeyRound, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { handleApiError } from '../utils/errorHandler';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuthStore();
  const { theme } = useUIStore();
  const logo = theme === 'dark' ? logoDark : logoLight;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register' | 'verify'

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    password_confirmation: '',
    acceptTerms: false,
    working_capital: '',
  });
  const [errors, setErrors] = useState({});

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer logic for resend OTP
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

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
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
      pastedData.forEach((val, i) => {
        if (i < 6) newOtp[i] = val;
      });
      setOtp(newOtp);
      if (newOtp[5]) otpRefs.current[5].focus();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
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
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        acceptTerms: formData.acceptTerms,
        working_capital: formData.working_capital,
      };

      const response = await register(registrationData);

      if (response && response.verificationRequired) {
        setStep('verify');
        toast.success(`Verification code sent to ${formData.email}`);
      } else {
        toast.success('Registration successful! Welcome to Cryndol.');
        navigate('/app/dashboard');
      }
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) {
        setErrors(fieldErrors);
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { user, greeting } = await verifyOtp(formData.email, code);
      // Show personalized greeting with time-based message
      toast.success(greeting || 'Email verified! Logging you in...');

      if (user.hasBusinessProfile) {
        navigate('/app/dashboard');
      } else {
        navigate('/app/business');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
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
      toast.success('New code sent!');
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float delay-200"></div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">

          {/* Header Branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex items-center justify-center mx-auto mb-4"
            >
              <img src={logo} alt="Cryndol Logo" className="h-12 w-auto object-contain" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 'register' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {step === 'register' ? 'Start managing your loan business today' : `We've sent a code to ${formData.email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'register' ? (
              /* REGISTER FORM */
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <Input
                  label="Full Name"
                  name="fullName"
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
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  leftIcon={<Mail size={18} />}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  leftIcon={<Phone size={18} />}
                  required
                />
                <Input
                  label="Initial Working Capital (Optional)"
                  type="number"
                  name="working_capital"
                  value={formData.working_capital}
                  onChange={handleChange}
                  error={errors.working_capital}
                  leftIcon={<span className="font-bold text-slate-500 dark:text-gray-400">K</span>}
                  placeholder="e.g. 50000"
                />
                <div>
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    leftIcon={<Lock size={18} />}
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        />
                      </div>
                      <p className="text-xs text-right mt-1 text-slate-500">{passwordStrength.label}</p>
                    </div>
                  )}
                </div>
                <Input
                  label="Confirm Password"
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  error={errors.password_confirmation}
                  leftIcon={<Lock size={18} />}
                  required
                />

                <label className="flex items-start space-x-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    I accept the Terms and Conditions and Privacy Policy
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms}</p>}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  isLoading={isLoading}
                  leftIcon={<UserPlus size={20} />}
                >
                  Create Account
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">Sign in</Link>
                  </p>
                </div>
              </motion.form>
            ) : (
              /* VERIFY OTP FORM */
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => otpRefs.current[index] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  isLoading={isLoading}
                  leftIcon={<KeyRound size={20} />}
                >
                  Verify Email
                </Button>

                <div className="flex flex-col items-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className={`flex items-center gap-2 text-sm ${canResend ? 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}
                  >
                    <RefreshCw size={16} className={!canResend && resendTimer > 0 ? "animate-spin" : ""} />
                    {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    <ArrowLeft size={16} /> Update Details
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          © 2026 Cryndol. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
