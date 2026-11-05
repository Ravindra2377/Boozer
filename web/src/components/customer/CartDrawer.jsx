import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShieldCheck, MapPin, CreditCard, Car, ArrowRight, CheckCircle2 } from 'lucide-react';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onCheckoutSuccess,
  user
}) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.priceLegalMrp * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 50.00 : 0;
  const packagingFee = subtotal > 0 ? 20.00 : 0;
  const totalAmount = subtotal + deliveryFee + packagingFee;

  const handleStartPayment = () => {
    setShowRazorpayModal(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowRazorpayModal(false);
      onCheckoutSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: '440px', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Cart & Checkout</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              Legal Statutory Delivery · Excise Delhi
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-cream-muted)' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Your cart is empty</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Explore the catalog to add licensed beverages.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            {/* Delivery Destination */}
            <div style={{
              background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
              borderRadius: '10px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}>
              <MapPin size={18} color="var(--color-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Delivery Address</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  {user.deliveryAddress}
                </p>
                <span className="badge-teal" style={{ marginTop: '6px', display: 'inline-flex' }}>
                  Within 6.5km legal delivery perimeter
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-ink-border)',
                    borderRadius: '8px', padding: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-cream)' }}>
                        {item.product.name}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-amber)', fontWeight: 600 }}>
                        ₹{item.product.priceLegalMrp.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '4px',
                        background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                        color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '14px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '4px',
                        background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                        color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Safe Ride Credit Promotion Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.15) 0%, rgba(42, 157, 143, 0.05) 100%)',
              border: '1px solid rgba(42, 157, 143, 0.4)', borderRadius: '10px', padding: '12px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Car size={22} color="var(--color-teal)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--color-teal)' }}>
                  Safe Ride Home Credit Included!
                </strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  This order activates a <strong>₹150 Uber/Ola credit voucher</strong> valid for 24 hours.
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{
              background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
              borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Subtotal (Fixed Statutory MRP)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Delivery Partner Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Excise Packaging & Security Tag</span>
                <span>₹{packagingFee.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-ink-border)',
                paddingTop: '8px', fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-cream)'
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--color-amber)' }}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Doorstep Verification Reminder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              <ShieldCheck size={14} color="var(--color-teal)" />
              <span>Doorstep Age Check: Rider will verify physical ID & digital OTP before handing over.</span>
            </div>

            {/* Pay Button */}
            <button
              className="btn-primary"
              onClick={handleStartPayment}
              style={{ padding: '14px', marginTop: 'auto' }}
            >
              <CreditCard size={18} />
              <span>Proceed to Pay · ₹{totalAmount.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* Razorpay Simulation Modal */}
        {showRazorpayModal && (
          <div className="modal-overlay" style={{ zIndex: 300 }}>
            <div className="modal-content-card" style={{ maxWidth: '400px', background: '#0D141D', border: '1px solid #1A2E44' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#0C2340', color: '#0C83FD', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem' }}>
                    Razorpay
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Secure Checkout</span>
                </div>
                <button
                  onClick={() => setShowRazorpayModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ textAlign: 'center', padding: '12px 0 20px', borderBottom: '1px solid #1E2D3D' }}>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>Paying to Boozer / Connaught Place Vintners</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                  ₹{totalAmount.toFixed(2)}
                </h3>
              </div>

              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: paymentMethod === 'UPI' ? '#152435' : '#0F1A26',
                  border: `1px solid ${paymentMethod === 'UPI' ? '#0C83FD' : '#1E2D3D'}`,
                  padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Instant UPI (GPay / PhonePe / Paytm)</strong>
                    <p style={{ fontSize: '0.7rem', color: '#888' }}>Fastest approval · Zero transaction fee</p>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: paymentMethod === 'CARD' ? '#152435' : '#0F1A26',
                  border: `1px solid ${paymentMethod === 'CARD' ? '#0C83FD' : '#1E2D3D'}`,
                  padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Credit or Debit Card</strong>
                    <p style={{ fontSize: '0.7rem', color: '#888' }}>Visa, Mastercard, RuPay</p>
                  </div>
                </label>
              </div>

              <button
                className="btn-primary"
                style={{ background: '#0C83FD', color: '#fff', width: '100%', padding: '12px' }}
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
              >
                <span>{isProcessingPayment ? "Authorizing Razorpay Gateway..." : `Pay ₹${totalAmount.toFixed(2)}`}</span>
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
