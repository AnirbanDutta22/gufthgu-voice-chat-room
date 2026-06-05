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
      <h2 className="font-display text-2xl font-black tracking-tight text-text-main mb-1">
        Welcome back
      </h2>
      <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-6">
        Enter your phone or email to continue
      </p>

      {/* Brutalist Mode Toggle Switch Container */}
      <div className="flex p-1 bg-surface-bg border-2 border-text-main rounded-xl mb-5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {["email", "phone"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setContact("");
              dispatch(clearError());
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              type === t
                ? "bg-text-main text-white"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            {t === "email" ? (
              <RiMailLine size={14} />
            ) : (
              <RiPhoneLine size={14} />
            )}
            <span>{t === "email" ? "Email" : "Phone"}</span>
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
        className="input-field mb-3 focus:border-text-main placeholder:text-text-muted/40"
        autoFocus
      />

      {error && (
        <p className="text-red-600 font-mono font-bold text-xs mb-3 uppercase tracking-wide">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={loading || !contact.trim()}
        className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-40"
      >
        {loading ? "Sending..." : "Send Verification Code"}
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
        className="flex items-center gap-1.5 text-text-muted hover:text-text-main text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
      >
        <RiArrowLeftLine size={14} /> Back to Terminal
      </button>

      <h2 className="font-display text-2xl font-black tracking-tight text-text-main mb-1">
        Check your {otpType}
      </h2>
      <p className="text-text-muted text-xs font-medium mb-6">
        We dispatched a 6-digit verification code directly to{" "}
        <span className="text-text-main font-bold underline decoration-brand decoration-2">
          {otpContact}
        </span>
      </p>

      {/* Grid of Inputs */}
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
            className="w-full aspect-square text-center text-xl font-display font-black input-field focus:border-text-main"
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 font-mono font-bold text-xs mb-3 uppercase tracking-wide">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={() => handleVerify(otp.join(""))}
        disabled={loading || otp.some((d) => !d)}
        className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider mb-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-40"
      >
        {loading ? "Authorizing Token..." : "Verify Identity Token"}
      </button>

      <p className="text-center text-xs font-bold uppercase tracking-wider text-text-muted">
        Didn't receive it?{" "}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`underline transition-colors ${resendTimer > 0 ? "text-text-muted/50 cursor-not-allowed" : "text-brand hover:text-brand/80"}`}
        >
          {resendTimer > 0 ? `Retry in ${resendTimer}s` : "Re-dispatch Code"}
        </button>
      </p>
    </div>
  );
};

const AuthPage = () => {
  const [step, setStep] = useState("contact");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-4 py-12 selection:bg-brand selection:text-white">
      <div className="relative w-full max-w-sm">
        {/* Identity Unit Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto mb-3 border-2 border-text-main shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <RiMicLine size={24} />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-text-main">
            gufthgu<span className="text-brand">.</span>
          </span>
        </div>

        {/* Dynamic Multi-Step Wrapper Card Frame */}
        <div className="bg-surface-card rounded-3xl p-8 border-2 border-text-main shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          {step === "contact" ? (
            <ContactStep onNext={() => setStep("otp")} />
          ) : (
            <OtpStep onBack={() => setStep("contact")} />
          )}
        </div>

        <p className="text-center text-text-muted/60 font-medium text-[10px] uppercase tracking-widest mt-6">
          By authentication, you agree to our System Terms & Policies.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
