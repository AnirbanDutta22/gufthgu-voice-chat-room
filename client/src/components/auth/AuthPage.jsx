import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiMicLine,
  RiMailLine,
  RiPhoneLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import {
  sendOtp,
  verifyOtp,
  clearError,
  resetOtp,
} from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const ContactStep = ({ onNext }) => {
  const [type, setType] = useState("email");
  const [contact, setContact] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSend = async () => {
    if (!contact.trim()) return;
    const res = await dispatch(sendOtp({ contact: contact.trim(), type }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success(`Code sent to ${contact}`);
      onNext();
    }
  };

  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-2xl font-bold text-surface-50 mb-1">
        Welcome back
      </h2>
      <p className="text-surface-400 text-sm mb-8">
        Enter your phone or email to continue
      </p>

      {/* Toggle */}
      <div className="flex gap-2 p-1 glass rounded-xl mb-5">
        {["email", "phone"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setContact("");
              dispatch(clearError());
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
              type === t
                ? "bg-brand-600 text-white"
                : "text-surface-400 hover:text-surface-200"
            }`}
          >
            {t === "email" ? (
              <RiMailLine size={15} />
            ) : (
              <RiPhoneLine size={15} />
            )}
            {t === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      <input
        type={type === "email" ? "email" : "tel"}
        placeholder={type === "email" ? "you@example.com" : "+91 98765 43210"}
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          dispatch(clearError());
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="input-field mb-3"
        autoFocus
      />

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={handleSend}
        disabled={loading || !contact.trim()}
        className="btn-primary w-full py-3"
      >
        {loading ? "Sending..." : "Send Code"}
      </button>
    </div>
  );
};

const OtpStep = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpContact, otpType } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    const timer = setInterval(
      () => setResendTimer((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputs.current[index - 1]?.focus();
  };

  const handleVerify = async (code) => {
    const res = await dispatch(
      verifyOtp({ contact: otpContact, otp: code, type: otpType }),
    );
    if (res.meta.requestStatus === "fulfilled") {
      const { user } = res.payload;
      if (!user?.isProfileComplete) navigate("/onboarding");
      else navigate("/explore");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const res = await dispatch(sendOtp({ contact: otpContact, type: otpType }));
    if (res.meta.requestStatus === "fulfilled") {
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      toast.success("New code sent!");
    }
  };

  return (
    <div className="animate-slide-up">
      <button
        onClick={() => {
          dispatch(resetOtp());
          onBack();
        }}
        className="flex items-center gap-1 text-surface-400 hover:text-surface-200 text-sm mb-6 transition-colors"
      >
        <RiArrowLeftLine size={16} /> Back
      </button>

      <h2 className="font-display text-2xl font-bold text-surface-50 mb-1">
        Check your {otpType}
      </h2>
      <p className="text-surface-400 text-sm mb-8">
        We sent a 6-digit code to{" "}
        <span className="text-surface-200 font-500">{otpContact}</span>
      </p>

      <div className="flex gap-2 mb-5">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-full aspect-square text-center text-xl font-display font-bold input-field"
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={() => handleVerify(otp.join(""))}
        disabled={loading || otp.some((d) => !d)}
        className="btn-primary w-full py-3 mb-4"
      >
        {loading ? "Verifying..." : "Verify Code"}
      </button>

      <p className="text-center text-sm text-surface-500">
        Didn't get it?{" "}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`font-500 transition-colors ${resendTimer > 0 ? "text-surface-600" : "text-brand-400 hover:text-brand-300"}`}
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
        </button>
      </p>
    </div>
  );
};

const AuthPage = () => {
  const [step, setStep] = useState("contact");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{
            background: "radial-gradient(circle, #6272f3, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full opacity-6 blur-3xl"
          style={{
            background: "radial-gradient(circle, #a78bfa, transparent)",
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3 shadow-glow animate-float">
            <RiMicLine className="text-white" size={22} />
          </div>
          <span className="font-display font-bold text-xl text-surface-50">
            gufthgu
          </span>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {step === "contact" ? (
            <ContactStep onNext={() => setStep("otp")} />
          ) : (
            <OtpStep onBack={() => setStep("contact")} />
          )}
        </div>

        <p className="text-center text-surface-600 text-xs mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
