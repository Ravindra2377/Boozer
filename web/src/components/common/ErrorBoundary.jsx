import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BOOZER UI CRASH]', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('boozer_user');
      localStorage.removeItem('boozer_token');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090E',
          color: '#F4E8D1',
          padding: '24px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(21, 21, 32, 0.95)',
            border: '1px solid rgba(231, 161, 61, 0.3)',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(231, 161, 61, 0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#EF4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#F4E8D1',
              marginBottom: '8px'
            }}>
              Interface Notice
            </h2>

            <p style={{
              fontSize: '0.88rem',
              color: '#A9A49B',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}>
              A component encountered an unexpected error during rendering. You can restore your session below.
            </p>

            {this.state.error?.message && (
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.74rem',
                color: '#EF4444',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '24px'
              }}>
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#F4E8D1',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={14} />
                <span>Reload</span>
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #E7A13D 0%, #D48924 100%)',
                  color: '#09090E',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(231, 161, 61, 0.35)'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset & Restore</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
