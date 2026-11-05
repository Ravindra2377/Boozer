import React, { useState } from 'react';
import { X, ShieldCheck, Plus, Minus, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span className="badge-teal">
            <ShieldCheck size={13} />
            <span>Dual Age Verified Item</span>
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Media */}
        <div style={{
          width: '100%', height: '220px', borderRadius: '14px',
          overflow: 'hidden', background: '#111A24', position: 'relative', marginBottom: '16px'
        }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px',
            background: 'rgba(16, 24, 32, 0.85)', backdropFilter: 'blur(8px)',
            borderRadius: '6px', padding: '4px 10px', display: 'flex', gap: '8px', fontSize: '0.78rem'
          }}>
            <span style={{ color: '#FFA07A', fontWeight: 700 }}>{product.abv}% ABV</span>
            <span style={{ color: 'var(--color-cream-muted)' }}>|</span>
            <span style={{ color: 'var(--color-cream)' }}>{product.volumeMl} ml</span>
          </div>
        </div>

        {/* Title & Brand */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-amber)', textTransform: 'uppercase', fontWeight: 700 }}>
            {product.brand} · {product.category}
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-cream)', lineHeight: 1.2, marginTop: '2px' }}>
            {product.name}
          </h2>
        </div>

        {/* Statutory MRP Card */}
        <div style={{
          background: 'rgba(232, 163, 61, 0.08)', border: '1px solid rgba(232, 163, 61, 0.3)',
          borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-amber)' }}>
                ₹{product.priceLegalMrp.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>Legal Statutory MRP</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
              Excise regulated price. Zero surge pricing.
            </p>
          </div>
          <span className="badge-amber">State Regulated</span>
        </div>

        {/* Description & Notes */}
        <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-cream-muted)', lineHeight: 1.4 }}>
            {product.description}
          </p>
          {product.tastingNotes && (
            <div style={{
              background: 'var(--color-ink-card)', borderRadius: '8px', padding: '10px',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem'
            }}>
              <Sparkles size={16} color="var(--color-amber)" />
              <div>
                <strong style={{ color: 'var(--color-cream)' }}>Tasting Profile: </strong>
                <span style={{ color: 'var(--color-cream-muted)' }}>{product.tastingNotes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Age Gate Warning */}
        <div style={{
          background: 'rgba(196, 87, 26, 0.1)', border: '1px solid rgba(196, 87, 26, 0.25)',
          borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.74rem', color: '#FFA07A', marginBottom: '18px'
        }}>
          <AlertCircle size={16} />
          <span>Must be {product.minAge}+ to purchase. Physical ID & OTP verification enforced at door.</span>
        </div>

        {/* Quantity and Add to Cart */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
            borderRadius: '8px', padding: '6px 14px'
          }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer' }}
            >
              <Minus size={16} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1rem', minWidth: '18px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer' }}
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={handleAdd}
            style={{ flex: 1, padding: '12px' }}
          >
            <ShoppingBag size={18} />
            <span>Add to Cart · ₹{(product.priceLegalMrp * quantity).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
