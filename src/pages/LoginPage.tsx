import React from 'react';
import { useAuth } from '../hooks/useAuth';

function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(-45deg, #000000, #1a0000, #000066, #cc0000, #000033, #660000)',
      backgroundSize: '400% 400%',
      animation: 'radiantFlow 15s ease infinite',
      zIndex: -1
    }}>
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '15%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, rgba(255, 0, 0, 0.1) 40%, transparent 70%)',
        animation: 'radiantPulse 8s ease-in-out infinite',
        filter: 'blur(2px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 100, 255, 0.25) 0%, rgba(0, 100, 255, 0.08) 40%, transparent 70%)',
        animation: 'radiantPulse 6s ease-in-out infinite 2s',
        filter: 'blur(2px)'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '60%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(150, 0, 50, 0.2) 0%, rgba(150, 0, 50, 0.05) 40%, transparent 70%)',
        animation: 'radiantPulse 10s ease-in-out infinite 4s',
        filter: 'blur(3px)'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 ? '#ff0033' : i % 3 === 1 ? '#0066ff' : '#ffffff',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: '110%',
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${30 + Math.random() * 20}s`,
              animation: 'floatParticles 50s infinite linear',
              opacity: 0.6,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>
      
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-10%',
        width: '120%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 0, 50, 0.6), transparent)',
        animation: 'streakMove 12s ease-in-out infinite',
        filter: 'blur(1px)'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '70%',
        left: '-10%',
        width: '120%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 100, 255, 0.4), transparent)',
        animation: 'streakMove 8s ease-in-out infinite 3s',
        filter: 'blur(1px)'
      }} />
    </div>
  );
}

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        @keyframes radiantFlow {
          0% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
          100% { 
            background-position: 0% 50%; 
          }
        }
        
        @keyframes radiantPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
        
        @keyframes floatParticles {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes streakMove {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        
        .login-container {
          animation: slideIn 0.8s ease-out;
        }
        
        .input-focus:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          outline: none;
          background-color: white;
          transition: all 0.2s ease;
        }
        
        .button-hover:hover:not(:disabled) {
          background: #0f172a !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <AnimatedBackground />
      
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div 
          className="login-container"
          style={{ 
            maxWidth: '400px', 
            width: '100%', 
            backgroundColor: 'white',
            padding: '48px 40px',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#4f46e5',
              borderRadius: '16px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(79, 70, 229, 0.3)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            }}>
              🛡️
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                fontFamily: 'Inter, sans-serif',
                color: '#1e293b',
                marginBottom: '4px',
                letterSpacing: '-0.02em'
              }}>
                Kyntri EHS
              </h1>
              <p style={{ 
                color: '#4f46e5', 
                fontSize: '14px', 
                margin: '0 0 16px 0',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Safety Platform
              </p>
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              fontFamily: 'Inter, sans-serif',
              color: '#1e293b',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Welcome back
            </h2>
            <p style={{ 
              color: '#64748b', 
              fontSize: '16px', 
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400'
            }}>
              Please sign in to continue
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#dc2626',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>⚠️ Login Failed</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px',
                  zIndex: 1
                }}>
                  ✉️
                </div>
                <input
                  className="input-focus"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email address"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.6 : 1,
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px',
                  zIndex: 1
                }}>
                  🔒
                </div>
                <input
                  className="input-focus"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 48px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.6 : 1,
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#64748b',
                    zIndex: 1
                  }}
                >
                  👁️
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '14px',
                color: '#64748b',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    marginRight: '8px',
                    width: '16px',
                    height: '16px'
                  }}
                />
                Remember me
              </label>
              <a href="#" style={{
                fontSize: '14px',
                color: '#4f46e5',
                textDecoration: 'none'
              }}>
                Forgot password?
              </a>
            </div>

            <button
              className="button-hover"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading 
                  ? '#94a3b8' 
                  : '#1e293b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                marginBottom: '32px'
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }} />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
        </div>
      </div>
    </>
  );
}