import React, { useState } from 'react';
import { X, ShieldCheck, Plus, Minus, ShoppingBag, Sparkles, AlertCircle, TrendingDown, Clock, Zap } from 'lucide-react';

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const originalPrice = Math.round(product.priceLegalMrp * 1.08);
  const savings = (originalPrice - product.priceLegalMrp) * quantity;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div
        className="modal-content-card"
        style={{
          maxWidth: '500px',
          background: 'var(--color-plum-surface)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(5, 150, 105, 0.16)', border: '1px solid var(--color-savings)',
            color: 'var(--color-primary-mint)', padding: '3px 10px',
            borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700
          }}>
            <ShieldCheck size={13} />
            <span>Dual Age Verified Item</span>
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%',
              color: 'var(--color-cream-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Media */}
        <div style={{
          width: '100%', height: '220px', borderRadius: 'var(--radius-md)',
          overflow: 'hidden', background: '#121A15', position: 'relative', marginBottom: '16px'
        }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* CompareX Savings Tag */}
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'var(--color-savings)', color: '#FFFFFF',
            fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px',
            borderRadius: '4px', letterSpacing: '0.04em'
          }}>
            SAVE ₹{originalPrice - product.priceLegalMrp}
          </span>

          <div style={{
            position: 'absolute', bottom: '10px', left: '10px',
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-sm)', padding: '4px 10px', display: 'flex', gap: '8px', fontSize: '0.76rem',
            border: '1px solid var(--color-card-border)'
          }}>
            <span style={{ color: 'var(--color-primary-mint)', fontWeight: 700 }}>{product.abv}% ABV</span>
            <span style={{ color: 'var(--color-cream-muted)' }}>|</span>
            <span style={{ color: 'var(--color-cream)' }}>{product.volumeMl} ml</span>
          </div>
        </div>

        {/* Title & Brand */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-mint)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
            {product.brand} · {product.category}
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-cream)', lineHeight: 1.2, marginTop: '2px' }}>
            {product.name}
          </h2>
        </div>

        {/* Statutory MRP Card with CompareX Savings Styling */}
        <div style={{
          background: 'rgba(22, 132, 91, 0.08)', border: '1px solid rgba(22, 132, 91, 0.25)',
          borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-cream)' }}>
                ₹{(product.priceLegalMrp * quantity).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)', textDecoration: 'line-through' }}>
                ₹{(originalPrice * quantity).toLocaleString('en-IN')}
              </span>
              <span style={{
                background: 'var(--color-savings)', color: '#fff', fontSize: '0.65rem',
                fontWeight: 800, padding: '1px 6px', borderRadius: '3px'
              }}>
                Save ₹{savings}
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-primary-mint)', marginTop: '2px', fontWeight: 600 }}>
              State Excise regulated price · Zero surge pricing
            </p>
          </div>
          <span style={{
            background: 'rgba(5, 150, 105, 0.18)', color: 'var(--color-primary-mint)',
            border: '1px solid rgba(101, 201, 156, 0.4)', borderRadius: 'var(--radius-full)',
            padding: '4px 10px', fontSize: '0.68rem', fontWeight: 800
          }}>
            10 MIN DELIVERABLE
          </span>
        </div>

        {/* Quick Delivery Comparison Matrix */}
        <div style={{
          background: '#F7F9F8', border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-mint)' }}>
            <Zap size={14} />
            <span><strong>Boozer Express</strong>: 10 mins (Legal Depot)</span>
          </div>
          <div style={{ color: 'var(--color-savings)', fontWeight: 700 }}>
            ₹150 Ride Credit Included
          </div>
        </div>

        {/* Description & Tasting Notes */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {product.tastingNotes && (
            <div style={{
              background: '#F7F9F8', borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              border: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem'
            }}>
              <Sparkles size={15} color="var(--color-primary-mint)" />
              <div>
                <strong style={{ color: 'var(--color-cream)' }}>Tasting Profile: </strong>
                <span style={{ color: 'var(--color-cream-muted)' }}>{product.tastingNotes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Age Gate Warning */}
        <div style={{
          background: 'rgba(220, 76, 62, 0.08)', border: '1px solid rgba(220, 76, 62, 0.25)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.72rem', color: '#FCA5A5', marginBottom: '16px'
        }}>
          <AlertCircle size={15} color="var(--color-crimson)" />
          <span>Must be {product.minAge}+ to purchase. Physical ID & OTP verification enforced at door.</span>
        </div>

        {/* Quantity and Add to Cart */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'var(--color-plum-deep)', border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-full)', padding: '6px 14px'
          }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer', padding: '2px' }}
            >
              <Minus size={15} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '18px', textAlign: 'center', color: 'var(--color-cream)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer', padding: '2px' }}
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={handleAdd}
            style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(135deg, #116149 0%, #16845B 50%, #4FAF86 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(22, 132, 91, 0.4)'
            }}
          >
            <ShoppingBag size={17} />
            <span>Add to Cart · ₹{(product.priceLegalMrp * quantity).toLocaleString('en-IN')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
