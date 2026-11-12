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
  const originalSubtotal = Math.round(subtotal * 1.08);
  const totalSavings = originalSubtotal - subtotal;
  const deliveryFee = subtotal > 0 ? 49.00 : 0;
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
    <div className="modal-overlay" onClick={onClose} style={{
      background: 'rgba(24, 32, 28, 0.50)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div
        className="modal-content-card"
        style={{
          maxWidth: '440px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          background: 'var(--color-plum-surface)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-cream)' }}>Cart & Checkout</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              10-Minute Hyperlocal Excise Delivery
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F4F1', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%',
              color: 'var(--color-cream)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-cream-muted)' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-cream)' }}>Your cart is empty</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Explore the catalog to add licensed beverages.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
            {/* Delivery Destination */}
            <div style={{
              background: '#F7F9F8', border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}>
              <MapPin size={18} color="var(--color-primary-mint)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Delivery Address</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  {user?.deliveryAddress || 'Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad - 500033'}
                </p>
                <span style={{
                  marginTop: '6px', display: 'inline-flex',
                  background: 'rgba(22, 132, 91, 0.10)', color: 'var(--color-primary-mint)',
                  border: '1px solid rgba(22, 132, 91, 0.25)', padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                  fontSize: '0.68rem', fontWeight: 700
                }}>
                  Within 6.5km legal excise delivery perimeter
                </span>
              </div>
            </div>

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <div style={{
                background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.3)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.78rem', color: 'var(--color-cream)'
              }}>
                <span>🎉</span>
                <span>
                  You save <strong style={{ color: 'var(--color-primary-mint)' }}>₹{totalSavings}</strong> on this order below legal market MRP!
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--color-midnight)', border: '1px solid var(--color-card-border)',
                    borderRadius: 'var(--radius-md)', padding: '10px 12px'
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
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-primary-mint)', fontWeight: 700 }}>
                        ₹{item.product.priceLegalMrp.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '6px',
                        background: 'var(--color-plum-surface)', border: '1px solid var(--color-card-border)',
                        color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '16px', textAlign: 'center', color: 'var(--color-cream)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '6px',
                        background: 'var(--color-plum-surface)', border: '1px solid var(--color-card-border)',
                        color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Safe Ride Credit Promotion Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(17, 97, 73, 0.25) 0%, rgba(22, 132, 91, 0.12) 100%)',
              border: '1px solid rgba(101, 201, 156, 0.35)', borderRadius: 'var(--radius-md)', padding: '12px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Car size={22} color="var(--color-primary-mint)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--color-primary-mint)' }}>
                  Safe Ride Home Credit Included!
                </strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  This order activates an automatic <strong>₹150 Uber/Ola credit voucher</strong> valid for 24 hours.
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{
              background: 'var(--color-midnight)', border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Subtotal (Statutory MRP)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Delivery Partner Fee (10 min)</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-cream-muted)' }}>
                <span>Excise Packaging & Security Tag</span>
                <span>₹{packagingFee.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-card-border)',
                paddingTop: '8px', fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-cream)'
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--color-primary-mint)' }}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Doorstep Verification Reminder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              <ShieldCheck size={14} color="var(--color-primary-mint)" />
              <span>Doorstep Age Check: Rider will verify physical ID & digital OTP before handing over.</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleStartPayment}
              style={{
                padding: '14px', marginTop: 'auto',
                background: 'linear-gradient(135deg, #116149 0%, #16845B 50%, #4FAF86 100%)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(22, 132, 91, 0.4)'
              }}
            >
              <CreditCard size={18} />
              <span>Proceed to Pay · ₹{totalAmount.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* Razorpay Simulation Modal */}
        {showRazorpayModal && (
          <div className="modal-overlay" style={{ zIndex: 300, background: 'rgba(24, 32, 28, 0.50)' }}>
            <div className="modal-content-card" style={{ maxWidth: '400px', background: '#FFFFFF', border: '1px solid var(--color-card-border)', boxShadow: '0 20px 48px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#EAF5EF', color: '#16845B', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem' }}>
                    Razorpay
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-cream)' }}>Secure Checkout</span>
                </div>
                <button
                  onClick={() => setShowRazorpayModal(false)}
                  style={{ background: '#F1F4F1', border: 'none', color: 'var(--color-cream)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ textAlign: 'center', padding: '12px 0 20px', borderBottom: '1px solid var(--color-card-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Paying to Boozer Telangana Depot</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary-mint)', marginTop: '4px' }}>
                  ₹{totalAmount.toFixed(2)}
                </h3>
              </div>

              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: paymentMethod === 'UPI' ? 'rgba(22, 132, 91, 0.08)' : '#F7F9F8',
                  border: `1px solid ${paymentMethod === 'UPI' ? 'var(--color-primary-mint)' : 'var(--color-card-border)'}`,
                  padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Instant UPI (GPay / PhonePe / Paytm)</strong>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Fastest approval · Zero transaction fee</p>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: paymentMethod === 'CARD' ? 'rgba(22, 132, 91, 0.08)' : '#F7F9F8',
                  border: `1px solid ${paymentMethod === 'CARD' ? 'var(--color-primary-mint)' : 'var(--color-card-border)'}`,
                  padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Credit or Debit Card</strong>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Visa, Mastercard, RuPay</p>
                  </div>
                </label>
              </div>

              <button
                style={{
                  background: 'linear-gradient(135deg, #116149 0%, #16845B 50%, #4FAF86 100%)',
                  color: '#fff', width: '100%', padding: '12px',
                  borderRadius: 'var(--radius-full)', border: 'none',
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
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
