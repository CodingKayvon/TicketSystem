'use client'

import StatGrid from '@/app/components/StatGrid/page';
import { db } from '@/app/util/firebase-client';
import { collection, onSnapshot } from 'firebase/firestore';
import { Columns3Cog  } from 'lucide-react';
import React, { useEffect, useState } from 'react'

type Priority = 'low' | 'medium' | 'high';
type Status = 'open' | 'in-progress' | 'resolved' | 'closed';

//Ticket Typeguard 
interface Ticket {
  id: string,
  subject: string,
  description: string,
  priority: Priority,
  status: Status,
  userId: string | null,
  userEmail: string | null,
  userName: string,
  createdAt: { seconds: number } | null,
};

const ITDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [search, setSearch] = useState('');

  //Retrieve Ticket Data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tickets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[]

      setTickets(data);
      setLoading(false);
    })

    return () => unsubscribe()
  }, []);

  //Stat Cards Data
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    highPriority: tickets.filter(t => t.priority === 'high').length 
  }

  //Status Labels
  const statusConfig = {
    open: { label: 'Open' },
    'in-progress': { label: 'In Progress' },
    resolved: { label: 'Resolved' },
    closed: { label: 'Closed' },
  };

  //Filter Logic
  const filteredTickets = tickets.filter(ticket => {
    //Status Filter
    const statusMatch = 
      statusFilter === 'all' || ticket.status === statusFilter;

    //Priority Filter
    const priorityMatch = 
      priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    //Search (Subject|Dsc|Name)
    const searchMatch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      ticket.userName?.toLowerCase().includes(search.toLowerCase());
    
    return statusMatch && priorityMatch && searchMatch;
  })

  // Sort (Newest)
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  });

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-800 to-gray-700 p-8'>

      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='bg-black/30 rounded-xl p-2'>
          <Columns3Cog  className='text-gray-400 w-7 h-7'/>
        </div>
        <div>
          <p className='text-xs font-semibold tracking-widest text-gray-900 uppercase'>IT Support</p>
          <h1 className='text-2xl font-bold text-white tracking-tight'>Ticket Dashboard</h1>
        </div>
      </div>

      {/* Stats */}
      <div className='flex mb-5'>
        {loading ? (
          <p className='text-gray-400'>Loading stats...</p>
        ) : (
          <StatGrid stats={stats}/>
        )}
      </div>

      {/* Filters */}
      <div>
        <div className='flex justify-center gap-2 mb-3'>
          {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase border transition-all duration-200 cursor-pointer
                ${statusFilter === f
                  ? 'bg-slate-500/30 border-slate-400 text-slate-200'
                  : 'bg-white/[0.07] border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
            >
              {f === 'all' ? 'All' : statusConfig[f as Status]?.label ?? f}
            </button>
          ))}
        </div>

        <div className='flex flex-col items-center'>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as Priority | 'all')}
            className='bg-white/[0.07] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3 cursor-pointer outline-none' 
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div>
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search tickets...'
              className='ml-auto bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none shadow-2xl w-100' 
            />
          </div>
        </div>
      </div>

      {/* Ticket Grid */}

    </div>
  )
}

export default ITDashboard