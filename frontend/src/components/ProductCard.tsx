'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import { Heart, Star, Eye, ShoppingBag, Zap } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, getProductReviews } = useStore();
  const isWishlisted = wishlist.includes(product._id);

  const reviews = getProductReviews(product._id);
  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '0.0';

  const [isClient, setIsClient] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (product.isFlashSale && product.flashSaleEndTime) {
      const active = new Date(product.flashSaleEndTime).getTime() > Date.now();
      setIsFlashSaleActive(active);
    }
  }, [product]);

  const goToDetail = () => {
    router.push(`/product/${product._id}`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-zinc-100 p-3 flex flex-col justify-between hover:shadow-xl hover:border-pink-200 transition-all duration-300 relative overflow-hidden">
      {/* Discount / Out of Stock Badges */}
      {product.stock <= 0 ? (
        <span className="absolute top-4 left-4 z-10 bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
          Hết hàng
        </span>
      ) : isClient && isFlashSaleActive ? (
        <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current" /> Đang Sale
        </span>
      ) : (
        product.discountPercent && product.discountPercent > 0 ? (
          <span className="absolute top-4 left-4 z-10 bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            -{product.discountPercent}%
          </span>
        ) : null
      )}

      {/* Wishlist Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          toggleWishlist(product._id);
        }}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isWishlisted
            ? 'bg-pink-600 text-white shadow-md'
            : 'bg-white/80 text-zinc-400 hover:text-pink-600 hover:bg-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image & Quick View trigger */}
      <div
        onClick={goToDetail}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-50 cursor-pointer mb-3 group-hover:scale-[1.02] transition-transform duration-300"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            product.stock <= 0 ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="bg-white/90 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-pink-600 hover:text-white transition-colors">
            <Eye className="w-3.5 h-3.5" />
            Xem nhanh
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            {product.brand} • {product.gender}
          </span>
          <h3
            onClick={goToDetail}
            className="text-xs font-bold text-zinc-800 hover:text-pink-600 transition-colors line-clamp-2 cursor-pointer h-8 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Rating - Only rendered if reviews exist */}
        {hasReviews && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-zinc-800">{averageRating}</span>
            <span className="text-zinc-400">({reviews.length})</span>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-pink-600">
              {product.volumeOptions && product.volumeOptions.length > 1 ? (() => {
                const prices = product.volumeOptions.map(v => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min < max
                  ? `${min.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`
                  : `${min.toLocaleString('vi-VN')}đ`;
              })() : `${product.price.toLocaleString('vi-VN')}đ`}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] text-zinc-400 line-through">
                {product.originalPrice.toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>

          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white p-2 rounded-xl transition-colors"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="bg-zinc-100 text-zinc-400 p-2 rounded-xl cursor-not-allowed"
              title="Sản phẩm tạm hết hàng"
            >
              <ShoppingBag className="w-4 h-4 opacity-40" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
