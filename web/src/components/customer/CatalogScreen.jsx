import React, { useState, useEffect } from 'react';
import {
  Search, ShieldCheck, MapPin, ChevronDown, Bell, Plus, Check,
  ArrowRight, Car, Clock, AlertTriangle, CheckCircle2,
  LayoutGrid, Beer, Wine, Flame, GlassWater, X
} from 'lucide-react';
import { api } from '../../api/client';

export function CatalogScreen({
  retailer,
  products,
  cart,
  onAddToCart,
  onSelectProduct,
  onNavigateToRides
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pourProduct, setPourProduct] = useState(null);
  const [exciseStatus, setExciseStatus] = useState({
    isPermitted: true,
    isDryDay: false,
    dryDayReason: null,
    isWithinExciseZone: true,
    deliveryDistanceKm: 1.4,
    maxRadiusKm: 6.5,
    minutesRemaining: 108
  });

  useEffect(() => {
    let mounted = true;
    api.getExciseStatus('TELANGANA').then((status) => {
      if (mounted && status) {
        setExciseStatus(status);
      }
    });
    return () => { mounted = false; };
  }, []);

  const categories = [
    { key: 'ALL', label: 'All Drinks', icon: <LayoutGrid size={16} /> },
    { key: 'BEER', label: 'Beer', icon: <Beer size={16} /> },
    { key: 'WHISKY', label: 'Whisky', icon: <Flame size={16} /> },
    { key: 'VODKA', label: 'Vodka', icon: <GlassWater size={16} /> },
    { key: 'RUM', label: 'Rum', icon: <Flame size={16} /> },
    { key: 'WINE', label: 'Wine', icon: <Wine size={16} /> }
  ];

  const handleAddWithPour = (prod) => {
    setPourProduct(prod);
    onAddToCart(prod);
    setTimeout(() => {
      setPourProduct(null);
    }, 1200);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="screen-scroll-body" style={{ position: 'relative' }}>
      {/* Top Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cream)', letterSpacing: '-0.02em' }}>
            Good evening, Panvi
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
            <MapPin size={13} color="var(--color-primary-mint)" />
            <strong style={{ color: 'var(--color-cream)' }}>Hyderabad</strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>· Jubilee Hills 500081</span>
            <ChevronDown size={14} color="var(--color-cream-muted)" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-plum-surface)',
            border: '1px solid var(--color-card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cream-muted)'
          }}>
            <Bell size={16} />
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--color-primary-mint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 800, color: '#0E1511'
          }}>
            P
          </div>
        </div>
      </div>

      {/* State Excise & Geofence Compliance Bar */}
      {exciseStatus.isDryDay ? (
        <div style={{
          background: 'rgba(220, 76, 62, 0.12)', border: '1px solid rgba(220, 76, 62, 0.3)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertTriangle size={18} color="var(--color-crimson)" />
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block' }}>
              Statutory Dry Day · {exciseStatus.dryDayReason || 'National Holiday'}
            </strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
              Alcohol delivery prohibited under Section 17 of Telangana Excise Act 1968.
            </span>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.28)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-mint)' }}>
            <CheckCircle2 size={13} />
            <span><strong>Excise Zone 2</strong> · {exciseStatus.deliveryDistanceKm} km inside 6.5 km boundary</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-mint)' }}>
            <Clock size={12} />
            <span>Closes in {Math.floor(exciseStatus.minutesRemaining / 60)}h {exciseStatus.minutesRemaining % 60}m</span>
          </div>
        </div>
      )}

      {/* CompareX Signature Search Bar */}
      <div className="glow-search-bar" style={{
        background: 'var(--color-plum-surface)',
        borderColor: 'var(--color-card-border)',
      }}>
        <Search size={16} color="var(--color-cream-muted)" />
        <input
          type="text"
          placeholder="Search by brand, category, or vintage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-cream-muted)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* CompareX Signature Emerald Hero Ride Voucher Banner */}
      <div className="hero-ride-banner">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ maxWidth: '70%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(101, 201, 156, 0.22)', border: '1px solid rgba(101, 201, 156, 0.4)',
              color: '#FFFFFF', borderRadius: 'var(--radius-full)', padding: '2px 8px',
              fontSize: '0.68rem', fontWeight: 700, marginBottom: '6px'
            }}>
              <ShieldCheck size={12} color="#FFFFFF" />
              <span>Responsible Transit Voucher</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25 }}>
              ₹150 Safe Ride Credit Included
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
              Drink responsibly. Every order comes with an automatic ₹150 credit voucher for an Uber or Ola safe ride home.
            </p>
            <button
              onClick={onNavigateToRides}
              style={{
                marginTop: '10px',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: 'var(--color-primary-mint)',
                color: '#0E1511',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span>View Ride Credit</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Clean Graphic Badge */}
          <div style={{
            width: '74px', height: '74px', borderRadius: '16px',
            background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(101, 201, 156, 0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '2px'
          }}>
            <Car size={24} color="var(--color-primary-mint)" />
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-primary-mint)' }}>₹150 OFF</span>
          </div>
        </div>
      </div>

      {/* Category Icons Row with CompareX Active Styling */}
      <div>
        <div className="category-row">
          {categories.map((c) => {
            const isActive = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                className={`category-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.key)}
              >
                <div className="category-icon-box" style={{
                  background: isActive ? 'rgba(101, 201, 156, 0.16)' : 'var(--color-plum-surface)',
                  borderColor: isActive ? 'var(--color-primary-mint)' : 'var(--color-card-border)',
                  color: isActive ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)',
                }}>
                  {c.icon}
                </div>
                <span className="category-label" style={{
                  color: isActive ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)',
                  fontWeight: isActive ? 800 : 600,
                }}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Picks with CompareX Product Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              Curated Excise Stock
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
              Showing {filteredProducts.length} verified spirits in legal delivery zone
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-mint)', fontWeight: 700, cursor: 'pointer' }}>
            See all →
          </span>
        </div>

        <div className="products-grid">
          {filteredProducts.map((prod) => {
            const qty = getCartQuantity(prod.id);
            const originalPrice = Math.round(prod.priceLegalMrp * 1.08);
            const savings = originalPrice - prod.priceLegalMrp;

            return (
              <div
                key={prod.id}
                className="product-card"
                onClick={() => onSelectProduct(prod)}
              >
                <div className="product-img-wrap">
                  <img src={prod.imageUrl} alt={prod.name} loading="lazy" />

                  {/* Savings Badge */}
                  {savings > 50 && (
                    <span style={{
                      position: 'absolute', top: '6px', left: '6px',
                      background: 'var(--color-savings)',
                      color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 800,
                      padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.02em',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      SAVE ₹{savings}
                    </span>
                  )}

                  {/* ABV Tag */}
                  <span style={{
                    position: 'absolute', bottom: '6px', left: '6px',
                    background: 'rgba(14, 21, 17, 0.85)', backdropFilter: 'blur(6px)',
                    color: 'var(--color-primary-mint)', fontSize: '0.65rem', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(101, 201, 156, 0.25)'
                  }}>
                    {prod.abv}% ABV · {prod.volumeMl}ml
                  </span>
                </div>

                <div>
                  <span style={{
                    fontSize: '0.66rem', color: 'var(--color-primary-mint)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800
                  }}>
                    {prod.brand}
                  </span>
                  <h4 style={{
                    fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-cream)',
                    lineHeight: 1.25, margin: '2px 0 4px', height: '36px', overflow: 'hidden'
                  }}>
                    {prod.name}
                  </h4>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-card-border)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span className="price-tag" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                        ₹{prod.priceLegalMrp.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', textDecoration: 'line-through' }}>
                        ₹{originalPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-primary-mint)', fontWeight: 600, display: 'block' }}>
                      Statutory MRP
                    </span>
                  </div>

                  <button
                    className="add-btn-circle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWithPour(prod);
                    }}
                    title="Add to Cart"
                  >
                    {qty > 0 ? (
                      <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>{qty}</span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>ADD +</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Added to Cart Toast */}
      {pourProduct && (
        <div className="liquid-pour-toast" style={{
          background: 'rgba(23, 32, 27, 0.95)',
          border: '1px solid var(--color-primary-mint)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(101, 201, 156, 0.25)',
        }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--color-primary-mint)', color: '#0E1511',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Check size={15} strokeWidth={3} />
          </div>
          <div>
            <strong style={{ fontSize: '0.82rem', color: '#fff' }}>
              Added {pourProduct.name}
            </strong>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-primary-mint)' }}>
              Added to order · ₹150 Safe Ride Credit active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
