'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { LuxoraLogo } from '@/components/LuxoraLogo';
import { Mail, ArrowRight, KeyRound, CheckCircle2, RotateCcw, Clock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast, customers, login } = useStore();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [step, setStep] = useState<'enter_email' | 'enter_otp'>('enter_email');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');

  // Redirect existing customer directly to Home, or to register-info ONLY if brand new email
  const handleSuccessRedirect = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    let existing = customers.find(c => (c.email || '').trim().toLowerCase() === cleanEmail);

    if (!existing) {
      try {
        const res = await fetch('http://localhost:5000/api/users');
        if (res.ok) {
          const dbUsers = await res.json();
          if (Array.isArray(dbUsers)) {
            const foundUser = dbUsers.find((u: any) => (u.email || '').trim().toLowerCase() === cleanEmail);
            if (foundUser) {
              existing = {
                id: foundUser._id || foundUser.id,
                name: foundUser.name || cleanEmail.split('@')[0],
                email: foundUser.email,
                phone: foundUser.phone || '',
                provider: foundUser.provider || 'email',
                orderCount: 0,
                totalSpent: 0,
                status: foundUser.status || 'active',
                createdAt: '2026-01-01'
              };
            }
          }
        }
      } catch (err) {}
    }

    // If email already exists in CSDL or is admin or already registered customer, log in directly!
    if (existing || cleanEmail === 'admin@luxora.vn' || cleanEmail.includes('admin')) {
      login(cleanEmail, '');
      showToast(`Đăng nhập thành công! Xin chào ${existing?.name || cleanEmail.split('@')[0]}`, 'success');
      router.push('/');
    } else {
      showToast('Xác thực email thành công! Vui lòng hoàn tất thông tin cá nhân.', 'success');
      router.push(`/register-info?email=${encodeURIComponent(cleanEmail)}`);
    }
  };

  // 1-minute countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // Send OTP handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Vui lòng nhập địa chỉ Email hợp lệ!', 'error');
      return;
    }

    // Reset error & OTP input state
    setOtpError('');
    setOtpCode('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep('enter_otp');
    setCountdown(60); // Start 60s countdown
    showToast(`Đã gửi mã xác nhận 6 chữ số tới email ${cleanEmail}`, 'info');

    // Send async request to backend email service
    setIsSendingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      if (data && data.success && data.code) {
        setGeneratedCode(data.code);
        showToast(`Đã gửi mã OTP tới email ${cleanEmail} (Mã xác nhận: ${data.code})`, 'success');
      }
    } catch (err) {
      showToast(`Mã xác nhận đăng nhập của bạn là: ${code}`, 'info');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP logic - Only called when user submits / clicks "Xác nhận"
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (countdown === 0) {
      const errText = 'Mã xác nhận đã hết hiệu lực! Vui lòng bấm "Gửi mã xác nhận" để nhận mã mới.';
      setOtpError(errText);
      showToast(errText, 'error');
      return;
    }

    const code = otpCode.trim();
    if (!code || code.length < 6) {
      const errText = 'Mã không đúng, mã không hợp lệ!';
      setOtpError(errText);
      showToast(errText, 'error');
      return;
    }

    setIsVerifyingOtp(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code })
      });
      const data = await res.json();

      if (data && data.success) {
        handleSuccessRedirect(cleanEmail);
      } else if (code === generatedCode) {
        handleSuccessRedirect(cleanEmail);
      } else {
        const errText = 'Mã không đúng, mã không hợp lệ!';
        setOtpError(errText);
        showToast(errText, 'error');
      }
    } catch (err) {
      if (code === generatedCode) {
        handleSuccessRedirect(cleanEmail);
      } else {
        const errText = 'Mã không đúng, mã không hợp lệ!';
        setOtpError(errText);
        showToast(errText, 'error');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <LuxoraLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs text-zinc-500">
            Nhập email của bạn để nhận mã xác nhận OTP đăng nhập
          </p>
        </div>

        {step === 'enter_email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Vd: nguyenvanan@gmail.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>{isSendingOtp ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Email *</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Vd: nguyenvanan@gmail.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp || countdown > 0}
                  className="bg-pink-50 hover:bg-pink-100 disabled:opacity-50 text-pink-600 border border-pink-200 text-[11px] font-bold px-3 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>{isSendingOtp ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Mã xác nhận (6 chữ số) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      // Khi user xóa hoặc sửa lại mã: ẩn thông báo lỗi để user nhập lại thoải mái
                      if (otpError) {
                        setOtpError('');
                      }
                    }}
                    placeholder="Nhập 6 chữ số mã OTP"
                    className={`w-full bg-zinc-50 border rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none text-center font-mono text-base tracking-widest transition-all ${
                      otpError ? 'border-rose-500 focus:border-rose-600 bg-rose-50/30 ring-1 ring-rose-300' : 'border-zinc-200 focus:border-pink-500'
                    }`}
                  />
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                </div>

                {/* Đồng hồ đếm ngược 60s */}
                {countdown > 0 ? (
                  <p className="text-[11px] text-zinc-500 mt-2 flex items-center justify-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-pink-600" />
                    Mã có hiệu lực trong: <span className="font-bold text-pink-600 font-mono">{countdown}s</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-600 mt-2 flex items-center justify-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    Mã xác nhận đã hết hiệu lực (0s)
                  </p>
                )}

                {/* THÔNG BÁO ĐỎ KHI NHẬP SAI HOẶC HẾT HẠN MÃ */}
                {otpError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mt-2.5 flex items-start gap-2 text-rose-700 animate-in fade-in duration-200 shadow-2xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="text-xs font-semibold leading-relaxed">{otpError}</span>
                  </div>
                )}
              </div>

              {/* Nút hành động: 
                  - Nếu user đã XÓA mã (otpCode === '') hoặc mã HẾT HẠN (countdown === 0): HIỆN NÚT "GỬI MÃ XÁC NHẬN"
                  - Nếu user ĐANG NHẬP LẠI (otpCode có số): HIỆN NÚT "XÁC NHẬN" */}
              {otpCode.trim().length === 0 || countdown === 0 ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RotateCcw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>{isSendingOtp ? 'Đang gửi mã mới...' : 'Gửi mã xác nhận'}</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className={`w-4 h-4 ${isVerifyingOtp ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingOtp ? 'Đang kiểm tra...' : 'Xác nhận'}</span>
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
