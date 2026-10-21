import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { DropshipProduct } from '../../types';

interface StorefrontPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: DropshipProduct[];
}

export const StorefrontPreviewModal: React.FC<StorefrontPreviewModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const { t } = useLocales();
  const [cart, setCart] = useState<{ product: DropshipProduct; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const activeProducts = products.filter((p) => p.inStock && !p.isDelisted);

  const addToCart = (product: DropshipProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.product.retailPrice * curr.qty, 0);

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setOrderPlaced(false);
      setIsCartOpen(false);
    }, 2500);
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      <div className="bg-[#fcfbfc] text-[#1c1917] rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-neutral-300 relative">
        {/* Top Storefront Bar */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-black text-white font-bold flex items-center justify-center text-sm">
                F
              </span>
              <span className="font-serif text-xl tracking-wider uppercase font-semibold">
                Flot Boutique
              </span>
            </div>
            <span className="hidden md:inline px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded tracking-widest uppercase">
              {t('aw_2024_atelier')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative px-3.5 py-1.5 rounded-full border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="shopping_bag" className="text-[17px]"/>
              <span>{t('bag_count', { count: cart.reduce((a, b) => a + b.qty, 0) })}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black"
              title={t('close_preview')}
            >
              <Icon name="close" className="text-[22px]"/>
            </button>
          </div>
        </div>

        {/* Storefront Hero & Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
              {t('curated_european_luxury')}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-900 mt-2 tracking-tight">
              {t('tailored_elegance')}
            </h2>
            <p className="text-neutral-600 text-sm max-w-xl mx-auto mt-2">
              {t('storefront_hero_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {activeProducts.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-bold tracking-wider rounded">
                    {p.subCategory}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-base">
                      {p.title}
                    </h3>
                    <p className="text-neutral-500 text-xs line-clamp-1 mt-1">
                      {p.scrapedSubtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 uppercase tracking-wider block">{t('retail_price')}</span>
                      <span className="font-serif text-lg font-bold text-neutral-900">
                        ${p.retailPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + {t('add_to_bag')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sliding Cart Drawer */}
        {isCartOpen && (
          <div className="absolute right-0 top-16 bottom-0 w-80 sm:w-96 bg-white shadow-2xl border-l border-neutral-200 z-30 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-sm">{t('shopping_bag_count', { count: cart.length })}</span>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                <Icon name="close" className="text-[18px]"/>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto divide-y divide-neutral-100">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  {t('shopping_bag_empty')}
                </div>
              ) : (
                cart.map(({ product, qty }) => (
                  <div key={product.id} className="py-3 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-12 h-12 rounded object-cover border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold truncate">{product.title}</div>
                      <div className="text-neutral-500 font-mono">${product.retailPrice.toFixed(2)} x {qty}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <Icon name="delete" className="text-[16px]"/>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col gap-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{t('estimated_total')}</span>
                  <span className="font-bold text-sm">${subtotal.toFixed(2)}</span>
                </div>

                {orderPlaced ? (
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold text-center rounded-lg">
                    {t('order_dispatched')}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    {t('simulate_express_checkout')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
