'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularLoader } from '@/components/loader/Loader';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    const res = await fetch('/api/userauth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setLoading(false);

    if (res.ok) {
      router.push('/pages/home/chat-page');
    } else {
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-50 flex justify-center items-center">
          <CircularLoader />
        </div>
      )}

      <div className="bg-gray-900 border border-gray-700 shadow-xl rounded-2xl px-10 py-12 w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            />
          </div>
          {message && <p className="text-red-400 text-sm">{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Log In
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-4 border-t border-gray-700 pt-4">
          Don’t have an account?
          <button
            onClick={() => router.push('/pages/signup')}
            className="ml-1 text-blue-400 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
