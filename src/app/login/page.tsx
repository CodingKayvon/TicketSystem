'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketIcon } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../util/firebase-client';

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/pages/tickets');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#060a12]">
      {/* Ambient glow */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[150] h-[75] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(59,130,246,.07) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-xl bg-[#0c1220] shadow-[0_0_0_1px_#1a2640,0_20px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(59,130,246,0.04)]">
        {/* Header */}
        <div className="mb-8 pb-5 text-center border-b">
          <div className="text-xs text-[#4a5c7a] uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
            <TicketIcon className="w-4 h-4" />
            Ticket System
          </div>
          <h1 className="text-white text-2xl font-bold">Sign In</h1>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Email */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Sign-In Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <h1 className="flex justify-center gap-1 text-white text-sm mt-2">
            Don’t have an account? 
            <button
              type="button"
              onClick={() => router.push('/registration')}
              className="text-blue-500 hover:text-white transition-colors font-medium cursor-pointer"
            >
              Sign Up
            </button>
          </h1>
        </form>
      </div>
    </div>
  );
};

export default Login;