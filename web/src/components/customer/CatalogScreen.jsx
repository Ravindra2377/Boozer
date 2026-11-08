import React, { useState, useEffect } from 'react';
import {
  Search, ShieldCheck, MapPin, ChevronDown, Bell, Plus, Check,
  ArrowRight, Car, Clock, AlertTriangle, CheckCircle2,
  LayoutGrid, Beer, Wine, Flame, GlassWater
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
    { key: 'ALL', label: 'All', icon: <LayoutGrid size={18} /> },
    { key: 'BEER', label: 'Beer', icon: <Beer size={18} /> },
    { key: 'WHISKY', label: 'Whisky', icon: <Flame size={18} /> },
    { key: 'VODKA', label: 'Vodka', icon: <GlassWater size={18} /> },
    { key: 'RUM', label: 'Rum', icon: <Flame size={18} /> },
    { key: 'WINE', label: 'Wine', icon: <Wine size={18} /> }
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-cream)' }}>
            Good evening, Panvi
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
            <MapPin size={13} color="var(--color-gold)" />
            <strong style={{ color: 'var(--color-cream)' }}>Hyderabad</strong>
            <ChevronDown size={14} color="var(--color-cream-muted)" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#1A1A22',
            border: '1px solid var(--color-card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cream-muted)'
          }}>
            <Bell size={16} />
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--color-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 800, color: '#0C0C0F'
          }}>
            P
          </div>
        </div>
      </div>

      {/* State Excise & Geofence Compliance Bar */}
      {exciseStatus.isDryDay ? (
        <div style={{
          background: 'rgba(214, 69, 69, 0.12)', border: '1px solid rgba(214, 69, 69, 0.3)',
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
          background: 'rgba(30, 130, 112, 0.10)', border: '1px solid rgba(30, 130, 112, 0.25)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}>
            <CheckCircle2 size={13} />
            <span><strong>Excise Zone 2</strong> · {exciseStatus.deliveryDistanceKm} km inside 6.5 km boundary</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)' }}>
            <Clock size={12} />
            <span>Closes in {Math.floor(exciseStatus.minutesRemaining / 60)}h {exciseStatus.minutesRemaining % 60}m</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="glow-search-bar">
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
            style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Hero Ride Voucher Banner */}
      <div className="hero-ride-banner">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ maxWidth: '68%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(197, 160, 89, 0.12)', border: '1px solid rgba(197, 160, 89, 0.3)',
              color: 'var(--color-gold)', borderRadius: 'var(--radius-full)', padding: '2px 8px',
              fontSize: '0.68rem', fontWeight: 600, marginBottom: '6px'
            }}>
              <ShieldCheck size={12} />
              <span>Responsible Transit Voucher</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-cream)', lineHeight: 1.25 }}>
              ₹150 Safe Ride Credit Included
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
              Every delivery comes with an automatic ₹150 credit voucher for an Uber or Ola safe ride home.
            </p>
            <button
              className="btn-primary"
              onClick={onNavigateToRides}
              style={{
                marginTop: '10px', padding: '6px 12px', fontSize: '0.74rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>View Ride Credit</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Clean Graphic Badge */}
          <div style={{
            width: '74px', height: '74px', borderRadius: '16px',
            background: '#1D1D28', border: '1px solid var(--color-card-border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px'
          }}>
            <Car size={26} color="var(--color-gold)" />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-gold)' }}>₹150 OFF</span>
          </div>
        </div>
      </div>

      {/* Category Icons Row */}
      <div>
        <div className="category-row">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`category-item ${selectedCategory === c.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.key)}
            >
              <div className="category-icon-box">
                {c.icon}
              </div>
              <span className="category-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Picks (Matching Reference Image 1) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-cream)' }}>
            Popular Picks
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700, cursor: 'pointer' }}>
            See all →
          </span>
        </div>

        <div className="products-grid">
          {filteredProducts.map((prod) => {
            const qty = getCartQuantity(prod.id);
            return (
              <div
                key={prod.id}
                className="product-card"
                onClick={() => onSelectProduct(prod)}
              >
                <div className="product-img-wrap">
                  <img src={prod.imageUrl} alt={prod.name} loading="lazy" />
                  <span style={{
                    position: 'absolute', bottom: '6px', left: '6px',
                    background: 'rgba(9, 9, 14, 0.85)', backdropFilter: 'blur(6px)',
                    color: '#FFA07A', fontSize: '0.65rem', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {prod.abv}% ABV · {prod.volumeMl}ml
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {prod.brand}
                  </span>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.25, margin: '2px 0 4px' }}>
                    {prod.name}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <span className="price-tag" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                      ₹{prod.priceLegalMrp.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-cream-subtle)', display: 'block' }}>
                      MRP · Legal Price
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
                      <Plus size={16} />
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
        <div className="liquid-pour-toast">
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--color-gold)', color: 'var(--color-midnight)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Check size={15} strokeWidth={3} />
          </div>
          <div>
            <strong style={{ fontSize: '0.82rem', color: '#fff' }}>
              Added {pourProduct.name}
            </strong>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>
              Added to order · ₹150 Safe Ride Credit active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
