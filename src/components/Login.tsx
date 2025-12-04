import { useState } from 'react';
import { LogIn } from 'lucide-react';
import AnimatedCableBackground from './AnimatedCableBackground';

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(email);
    }, 500);
  };

  return (
    <>
    <AnimatedCableBackground />

  <div className="min-h-screen flex items-center justify-center relative">
      <div className={`w-full max-w-md p-8 rounded-lg shadow-xl bg-white`}>
        <div className="flex items-center justify-center mb-6">
          <div className={`p-3 rounded-full bg-blue-100`}>
            <LogIn className={`w-6 h-6 'text-blue-600`} />
          </div>
        </div>

        <h1 className={`text-3xl font-bold text-center mb-2 text-gray-900`}>
          Network Simulator
        </h1>
        <p className={`text-center mb-6 text-gray-600`}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 text-gray-700`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 text-gray-700`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className={`w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500`}
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm bg-red-900 text-red-200' : 'bg-red-100 text-red-800`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400`}
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-4 text-center text-sm text-gray-600`}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className={`ml-1 font-semibold text-blue-600 hover:text-blue-700`}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className={`mt-6 p-4 rounded-lg text-xs bg-gray-100 text-gray-600`}>
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
    </>
    );
}