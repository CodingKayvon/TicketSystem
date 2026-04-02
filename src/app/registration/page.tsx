'use client';

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

// Icons
import { TicketIcon } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../util/firebase-client';
import { doc, setDoc } from 'firebase/firestore';

const Registration = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //Set Display Name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Store additional info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        createdAt: new Date(),
      });

      // Redirect to Role Selection
      router.push('/pages/RoleSelection');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account');
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
          background:
            "radial-gradient(ellipse, rgba(59,130,246,.07) 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-xl bg-[#0c1220] shadow-[0_0_0_1px_#1a2640,0_20px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(59,130,246,0.04)]">
        {/* Header */}
        <div className='mb-8 pb-5 text-center border-b'>
          <div className='text-xs text-[#4a5c7a] uppercase tracking-widest mb-1 flex items-center justify-center gap-2'>
            <TicketIcon className='w-4 h-4' />
            Ticket System
          </div>
          <h1 className='text-white text-2xl font-bold'>Create an Account</h1>
        </div>

        {/* Form */}
        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Full Name */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Full Name
            </label>
            <input
              type='text'
              name='fullName'
              placeholder='Your Name'
              value={formData.fullName}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Email
            </label>
            <input
              type='email'
              name='email'
              placeholder='you@company.com'
              value={formData.email}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Password
            </label>
            <input
              type='password'
              name='password'
              placeholder='Min. 6 characters'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="absolute left-3 -top-2.5 text-xs text-[#4a5c7a] bg-[#0c1220] px-1">
              Confirm Password
            </label>
            <input
              type='password'
              name='confirmPassword'
              placeholder='Re-enter password'
              value={formData.confirmPassword}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-md bg-[#080e1a] border border-[#1a2640] text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              required
            />
          </div>

          {/* Sign-Up Btn */}
          <button
            type='submit'
            disabled={loading}
            className='mt-3 w-full py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50'
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <h1 className='flex justify-center gap-1 text-white text-sm mt-2'>
            Already have an account? 
            <button 
              type='button'
              onClick={() => router.push('/login')}
              className='text-blue-500 hover:text-white transition-colors font-medium cursor-pointer'
            >
              Sign In
            </button>
          </h1>
        </form>
      </div>
    </div>
  )
};

export default Registration;