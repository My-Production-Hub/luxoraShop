'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { LuxoraLogo } from '@/components/LuxoraLogo';
import { User, Mail, Phone, MapPin, Building, Home, ArrowRight, AlertCircle } from 'lucide-react';

function RegisterInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCustomer, customers, user, showToast } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    detailAddress: ''
  });

  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: number; name: string }[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Fetch Vietnam Provinces list on mount from Open API v2 (2025)
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProvinces(data);
        } else {
          return fetch('https://provinces.open-api.vn/api/p/').then(r => r.json()).then(d => setProvinces(d));
        }
      })
      .catch(() => {
        // Fallback popular provinces list
        setProvinces([
          { code: 1, name: 'Thành phố Hà Nội' },
          { code: 79, name: 'Thành phố Hồ Chí Minh' },
          { code: 48, name: 'Thành phố Đà Nẵng' },
          { code: 31, name: 'Thành phố Hải Phòng' },
          { code: 92, name: 'Thành phố Cần Thơ' },
          { code: 74, name: 'Tỉnh Bình Dương' },
          { code: 75, name: 'Tỉnh Đồng Nai' },
          { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' }
        ]);
      });
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const targetEmail = emailParam || user?.email || '';
    if (targetEmail) {
      setForm(prev => ({ ...prev, email: targetEmail }));
    }
  }, [searchParams, user?.email]);

  const fetchWardsForProvinceCode = (code: string) => {
    if (!code) return;
    fetch(`https://provinces.open-api.vn/api/v2/w/?province=${code}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
        } else {
          return fetch(`https://provinces.open-api.vn/api/v2/p/${code}?depth=2`)
            .then(r => r.json())
            .then(d => {
              const list = d?.districts || d?.wards || [];
              if (Array.isArray(list)) setDistricts(list);
            });
        }
      })
      .catch(() => {});
  };

  // Handle Province Selection and fetch corresponding Districts/Wards
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const foundP = provinces.find(p => String(p.code) === code);
    const provinceName = foundP ? foundP.name : '';

    setForm(prev => ({
      ...prev,
      province: provinceName,
      district: ''
    }));
    setDistricts([]);

    if (code) {
      fetchWardsForProvinceCode(code);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    // Validate Vietnam phone number format
    const cleanPhone = form.phone.trim().replace(/[\s\-\.]/g, '');
    const vnPhoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam hợp lệ 10 chữ số (ví dụ: 0912345678)', 'error');
      return;
    }

    // Check if phone number is already registered by ANOTHER user in admin customers
    const duplicateUser = customers.find(
      c => c.phone && c.phone.trim().replace(/[\s\-\.]/g, '') === cleanPhone && c.email.trim().toLowerCase() !== form.email.trim().toLowerCase()
    );
    if (duplicateUser) {
      const errText = 'Số điện thoại đã tồn tại, vui lòng đổi số điện thoại khác';
      setPhoneError(errText);
      showToast(errText, 'error');
      return;
    }

    if (!form.province) {
      showToast('Vui lòng chọn Tỉnh / Thành phố!', 'error');
      return;
    }
    if (!form.district) {
      showToast('Vui lòng chọn Quận / Huyện!', 'error');
      return;
    }

    addCustomer({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: cleanPhone,
      province: form.province.trim(),
      district: form.district.trim(),
      detailAddress: form.detailAddress.trim()
    });

    showToast(`Đăng ký hoàn tất! Xin chào ${form.name.trim()}`, 'success');
    router.push('/');
  };

  return (
    <div className="max-w-lg mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <LuxoraLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Đăng ký thông tin khách hàng</h1>
          <p className="text-xs text-zinc-500">Vui lòng hoàn tất thông tin cá nhân và địa chỉ nhận hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Họ và tên *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Vd: Nguyễn Văn An"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Email (Tài khoản cố định)</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={form.email || user?.email || ''}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-500 text-xs font-medium cursor-not-allowed"
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
                  pattern="[0-9]{10}"
                  title="Vui lòng nhập số điện thoại Việt Nam hợp lệ 10 chữ số (Ví dụ: 0912345678)"
                  placeholder="Vd: 0912345678"
                  value={form.phone}
                  onChange={e => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm({ ...form, phone: onlyNumbers });
                    
                    // Real-time check when 10 digits
                    if (onlyNumbers.length === 10) {
                      const duplicate = customers.find(
                        c => c.phone && c.phone.trim().replace(/[\s\-\.]/g, '') === onlyNumbers && c.email.trim().toLowerCase() !== form.email.trim().toLowerCase()
                      );
                      if (duplicate) {
                        setPhoneError('Số điện thoại đã tồn tại, vui lòng đổi số điện thoại khác');
                      } else {
                        setPhoneError('');
                      }
                    } else {
                      setPhoneError('');
                    }
                  }}
                  className={`w-full bg-zinc-50 border rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none text-xs font-mono transition-colors ${
                    phoneError ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600' : 'border-zinc-200 focus:border-pink-500'
                  }`}
                />
                <Phone className={`w-4 h-4 absolute left-3 top-3 ${phoneError ? 'text-rose-500' : 'text-zinc-400'}`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dropdown Tỉnh / Thành phố */}
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Tỉnh / Thành phố *</label>
              <div className="relative">
                <select
                  required
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs appearance-none cursor-pointer"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Quận / Huyện */}
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Quận / Huyện *</label>
              <div className="relative">
                {districts.length > 0 ? (
                  <select
                    required
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {form.district && !districts.some(d => d.name === form.district) && (
                      <option value={form.district}>{form.district}</option>
                    )}
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Nhập Quận / Huyện của bạn"
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
                  />
                )}
                <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Địa chỉ chi tiết *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Vd: 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                value={form.detailAddress}
                onChange={e => setForm({ ...form, detailAddress: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
              />
              <Home className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Khung thông báo màu đỏ hiển thị NGAY DƯỚI ô Địa chỉ chi tiết */}
          {phoneError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="text-xs font-semibold leading-relaxed">
                {phoneError}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
          >
            <span>Hoàn tất & Lưu thông tin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterInfoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Đang tải...</div>}>
      <RegisterInfoContent />
    </Suspense>
  );
}
