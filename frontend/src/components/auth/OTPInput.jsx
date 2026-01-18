import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, onResend, countdown = 60 }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const [timeLeft, setTimeLeft] = useState(countdown);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleChange = (element, index) => {
        if (!element.value || isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto-focus next input
        if (element.value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Call onComplete when all digits are entered
        if (newOtp.every(digit => digit !== '') && onComplete) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        if (!pastedData) return;

        const pastedDigits = pastedData.slice(0, length);
        const newOtp = [...otp];

        pastedDigits.split('').forEach((char, index) => {
            if (!isNaN(char) && char !== '' && index < length) {
                newOtp[index] = char;
            }
        });

        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedDigits.length, length - 1);
        if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
        }

        // Call onComplete if all filled
        if (newOtp.every(digit => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleResend = () => {
        setOtp(new Array(length).fill(''));
        setTimeLeft(countdown);
        inputRefs.current[0].focus();
        if (onResend) onResend();
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border-2 border-white/10 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all"
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            <div className="text-center">
                {timeLeft > 0 ? (
                    <p className="text-sm text-white/60">
                        Resend OTP in <span className="text-cyan-300 font-semibold">{timeLeft}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        className="text-sm text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

export default OTPInput;
