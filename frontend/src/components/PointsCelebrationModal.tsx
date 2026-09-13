'use client';

import React from 'react';
import { Award, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface PointsCelebrationModalProps {
  isOpen: boolean;
  points: number;
  onClose: () => void;
}

export const PointsCelebrationModal: React.FC<PointsCelebrationModalProps> = ({
  isOpen,
  points,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/60 text-center space-y-5 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Glowing Aura */}
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse"></div>
          
          <div className="relative w-20 h-20 bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-amber-200">
            <Award className="w-10 h-10 text-amber-900" />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-500 animate-bounce" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            Đánh giá thành công
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-zinc-900 leading-tight">
            Chúc mừng bạn đã nhận được <span className="text-amber-600 font-extrabold">{points} điểm</span>!
          </h2>

          <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed">
            Cảm ơn bạn đã chia sẻ trải nghiệm sản phẩm. Số điểm này đã được cộng vào tài khoản của bạn để đổi Voucher ưu đãi!
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-amber-500 text-amber-950 font-bold text-xs py-3.5 px-6 rounded-2xl shadow-md shadow-amber-500/20 hover:shadow-lg transition-all duration-300 transform active:scale-95"
        >
          Tuyệt vời, cảm ơn!
        </button>
      </div>
    </div>
  );
};
