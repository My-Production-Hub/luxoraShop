'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const router = useRouter();
  const {
    products,
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p._id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      ></div>

      {/* Side Panel Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600 fill-current" />
              <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Sản phẩm yêu thích</h2>
              <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                ({wishlistedProducts.length})
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800">Danh sách yêu thích đang trống</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Hãy bấm vào biểu tượng icon trái tim ❤️ trên các sản phẩm bạn yêu thích để lưu lại tại đây!
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    router.push('/products');
                  }}
                  className="mt-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-pink-500/20 inline-flex items-center gap-2"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlistedProducts.map(prod => (
                <div
                  key={prod._id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-zinc-100 hover:border-pink-200 transition-all bg-white shadow-xs items-center group cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    onClick={() => {
                      setIsWishlistOpen(false);
                      router.push(`/product/${prod._id}`);
                    }}
                    className="w-16 h-16 object-cover rounded-xl border border-zinc-100 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div
                    onClick={() => {
                      setIsWishlistOpen(false);
                      router.push(`/product/${prod._id}`);
                    }}
                    className="flex-1 min-w-0 space-y-1"
                  >
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      {prod.brand} • {prod.volume}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-800 group-hover:text-pink-600 transition-colors truncate">
                      {prod.name}
                    </h4>
                    <div className="text-xs font-bold text-pink-600">
                      {prod.price.toLocaleString('vi-VN')}đ
                      {prod.originalPrice && (
                        <span className="text-[10px] text-zinc-400 line-through font-normal ml-1.5">
                          {prod.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => addToCart(prod)}
                      className="bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white p-2 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod._id)}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-2 rounded-xl transition-colors text-xs"
                      title="Bỏ yêu thích"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {wishlistedProducts.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  router.push('/products?wishlist=true');
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 text-center uppercase tracking-wider"
              >
                Xem tất cả sản phẩm đã chọn
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
