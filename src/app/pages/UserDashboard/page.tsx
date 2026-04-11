'use client'

import { db } from '@/app/util/firebase-client';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Ticket as TicketIcon } from 'lucide-react'
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { Ticket } from '@/app/types/Ticket';
import { Priority } from '@/app/types/Ticket';
import { Status } from '@/app/types/Ticket';
import CommentModal from '@/app/components/CommentModal/page';

const UserDashboard = () => {
  const auth = getAuth();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all')

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);

  const statusConfig = {
    open: {
      label: 'Open',
      class: 'bg-blue-500/20 text-blue-300',
    },
    'in-progress': {
      label: 'In Progress',
      class: 'bg-amber-500/20 text-amber-300',
    },
    resolved: {
      label: 'Resolved',
      class: 'bg-emerald-500/20 text-emerald-300',
    },
    closed: {
      label: 'Closed',
      class: 'bg-gray-500/20 text-gray-300',
    },
  };

  const priorityConfigCard = {
    low: {
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
    },
    medium: {
      text: 'text-amber-300',
      dot: 'bg-amber-400',
    },
    high: {
      text: 'text-red-300',
      dot: 'bg-red-400',
    },
  };

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

  const timeAgo = (seconds: number) => {
    const now = Date.now();
    const diff = now - seconds * 1000;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;

    return 'Just now';
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  //Fetch Current Users Tickets
  useEffect(() => {
    if(!user) return

    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[];

      setTickets(data);
    })

    return () => unsubscribe();
  }, [user]);
  
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

  const filteredTickets = tickets.filter(ticket => {
    const matchStatus =
      statusFilter === 'all' || ticket.status === statusFilter;

    return matchStatus;
  });

  const visibleTickets = filteredTickets;


  const unresolvedTickets = tickets.filter(
    ticket => 
      ticket.status !== 'resolved' &&
      ticket.status !== 'closed'
  );

  const isReady = subject.trim() && description.trim() && priority;

  return (
    <div className='min-h-screen flex flex-col bg-linear-to-br from-slate-950 to-slate-800/50 justify-center items-center'>
      
      {/* Ticket Form */}
      <div className='flex flex-col w-132 bg-gray-600 rounded-xl border border-slate-400 lg:mt-0 mt-20'>

        {/* Header */}
        <div className='px-8 pt-8 pb-6 border-b border-gray-700/50'>
          <div className='flex items-center gap-3 mb-1'>
            <TicketIcon className='text-gray-800'/>
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

      {/* User Tickets */}
      <div className="flex flex-col w-132 lg:max-h-[72vh] overflow-y-auto lg:absolute lg:right-40 pl-2 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">

        <div className="flex flex-col gap-3 mt-8 mb-6">
          {/* Title row */}
          <div className="flex items-center text-white text-lg font-semibold">
            <h2 className="pr-2">Your Tickets -</h2>
            {visibleTickets.length}
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">

            {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-slate-500/30 text-white border border-slate-400'
                      : 'bg-gray-800/40 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
                  }
                `}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}

          </div>
        </div>
      {tickets.length === 0 ? (
          <p className="text-gray-400 text-sm">No tickets submitted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">

            {visibleTickets.map(ticket => {
              const sConf = statusConfig[ticket.status];
              const pConf = priorityConfigCard[ticket.priority];

              return (
                <div
                  key={ticket.id}
                  className="bg-gray-700 border border-gray-600 rounded-xl p-4"
                >

                  {/* Header */}
                  <div className="flex justify-between items-center mb-2 capitalize">
                    <p className="text-white text-sm">
                      <span className='text-gray-400 font-semibold'>Subject: </span>
                      {ticket.subject}
                    </p>

                    <span className={`text-xs px-2.5 py-1 rounded-md ${sConf?.class}`}>
                      {sConf?.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-xs mt-2 capitalize">
                    <span className='font-bold'>Desciption: </span>
                    <br />
                    {ticket.description}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between mt-3 text-xs text-gray-400">

                    <div className='flex items-end'>
                      <button
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setCommentOpen(true);
                        }}
                        className='mt-3 text-xs text-blue-300 cursor-pointer'
                      >
                        View Comments
                      </button>
                    </div>


                    <div className='flex'>
                      <div className="grid grid-cols-[90px_1fr] gap-y-1">

                        {/* Priority */}
                        <span className="text-right pr-2">Priority:</span>
                        <span className={`text-left capitalize ${pConf.text}`}>
                          {ticket.priority}
                        </span>

                        {/* Assigned To */}
                        <span className="text-right pr-2">Assigned:</span>
                        <span className="text-left capitalize">
                          {ticket.assignedToName || 'Unassigned'}
                        </span>

                        {/* Created */}
                        <span className="text-right pr-2">Created:</span>
                        <span className="text-left">
                          {ticket.createdAt ? timeAgo(ticket.createdAt.seconds) : '—'}
                        </span>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

)}
      </div>
      <CommentModal 
        ticketId={selectedTicketId || ''}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        role="user"
      />
    </div>
  )
}

export default UserDashboard