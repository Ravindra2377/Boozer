import React, { useState, useEffect } from 'react';
import {
  Store, ShieldCheck, Clock, CheckCircle2, Package, Truck,
  AlertTriangle, DollarSign, RefreshCw, ToggleLeft, ToggleRight
} from 'lucide-react';
import { MOCK_RETAILER, MOCK_PRODUCTS } from '../../data/mockData';
import { api } from '../../api/client';

export function RetailerPortal() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'payouts'
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const [ordersQueue, setOrdersQueue] = useState([
    {
      id: "BZ-20261104-1849",
      time: "2 mins ago",
      customer: "Rohit Sharma",
      deliveryAddress: "Flat 402, Barakhamba Towers (1.4 km)",
      items: [
        { name: "Bira 91 White Craft Beer", qty: 2, mrp: 180 },
        { name: "Sula Rasa Cabernet Sauvignon", qty: 1, mrp: 1450 }
      ],
      total: 1880.00,
      status: "PAID", // PAID -> ACCEPTED -> PACKED -> DISPATCHED
      riderAssigned: "Amit Kumar (+91 98111 22334)"
    },
    {
      id: "BZ-20261104-1850",
      time: "8 mins ago",
      customer: "Aarav Nair",
      deliveryAddress: "Block C, Kasturba Gandhi Marg (2.1 km)",
      items: [
        { name: "Stranger & Sons Goa Gin", qty: 1, mrp: 2100 },
        { name: "Schweppes Tonic Water (Pack of 4)", qty: 1, mrp: 260 }
      ],
      total: 2430.00,
      status: "PACKED",
      riderAssigned: "Vikram Sen (+91 98222 33445)"
    }
  ]);

  useEffect(() => {
    let mounted = true;
    api.getRetailerOrders().then((data) => {
      if (mounted && data && Array.isArray(data) && data.length > 0) {
        // Map backend orders if returned
        setOrdersQueue((prev) => {
          return data.length >= prev.length ? data : prev;
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    await api.transitionOrder(orderId, nextStatus);
    setOrdersQueue(ordersQueue.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const handleToggleStock = (productId) => {
    setProducts(products.map((p) => {
      if (p.id === productId) {
        const nextInStock = !p.isInStock;
        return {
          ...p,
          isInStock: nextInStock,
          stockQuantity: nextInStock ? (p.stockQuantity > 0 ? p.stockQuantity : 12) : 0
        };
      }
      return p;
    }));
  };

  return (
    <div className="main-content-viewport" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Retailer Store Badge Bar */}
        <div className="store-hero-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink)'
              }}>
                <Store size={26} />
              </div>
              <div>
                <div className="badge-row" style={{ marginBottom: '4px' }}>
                  <span className="badge-teal">
                    <ShieldCheck size={12} />
                    <span>L-2 Retailer Terminal Active</span>
                  </span>
                  <span className="badge-amber">Delhi Excise Zone 1</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                  {MOCK_RETAILER.storeName}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                  Licence No: <strong>{MOCK_RETAILER.licenceNumber}</strong> · Operating Window: 10:00 AM – 10:00 PM
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge-teal" style={{ fontSize: '0.8rem' }}>● Accepting Orders</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                Razorpay Route Account: {MOCK_RETAILER.payoutAccount}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-ink-border)', paddingBottom: '10px' }}>
          <button
            className={`view-mode-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} />
            <span>Order Queue ({ordersQueue.length})</span>
          </button>

          <button
            className={`view-mode-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Store size={16} />
            <span>Stock & Inventory ({products.length})</span>
          </button>

          <button
            className={`view-mode-btn ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            <DollarSign size={16} />
            <span>Payouts & Settlements</span>
          </button>
        </div>

        {/* TAB 1: ORDER QUEUE */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Incoming Orders Queue</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                Auto-syncing with backend state machine
              </span>
            </div>

            {ordersQueue.map((ord) => (
              <div
                key={ord.id}
                className="glass-card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-amber)' }}>{ord.id}</strong>
                    <span className="badge-teal">{ord.status}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>{ord.time}</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--color-cream)' }}>
                    Customer: <strong>{ord.customer}</strong> · {ord.deliveryAddress}
                  </p>

                  <div style={{ margin: '8px 0', fontSize: '0.8rem', color: 'var(--color-cream-muted)' }}>
                    Items: {ord.items.map((i, idx) => (
                      <span key={idx} style={{ color: 'var(--color-cream)', marginRight: '8px' }}>
                        {i.qty}× {i.name} (₹{i.mrp * i.qty})
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>
                    Rider: <strong style={{ color: 'var(--color-teal)' }}>{ord.riderAssigned}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                    ₹{ord.total.toFixed(2)}
                  </div>

                  {/* Actions depending on state */}
                  {ord.status === 'PAID' && (
                    <button
                      className="btn-primary"
                      onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <span>Accept Order</span>
                    </button>
                  )}

                  {ord.status === 'ACCEPTED' && (
                    <button
                      className="btn-teal"
                      onClick={() => handleUpdateOrderStatus(ord.id, 'PACKED')}
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <Package size={15} />
                      <span>Mark Packed with Excise Seal</span>
                    </button>
                  )}

                  {ord.status === 'PACKED' && (
                    <button
                      className="btn-primary"
                      onClick={() => handleUpdateOrderStatus(ord.id, 'DISPATCHED')}
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <Truck size={15} />
                      <span>Handover to Rider (Dispatch)</span>
                    </button>
                  )}

                  {ord.status === 'DISPATCHED' && (
                    <span className="badge-teal">
                      <CheckCircle2 size={13} />
                      <span>Dispatched to Recipient</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INVENTORY & STOCK */}
        {activeTab === 'inventory' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>ABV</th>
                  <th>Volume</th>
                  <th>Statutory MRP</th>
                  <th>Stock Quantity</th>
                  <th>Stock Toggle</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{prod.name}</strong>
                          <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>{prod.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-amber">{prod.category}</span></td>
                    <td>{prod.abv}%</td>
                    <td>{prod.volumeMl} ml</td>
                    <td><strong>₹{prod.priceLegalMrp.toFixed(2)}</strong></td>
                    <td>
                      <span style={{ fontWeight: 700, color: prod.isInStock ? 'var(--color-cream)' : 'var(--color-crimson)' }}>
                        {prod.stockQuantity} units
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStock(prod.id)}
                        style={{
                          background: prod.isInStock ? 'rgba(42, 157, 143, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: prod.isInStock ? 'var(--color-teal)' : 'var(--color-crimson)',
                          border: `1px solid ${prod.isInStock ? 'var(--color-teal)' : 'var(--color-crimson)'}`,
                          borderRadius: 'var(--radius-full)', padding: '5px 12px',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {prod.isInStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PAYOUTS & SETTLEMENTS */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="glass-card">
              <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Today's Net Sales</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-amber)', margin: '6px 0' }}>
                ₹48,220.00
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>24 completed orders fulfilled</p>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Excise Duty Remittance</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-cream)', margin: '6px 0' }}>
                ₹9,644.00
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Automated state ledger calculation</p>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Razorpay Route Payout</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-teal)', margin: '6px 0' }}>
                T+1 Settlement
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>Bank Account ending in ···8124</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
