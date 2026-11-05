import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function SplashScreen({ onGetStarted }) {
  const [animStage, setAnimStage] = useState(0); // 0: Dark, 1: Drop falling, 2: Glass filling, 3: Fully lit

  useEffect(() => {
    const t1 = setTimeout(() => setAnimStage(1), 300);
    const t2 = setTimeout(() => setAnimStage(2), 1100);
    const t3 = setTimeout(() => setAnimStage(3), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', minHeight: '820px',
      background: 'radial-gradient(circle at 50% 30%, #1D1432 0%, #0F0B18 50%, #08060C 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '48px 24px 36px', overflow: 'hidden', color: 'var(--color-cream)'
    }}>
      {/* City lights background simulation */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(to top, rgba(112, 43, 192, 0.15) 0%, transparent 100%)',
        opacity: animStage >= 3 ? 1 : 0.2, transition: 'opacity 1.5s ease'
      }} />

      {/* Bokeh / Glow Lights */}
      <div style={{
        position: 'absolute', top: '20%', left: '15%', width: '180px', height: '180px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(231, 161, 61, 0.22) 0%, transparent 70%)',
        filter: 'blur(30px)', opacity: animStage >= 2 ? 1 : 0, transition: 'opacity 1.2s ease'
      }} />

      <div style={{
        position: 'absolute', top: '35%', right: '10%', width: '160px', height: '160px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(112, 43, 192, 0.25) 0%, transparent 70%)',
        filter: 'blur(30px)', opacity: animStage >= 2 ? 1 : 0, transition: 'opacity 1.2s ease'
      }} />

      {/* Top Timestamp matching reference: 9:41 Mon, Oct 27 */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <h2 style={{ fontSize: '2.8rem', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>9:41</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>Mon, Oct 27</p>
      </div>

      {/* Centre: B[glass]ZER Logo with Falling Drop & Liquid Fill */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 10, textAlign: 'center'
      }}>
        {/* Animated Droplet */}
        <div style={{
          width: '8px', height: '14px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          background: 'linear-gradient(to bottom, #FFE8B2, #E7A13D)',
          boxShadow: '0 0 10px rgba(231, 161, 61, 0.8)',
          marginBottom: '12px',
          opacity: animStage === 1 ? 1 : 0,
          transform: animStage === 1 ? 'translateY(16px)' : 'translateY(-10px)',
          transition: 'all 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53)'
        }} />

        {/* Logo Text with Glass Icon in the middle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900,
          letterSpacing: '0.04em', color: '#fff',
          textShadow: animStage >= 2 ? '0 0 30px rgba(231, 161, 61, 0.45)' : 'none',
          transition: 'all 0.8s ease'
        }}>
          <span>B</span>
          {/* Whiskey glass SVG silhouette filled with liquid */}
          <div style={{
            width: '42px', height: '48px', margin: '0 2px', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg viewBox="0 0 40 46" width="100%" height="100%">
              {/* Glass Tumbler Outline */}
              <path
                d="M6 4 L34 4 L31 40 C31 42 29 44 27 44 L13 44 C11 44 9 42 9 40 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Liquid inside tumbler */}
              <path
                d="M8.5 18 L31.5 18 L29.5 39 C29.5 41 28 42 26 42 L14 42 C12 42 10.5 41 10.5 39 Z"
                fill="url(#goldLiquidGrad)"
                style={{
                  transformOrigin: 'bottom',
                  transform: animStage >= 2 ? 'scaleY(1)' : 'scaleY(0)',
                  transition: 'transform 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              />
              {/* Ice cube silhouette */}
              <rect
                x="14" y="24" width="12" height="12" rx="2"
                fill="rgba(255, 255, 255, 0.25)"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1"
                transform="rotate(12 20 30)"
                style={{ opacity: animStage >= 2 ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}
              />
              <defs>
                <linearGradient id="goldLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F5B24E" />
                  <stop offset="50%" stopColor="#E7A13D" />
                  <stop offset="100%" stopColor="#9E6112" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>ZER</span>
        </div>

        {/* Subtitle & Taglines */}
        <p style={{
          fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold)',
          letterSpacing: '0.04em', marginTop: '10px'
        }}>
          Order. Drink. Ride.
        </p>

        <p style={{
          fontSize: '0.78rem', color: 'var(--color-cream-muted)', maxWidth: '240px',
          marginTop: '6px', lineHeight: 1.4
        }}>
          Legal alcohol delivery with a safe ride home built in.
        </p>

        <div style={{
          marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.7rem',
          color: 'var(--color-cream-subtle)'
        }}>
          <span>Drink responsibly. Ride safely.</span>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          className="btn-primary"
          onClick={onGetStarted}
          style={{
            padding: '16px', borderRadius: 'var(--radius-full)', fontSize: '0.96rem',
            boxShadow: 'var(--glow-gold)'
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--color-cream-subtle)' }}>
          By continuing, you verify you are of legal drinking age in Telangana (21+).
        </p>
      </div>
    </div>
  );
}
