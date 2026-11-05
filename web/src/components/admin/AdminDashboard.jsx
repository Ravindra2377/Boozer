import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, UserCheck, AlertTriangle, RotateCcw,
  Clock, CheckCircle2, XCircle, Search, FileText, Database
} from 'lucide-react';
import {
  MOCK_ADMIN_METRICS, MOCK_FLAGGED_KYC, MOCK_AUDIT_LOGS, MOCK_RETAILER
} from '../../data/mockData';
import { api } from '../../api/client';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'kyc', 'orders', 'audit'
  const [flaggedKyc, setFlaggedKyc] = useState(MOCK_FLAGGED_KYC);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [metrics, setMetrics] = useState(MOCK_ADMIN_METRICS);
  const [refundStatus, setRefundStatus] = useState({});

  useEffect(() => {
    let mounted = true;
    api.getAdminMetrics().then((data) => {
      if (mounted && data) {
        setMetrics((prev) => ({ ...prev, ...data }));
      }
    });
    api.getAuditLogs().then((logs) => {
      if (mounted && logs && logs.length > 0) {
        setAuditLogs((prev) => [...logs, ...prev]);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleApproveKyc = async (id) => {
    setFlaggedKyc(flaggedKyc.filter((k) => k.id !== id));
    await api.approveKyc?.(id);
    const newLog = {
      id: `aud-${Date.now()}`,
      actorRole: "ADMIN",
      action: "KYC_MANUALLY_APPROVED",
      entity: "KYC_RECORD",
      entityId: id,
      details: "Admin approved flagged ID document after manual visual verification",
      timestamp: new Date().toLocaleTimeString()
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleRejectKyc = async (id) => {
    setFlaggedKyc(flaggedKyc.filter((k) => k.id !== id));
    await api.rejectKyc?.(id, "Liveness check confidence below threshold");
    const newLog = {
      id: `aud-${Date.now()}`,
      actorRole: "ADMIN",
      action: "KYC_MANUALLY_REJECTED",
      entity: "KYC_RECORD",
      entityId: id,
      details: "Admin rejected document: Liveness check confidence below threshold",
      timestamp: new Date().toLocaleTimeString()
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleInitiateRefund = (orderId) => {
    setRefundStatus({ ...refundStatus, [orderId]: 'REFUNDED' });
    const newLog = {
      id: `aud-${Date.now()}`,
      actorRole: "ADMIN",
      action: "RAZORPAY_REFUND_INITIATED",
      entity: "ORDER",
      entityId: orderId,
      details: `Full refund initiated via Razorpay API. Refund ID: rfp_9182a49b`,
      timestamp: new Date().toLocaleTimeString()
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <div className="main-content-viewport" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Admin Header */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-rust)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="badge-row" style={{ marginBottom: '4px' }}>
                <span className="badge-teal">Pilot Ops Command Center</span>
                <span className="badge-amber">Delhi City Pilot</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                Boozer Platform Compliance & Admin
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                Oversight for State Excise Licensing, DigiLocker Verification, Refunds & Safe Ride Redemptions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-teal">System Status: Healthy</span>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="glass-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Total Orders Today
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-amber)', margin: '4px 0' }}>
              {metrics.totalOrdersToday || metrics.totalOrders || 128}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-teal)' }}>+14.2% from yesterday</span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Active In-Transit Deliveries
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-cream)', margin: '4px 0' }}>
              {metrics.activeDeliveries || 19}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>Average ETA: 11 mins</span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              DigiLocker KYC Pass Rate
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-teal)', margin: '4px 0' }}>
              {metrics.kycPassRate || 96.4}%
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>DPDP compliant</span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Safe Ride Credit Redemption
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-amber)', margin: '4px 0' }}>
              {metrics.rideRedemptionRate || metrics.safeRideRedemptionRatePercent || 42.8}%
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-teal)' }}>High safety engagement</span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Open Emergency SOS Alerts
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-crimson)', margin: '4px 0' }}>
              {metrics.openSosIncidents !== undefined ? metrics.openSosIncidents : (metrics.safetyIncidentsCount || 0)}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-teal)' }}>All incidents resolved</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-ink-border)', paddingBottom: '10px' }}>
          <button
            className={`view-mode-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <ShieldCheck size={16} />
            <span>Overview & Retailers</span>
          </button>

          <button
            className={`view-mode-btn ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <UserCheck size={16} />
            <span>Flagged KYC Queue ({flaggedKyc.length})</span>
          </button>

          <button
            className={`view-mode-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <RotateCcw size={16} />
            <span>Orders & Refunds</span>
          </button>

          <button
            className={`view-mode-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Database size={16} />
            <span>Immutable Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB: FLAGGED KYC REVIEW */}
        {activeTab === 'kyc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Flagged KYC Verification Queue</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-cream-muted)' }}>
                Manual visual inspection for edge cases
              </span>
            </div>

            {flaggedKyc.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '36px' }}>
                <CheckCircle2 size={36} color="var(--color-teal)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>KYC Queue is Clear!</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                  All user verification requests have been processed.
                </p>
              </div>
            ) : (
              flaggedKyc.map((item) => (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-cream)' }}>
                        {item.userFullName}
                      </strong>
                      <span className="badge-rust">{item.documentType} ({item.maskedId})</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>{item.submittedAt}</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--color-cream-muted)' }}>
                      Phone: {item.phone} · Calculated Age: <strong>{item.calculatedAge} Years</strong> (Legal: 21+)
                    </p>

                    <div style={{
                      marginTop: '6px', fontSize: '0.75rem', color: '#FFA07A',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <AlertTriangle size={14} />
                      <span>Flag: {item.flagReason}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleRejectKyc(item.id)}
                      style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--color-crimson)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>

                    <button
                      className="btn-teal"
                      onClick={() => handleApproveKyc(item.id)}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve KYC</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: ORDERS & REFUNDS */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Retailer</th>
                  <th>Total MRP</th>
                  <th>Doorstep Age Check</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>BZ-20261104-1849</strong></td>
                  <td>Rohit Sharma</td>
                  <td>Connaught Place Vintners</td>
                  <td><strong>₹1,880.00</strong></td>
                  <td><span className="badge-amber">Pending at Door</span></td>
                  <td><span className="badge-teal">DISPATCHED</span></td>
                  <td>
                    {refundStatus['BZ-20261104-1849'] === 'REFUNDED' ? (
                      <span className="badge-rust">Refunded</span>
                    ) : (
                      <button
                        onClick={() => handleInitiateRefund('BZ-20261104-1849')}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: 'var(--color-crimson)', borderRadius: '6px', padding: '4px 10px',
                          fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Refund Order
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>BZ-20261028-0912</strong></td>
                  <td>Rohit Sharma</td>
                  <td>Connaught Place Vintners</td>
                  <td><strong>₹4,720.00</strong></td>
                  <td><span className="badge-teal">Verified by Rider</span></td>
                  <td><span className="badge-teal">DELIVERED</span></td>
                  <td><span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>Settled</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: AUDIT LOG TRAIL */}
        {activeTab === 'audit' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Actor Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Operational Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--color-cream-muted)' }}>{log.id}</span></td>
                    <td><span className="badge-amber">{log.actorRole}</span></td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.entity} ({log.entityId})</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>{log.details}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: OVERVIEW & RETAILERS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Licensed Retailers in Active Pilot Zone</h3>

            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="badge-row" style={{ marginBottom: '4px' }}>
                  <span className="badge-teal">State Licence Verified</span>
                  <span className="badge-amber">Delhi Excise L-2</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-cream)' }}>
                  {MOCK_RETAILER.storeName}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                  {MOCK_RETAILER.legalEntityName} · Licence: {MOCK_RETAILER.licenceNumber} · Expiry: 31-Mar-2027
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)', marginTop: '4px' }}>
                  Operating Radius: {MOCK_RETAILER.deliveryRadiusKm} km · Payout Account: {MOCK_RETAILER.payoutAccount}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge-teal">Active in Pilot</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
