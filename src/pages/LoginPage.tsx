import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signInWithGoogle } from '../services/auth';
import { useEffect, useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSigningIn(true);
      await signInWithGoogle();
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Time Tracker</h1>
        <p>Sign in to continue</p>
        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={signingIn}
        >
          {signingIn ? 'Signing in...' : 'Sign in with Google'}
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
