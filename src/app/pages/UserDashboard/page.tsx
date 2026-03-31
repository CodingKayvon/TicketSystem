'use client'

import { db } from '@/app/util/firebase-client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Ticket } from 'lucide-react'
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react'

const UserDashboard = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const priorityConfig = {
    low: {
      label: 'Low',
      icon: '●',
      activeClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
      dotClass: 'bg-emerald-400',
      hoverClass: 'hover:border-emerald-500/60 hover:text-emerald-400',
    },
    medium: {
      label: 'Medium',
      icon: '●',
      activeClass: 'bg-amber-500/20 border-amber-400 text-amber-300',
      dotClass: 'bg-amber-400',
      hoverClass: 'hover:border-amber-500/60 hover:text-amber-400',
    },
    high: {
      label: 'High',
      icon: '●',
      activeClass: 'bg-red-500/20 border-red-400 text-red-300',
      dotClass: 'bg-red-400',
      hoverClass: 'hover:border-red-500/60 hover:text-red-400',
    },
  };
  
  //Submit Ticket -> Store in Firebase
  const handleSubmit = async () => {
    if(!subject || !description || !priority) return

    try {
      await addDoc(collection(db, 'tickets'), {
        subject: subject.trim(),
        description: description.trim(),
        priority,
        status: 'open',
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userName: user?.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setTimeout(() => {
       setSubmitted(false);
       setSubject('');
       setDescription('');
       setPriority(null);
     }, 3000)
    } catch (error) {
      console.error("ERROR ADDING TICKET: ", error);
    }
  };

  const isReady = subject.trim() && description.trim() && priority;

  return (
    <div className='min-h-screen flex flex-col bg-linear-to-br from-gray-800 to-gray-700 justify-center items-center'>
      {/* Ticket Form */}
      <div className='flex flex-col w-132 bg-gray-600 rounded-xl border border-slate-900'>

        {/* Header */}
        <div className='px-8 pt-8 pb-6 border-b border-gray-700/50'>
          <div className='flex items-center gap-3 mb-1'>
            <Ticket className='text-gray-800'/>
            <span className='text-sm font-semibold tracking-widest text-gray-800 uppercase'>Support Portal</span>
          </div>

          <h1 className='text-2xl mt-2 mb-2 font-bold text-white tracking-tight'>
            Having issues? Submit a Ticket!
          </h1>
          <p className='text-sm text-gray-900'>Our team will get back to you shortly.</p>
        </div>

        {/* Form Body */}
        <div className='flex flex-col gap-5 px-8 py-7'>
          {/* Subject */}
          <div className='flex flex-col gap-2'>
            <label 
              className='text-xs font-semibold tracking-wider text-gray-400 uppercase'
            >
              Subject
            </label>
            <input 
              type="text"
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder='Brief summary of your issue...'
              className='w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all duration-200'
            />
          </div>

          {/* Description */}
          <div>
            <label
              className='text-xs font-semibold tracking-wider text-gray-400 uppercase'
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Describe the issue in detail - what happened, when, and what you expected to happen...'
              rows={4}
              className='w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all duration-200 resize-none'
            >
            </textarea>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Priority Level
            </label>

            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(priorityConfig) as Array<'low' | 'medium' | 'high'>).map((level) => {
                const config = priorityConfig[level]
                const isActive = priority === level
                return (
                  <button
                    key={level}
                    onClick={() => setPriority(level)}
                    className={`
                      relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 cursor-pointer
                      ${isActive
                        ? config.activeClass + ' shadow-lg'
                        : 'border-gray-700 text-gray-400 bg-gray-900/40 ' + config.hoverClass
                      }
                    `}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${isActive ? config.dotClass : 'bg-gray-600'}`} />
                    <span className="text-xs font-semibold tracking-wide">{config.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
                        style={{ background: 'currentColor' }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submission */}
          <div className='flex justify-center'>
            <button
              onClick={handleSubmit}
              disabled={!isReady}
              className={`
                  mt-1 w-58 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-transform duration-300 hover:scale-105
                  ${submitted
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : isReady
                      ? 'bg-linear-to-br from-slate-700 to-slate-900 hover:bg-linear-to-br hover:from-slate-600 hover:to-slate-700 text-white shadow-lg hover:shadow-lg hover:shadow-slate-500/30 cursor-pointer'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-700'
                  }
              `}
            >
              {submitted ? 'Ticket Submitted!' : 'Submit Ticket'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default UserDashboard