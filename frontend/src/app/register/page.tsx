'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { LuxoraLogo } from '@/components/LuxoraLogo';
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, showToast } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      showToast('Vui lòng điền đầy đủ tất cả thông tin yêu cầu!', 'error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.', 'error');
      return;
    }

    registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password
    });

    router.push('/account');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <LuxoraLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Đăng ký tài khoản</h1>
          <p className="text-xs text-zinc-500">Trở thành thành viên Luxora để nhận nhiều ưu đãi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Họ và tên *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: Trần Thị Mai"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="VD: nguyenvanan@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại *</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="VD: 0912345678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500"
              />
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Mật khẩu *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Xác nhận mật khẩu *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500"
              />
              <CheckCircle2 className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <span>Tạo tài khoản</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-pink-600 font-bold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
