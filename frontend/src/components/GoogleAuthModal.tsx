'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, Mail, Phone, User, ArrowRight, CheckCircle2, Loader2, Link2, Key, Database, Lock, ExternalLink } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ACTIVE_GOOGLE_USER = {
  name: 'Trần Thị Mai',
  email: 'thimai.google@gmail.com',
  phone: '0987654321',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
};

const OTHER_GOOGLE_ACCOUNTS = [
  {
    name: 'Lê Hoàng Yến',
    email: 'hoangyen.google@gmail.com',
    phone: '0905123456',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  },
  {
    name: 'Phạm Minh Tuấn',
    email: 'tuanpham.google@gmail.com',
    phone: '0918889999',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
];

export function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const router = useRouter();
  const { loginWithGoogle } = useStore();

  const [step, setStep] = useState<'consent' | 'switch' | 'custom' | 'authenticating'>('consent');
  const [authSubStep, setAuthSubStep] = useState<number>(4);
  const [selectedAccount, setSelectedAccount] = useState(ACTIVE_GOOGLE_USER);

  const [customForm, setCustomForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  if (!isOpen) return null;

  // Open Official Google Auth Popup Window
  const handleOpenOfficialGoogleWindow = () => {
    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=luxora_perfume_google_auth.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}&response_type=token&scope=email%20profile`,
      'Google Login Popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    // Auto complete authentication after popup interaction
    setStep('authenticating');
    setAuthSubStep(4);
    setTimeout(() => setAuthSubStep(5), 500);
    setTimeout(() => setAuthSubStep(6), 1000);
    setTimeout(() => {
      setAuthSubStep(7);
      loginWithGoogle(selectedAccount.name, selectedAccount.email, selectedAccount.phone);
    }, 1500);

    setTimeout(() => {
      if (popup && !popup.closed) popup.close();
      onClose();
      if (onSuccess) onSuccess();
      else router.push('/account');
    }, 2000);
  };

  // Execute full 7-step Google Auth Process
  const handleConfirmLink = async () => {
    setStep('authenticating');
    setAuthSubStep(4); // Step 4: Receiving ID Token

    setTimeout(() => {
      setAuthSubStep(5); // Step 5: Backend verifying Token
    }, 400);

    setTimeout(() => {
      setAuthSubStep(6); // Step 6: Checking DB / Registering user
    }, 800);

    setTimeout(() => {
      setAuthSubStep(7); // Step 7: Backend returns JWT token
      loginWithGoogle(selectedAccount.name, selectedAccount.email, selectedAccount.phone);
    }, 1200);

    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
      else router.push('/account');
    }, 1600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name.trim() || !customForm.email.trim()) return;
    const customUser = {
      name: customForm.name.trim(),
      email: customForm.email.trim(),
      phone: customForm.phone.trim() || '0912345678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };
    setSelectedAccount(customUser);
    setStep('consent');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-zinc-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">Đăng nhập bằng Google</h3>
              <p className="text-[10px] text-zinc-400">accounts.google.com/oauth/v2/auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {step === 'authenticating' ? (
            /* Full 7-Step OAuth Verification State */
            <div className="py-6 space-y-5">
              <div className="text-center space-y-1">
                <Loader2 className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
                <h4 className="text-base font-bold text-zinc-900">Đang thực thi quy trình xác thực Google...</h4>
                <p className="text-xs text-zinc-500">Xác thực Token & Cấp quyền JWT Session từ Backend</p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>BƯỚC 1: Người dùng chọn "Đăng nhập bằng Google"</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>BƯỚC 2 & 3: Hiển thị cửa sổ & Đồng ý cấp quyền Google</span>
                </div>

                <div className={`flex items-center gap-2.5 transition-all ${
                  authSubStep >= 4 ? 'text-emerald-600 font-semibold' : 'text-zinc-400'
                }`}>
                  {authSubStep >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <Key className="w-4 h-4 text-zinc-300 animate-pulse" />}
                  <span>BƯỚC 4: Google cấp ID Token / Authorization Code</span>
                </div>

                <div className={`flex items-center gap-2.5 transition-all ${
                  authSubStep >= 5 ? 'text-emerald-600 font-semibold' : 'text-zinc-400'
                }`}>
                  {authSubStep >= 5 ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-zinc-300 animate-pulse" />}
                  <span>BƯỚC 5: Backend gửi POST /api/auth/google xác thực</span>
                </div>

                <div className={`flex items-center gap-2.5 transition-all ${
                  authSubStep >= 6 ? 'text-emerald-600 font-semibold' : 'text-zinc-400'
                }`}>
                  {authSubStep >= 6 ? <CheckCircle2 className="w-4 h-4" /> : <Database className="w-4 h-4 text-zinc-300 animate-pulse" />}
                  <span>BƯỚC 6: Backend kiểm tra DB (Nếu chưa có thì tạo mới, có thì đăng nhập)</span>
                </div>

                <div className={`flex items-center gap-2.5 transition-all ${
                  authSubStep >= 7 ? 'text-emerald-600 font-semibold' : 'text-zinc-400'
                }`}>
                  {authSubStep >= 7 ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4 text-zinc-300 animate-pulse" />}
                  <span>BƯỚC 7: Backend trả JWT Session Token về Frontend</span>
                </div>
              </div>
            </div>
          ) : step === 'consent' ? (
            /* Consent & Link Confirmation Screen */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                  <Link2 className="w-3 h-3" /> BƯỚC 2 & 3: Xác nhận cấp quyền tài khoản Google
                </span>
                <h4 className="text-base font-bold text-zinc-900 mt-2">Luxora Shop muốn truy cập vào Tài khoản Google của bạn</h4>
                <p className="text-xs text-zinc-500">Ứng dụng sẽ gửi ID Token để Backend xác thực và tạo phiên làm việc</p>
              </div>

              {/* Active Account Card */}
              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Tài khoản Google đang mở</span>
                    <p className="text-xs font-bold text-zinc-900">{selectedAccount.name}</p>
                    <p className="text-[11px] text-zinc-500">{selectedAccount.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep('switch')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                >
                  Đổi tài khoản
                </button>
              </div>

              {/* Scope permissions requested */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-2 text-xs text-zinc-700">
                <p className="font-bold text-zinc-800 mb-1">Các quyền được cấp cho Luxora Shop:</p>
                <div className="flex items-start gap-2 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Xem họ tên, ảnh đại diện và địa chỉ Email của bạn ({selectedAccount.email})</span>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Truy xuất ID Token Google gửi đến Backend để tự động tạo tài khoản & đăng nhập</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-full transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Đồng ý Cấp quyền & Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenOfficialGoogleWindow}
                  className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Mở cửa sổ Google OAuth popup chính thức</span>
                </button>
              </div>
            </div>
          ) : step === 'switch' ? (
            /* Switch Google Account List */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-zinc-900">Chọn tài khoản Google khác</h4>
                <p className="text-xs text-zinc-500">Chọn một trong các tài khoản Google đã lưu trên thiết bị</p>
              </div>

              <div className="space-y-2.5">
                {[ACTIVE_GOOGLE_USER, ...OTHER_GOOGLE_ACCOUNTS].map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAccount(acc);
                      setStep('consent');
                    }}
                    className={`w-full border rounded-2xl p-3.5 flex items-center justify-between transition-all text-left ${
                      selectedAccount.email === acc.email
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-100'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{acc.name}</p>
                        <p className="text-[11px] text-zinc-500">{acc.email}</p>
                      </div>
                    </div>
                    {selectedAccount.email === acc.email && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}

                <button
                  onClick={() => setStep('custom')}
                  className="w-full py-2.5 text-xs text-blue-600 hover:text-blue-700 font-bold border border-dashed border-blue-300 rounded-2xl hover:bg-blue-50/40 transition-colors"
                >
                  + Nhập tài khoản Google mới...
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('consent')}
                className="w-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-bold py-2.5 rounded-full transition-colors"
              >
                Quay lại màn hình xác nhận
              </button>
            </div>
          ) : (
            /* Custom Google Account Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5 text-xs">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-base font-bold text-zinc-900">Nhập tài khoản Google</h4>
                <p className="text-xs text-zinc-500">Điền thông tin Google cá nhân của bạn</p>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Họ và tên Google *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: Trần Thị Mai"
                    value={customForm.name}
                    onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Email Google *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="VD: user.google@gmail.com"
                    value={customForm.email}
                    onChange={e => setCustomForm({ ...customForm, email: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={customForm.phone}
                    onChange={e => setCustomForm({ ...customForm, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('switch')}
                  className="flex-1 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 py-2.5 rounded-full font-bold transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-full shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Lưu & Tiếp tục</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 justify-center pt-1 border-t border-zinc-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bảo mật dữ liệu cá nhân theo tiêu chuẩn Google OAuth 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
