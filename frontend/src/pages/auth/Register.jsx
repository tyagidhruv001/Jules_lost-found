import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Mail, Smartphone } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import {
    createUserProfile,
    checkIdentifierExists,
    generateSystemPassword,
    sendOTP,
    verifyOTP
} from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import OTPInput from '../../components/auth/OTPInput';

const Register = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        role: '',
        name: '',
        dateOfBirth: '',
        universityEmail: '', // Primary email for auth
        personalEmail: '', // Added as requested
        mobile: '',
        identifier: '',
        otpSession: null
    });

    const totalSteps = 5;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRoleSelect = (role) => {
        setFormData(prev => ({ ...prev, role }));
        setCurrentStep(2);
    };

    // Auto-send OTP when reaching step 4
    const [otpTriggered, setOtpTriggered] = useState(false);

    useEffect(() => {
        const triggerOTP = async () => {
            if (currentStep === 4 && !otpTriggered) {
                try {
                    setLoading(true);
                    setOtpTriggered(true);

                    // Send Unified OTP to BOTH channels (Email & Mobile)
                    // The same code is now sent to both for consistency
                    const result = await sendOTP(
                        formData.name,
                        ['email', 'mobile'],
                        { email: formData.personalEmail, mobile: formData.mobile },
                        formData.name
                    );

                    setFormData(prev => ({ ...prev, otpSession: result.sessionId }));
                } catch (error) {
                    setError('Failed to send OTP: ' + error.message);
                    setOtpTriggered(false); // Allow retry
                } finally {
                    setLoading(false);
                }
            }
        };
        triggerOTP();
    }, [currentStep, otpTriggered]);

    // NO AUTO-REDIRECT: User must click "Get Started" manually as requested
    // (Removed useEffect timer)

    const validateBasicInfo = () => {
        if (!formData.name || !formData.dateOfBirth || !formData.mobile || !formData.personalEmail) {
            setError('Please fill all fields');
            return false;
        }
        if (formData.mobile.length !== 10) {
            setError('Mobile number must be 10 digits');
            return false;
        }
        return true;
    };

    const validateCredentials = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.identifier) {
            setError('Please enter your ' + (formData.role === 'student' ? 'Roll Number' : 'Faculty ID'));
            return false;
        }

        if (!formData.universityEmail || !emailRegex.test(formData.universityEmail)) {
            setError('Please enter a valid University Email');
            return false;
        }

        if (!formData.personalEmail || !emailRegex.test(formData.personalEmail)) {
            setError('Please enter a valid Personal Email');
            return false;
        }

        const exists = await checkIdentifierExists(formData.identifier, formData.role);
        if (exists) {
            setError('This identifier is already registered');
            return false;
        }
        return true;
    };

    const handleNext = async () => {
        setError('');
        setLoading(true);

        try {
            if (currentStep === 2 && !validateBasicInfo()) {
                setLoading(false);
                return;
            }

            if (currentStep === 3 && !(await validateCredentials())) {
                setLoading(false);
                return;
            }

            setCurrentStep(prev => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
    };

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            setError('');
            // Trigger same logic again
            const result = await sendOTP(
                formData.name,
                ['email', 'mobile'],
                { email: formData.personalEmail, mobile: formData.mobile },
                formData.name
            );
            setFormData(prev => ({ ...prev, otpSession: result.sessionId }));
            if (result.otp) setDisplayedOTP(result.otp);
            alert('A new OTP has been sent to your email and mobile.');
        } catch (err) {
            setError('Failed to resend OTP: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOTPComplete = async (otp) => {
        try {
            setLoading(true);
            // Verify OTP using Firestore-based system
            await verifyOTP(formData.otpSession, otp);
            await handleRegistrationComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationComplete = async () => {
        try {
            setLoading(true);
            setError('');

            const systemPassword = generateSystemPassword(formData.identifier);

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.personalEmail.trim(),
                systemPassword
            );
            const userId = userCredential.user.uid;

            await createUserProfile(userId, {
                role: formData.role,
                name: formData.name,
                dateOfBirth: formData.dateOfBirth,
                email: formData.personalEmail.trim(),
                universityEmail: formData.universityEmail.trim(),
                personalEmail: formData.personalEmail.trim(),
                mobile: formData.mobile,
                identifier: formData.identifier.trim(),
                emailVerified: true,
                mobileVerified: true
            });

            // Refresh user context to include the new profile
            await refreshUser();

            // Finally show success screen
            setLoading(false);
            setCurrentStep(5);
        } catch (err) {
            setLoading(false);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please Login instead.');
            } else {
                setError(err.message || 'Registration failed at final step');
            }
            // RE-THROW to be caught by handleOTPComplete
            throw err;
        }
    };

    const renderStepIndicator = () => {
        const stepLabels = ['Role', 'Personal', 'University', 'Verify', 'Done'];
        const indicatorSteps = [1, 2, 3, 4, 5];
        return (
            <div className="flex items-center justify-between mb-12 px-2">
                {indicatorSteps.map((step, idx) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center relative gap-2">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-2 transition-all duration-500 z-10 ${step < currentStep || (currentStep === 5 && step === 5)
                                ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                : step === currentStep
                                    ? 'bg-cyan-400 border-cyan-400 text-gray-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                                    : 'bg-white/5 border-white/10 text-white/40'
                                }`}>
                                {step < currentStep || (currentStep === 5 && step === 5) ? <Check size={20} /> : step}
                            </div>
                            <span className={`absolute -bottom-7 text-[10px] md:text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${(step <= currentStep) ? 'text-white' : 'text-white/30'
                                }`}>
                                {stepLabels[idx]}
                            </span>
                        </div>
                        {step < 5 && (
                            <div className="flex-1 h-0.5 mx-2 relative overflow-hidden bg-white/10 min-w-[20px]">
                                <div
                                    className="absolute inset-x-0 h-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-700 ease-in-out"
                                    style={{ width: step < currentStep ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
            </div>


            <div className="relative w-full max-w-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="absolute -top-16 left-0 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </button>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
                    <p className="text-white/60 text-center mb-8">Join GLA Lost & Found Portal</p>

                    {renderStepIndicator()}

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="min-h-[400px]">
                        {/* Step 1: Role Selection */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-white">Choose Your Role</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => handleRoleSelect('student')}
                                        className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-transparent hover:border-cyan-300/50 transition-all group"
                                    >
                                        <div className="text-4xl mb-4">🎓</div>
                                        <div className="font-semibold text-lg text-white">Student</div>
                                        <div className="text-sm text-white/60 mt-2">I'm a student</div>
                                    </button>

                                    <button
                                        onClick={() => handleRoleSelect('faculty')}
                                        className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-transparent hover:border-purple-300/50 transition-all group"
                                    >
                                        <div className="text-4xl mb-4">👨‍🏫</div>
                                        <div className="font-semibold text-lg text-white">Faculty</div>
                                        <div className="text-sm text-white/60 mt-2">I'm a faculty member</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Basic Info */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-2xl font-bold mb-6 text-white">Basic Information</h2>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        max="2024-12-31"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white"
                                    />
                                    <p className="text-[10px] text-white/40 mt-1">Please ensure the year is correct (e.g. 2000)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Mobile Number</label>
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="10-digit mobile number" maxLength={10} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Personal Email</label>
                                    <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleInputChange} placeholder="Your personal email (e.g. gmail)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white" />
                                </div>

                            </div>
                        )}

                        {/* Step 3: University Credentials */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-2xl font-bold mb-6 text-white">University Credentials</h2>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        {formData.role === 'student' ? 'University Roll Number' : 'Faculty ID'}
                                    </label>
                                    <input type="text" name="identifier" value={formData.identifier} onChange={handleInputChange} placeholder={formData.role === 'student' ? 'e.g. 2115000123' : 'e.g. FAC2024001'} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">University Email</label>
                                    <input type="email" name="universityEmail" value={formData.universityEmail} onChange={handleInputChange} placeholder={formData.role === 'student' ? 'student@gla.ac.in' : 'faculty@gla.ac.in'} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all text-white" />
                                    <p className="text-xs text-white/40 mt-2">Use your official university email address</p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: OTP Verification */}
                        {currentStep === 4 && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Mail size={32} className="text-cyan-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Verify Your Contact</h2>
                                <p className="text-white/60">
                                    We've sent a 6-digit code to<br />
                                    <span className="text-cyan-300 font-semibold">{formData.personalEmail}</span> &<br />
                                    <span className="text-green-300 font-semibold">+91 {formData.mobile}</span>
                                </p>

                                <OTPInput
                                    length={6}
                                    onComplete={handleOTPComplete}
                                    onResend={handleResendOTP}
                                />
                            </div>
                        )}

                        {/* Step 5: Welcome & Success */}
                        {currentStep === 5 && (
                            <div className="text-center space-y-8 py-4 animate-fade-in">
                                <div className="relative flex items-center justify-center mb-8">
                                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                                        <Check size={56} className="text-green-400" />
                                    </div>
                                    <div className="absolute w-32 h-32 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin"></div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                                        Welcome, {formData.name.split(' ')[0]}!
                                    </h2>
                                    <p className="text-white/70 text-lg max-w-md mx-auto leading-relaxed">
                                        Your official <span className="text-white font-semibold">GLA Lost & Found</span> account is now active.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left hover:bg-white/10 transition-all cursor-default group">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                                            <Check size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Account Verified</p>
                                            <p className="text-white/40 text-sm">Identity & Credentials Checked</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left hover:bg-white/10 transition-all cursor-default group">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                                            <Check size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Dashboard Ready</p>
                                            <p className="text-white/40 text-sm">Your workspace is configured</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/${formData.role}/dashboard`)}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Get Started
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-white/40 text-xs">Your account is ready. Click above to enter your dashboard.</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    {currentStep > 1 && currentStep < 4 && (
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleBack}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                <ArrowLeft className="inline mr-2" size={20} />
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Next'}
                                <ArrowRight className="inline ml-2" size={20} />
                            </button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="mt-8 text-center">
                            <p className="text-xs text-white/40">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
