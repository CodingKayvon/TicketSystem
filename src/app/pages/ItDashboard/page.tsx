'use client'

import StatGrid from '@/app/components/StatGrid/page';
import { db } from '@/app/util/firebase-client';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
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

  //Filters
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
  };

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

   const priorityConfig = {
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
  });

  // Sort (Newest)
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  });

  //Helper Functions
   const initials = (name: string) => {
    if(!name) return 'NA';

    return name
      .split('')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  };

  const timeAgo = (seconds: number) => {
    const now = Date.now();
    const diff = now - seconds * 1000;

    const minutes = Math.floor(diff/60000);
    const hours = Math.floor(diff/3600000);
    const days = Math.floor(diff/86400000);

    if(days > 0) return `${days}d ago`;
    if(hours > 0) return `${hours}h ago`;
    if(minutes > 0) return `${minutes}m ago`;

    return 'Just now';
  };

  //Actions
  const cycleStatus = async (ticket: Ticket) => {
    const flow: Status[] = ['open', 'in-progress', 'resolved', 'closed'];

    const currentIndex = flow.indexOf(ticket.status);
    const nextStatus = flow[(currentIndex + 1) % flow.length];

    try {
      await updateDoc(doc(db, 'tickets', ticket.id), {
        status: nextStatus,
      })
    } catch (err) {
      console.error("ERROR UPDATING STATUS: ", err);
    }
  }

  //Resolved
  const markResolved = async (tickets: Ticket) => {
    try {
      await updateDoc(doc(db, 'tickets', tickets.id), {
        status: 'resolved',
      })
    } catch (err) {
      console.error("ERROR MARKING RESOLVED", err);
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-950 to-slate-800/50 p-8'>

      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='bg-linear-to-br from-gray-600 to-gray-300 rounded-xl p-2'>
          <Columns3Cog  className='text-black w-7 h-7'/>
        </div>
        <div>
          <p className='text-xs font-semibold tracking-widest text-gray-500 uppercase'>IT Support</p>
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
              className='ml-auto bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/80 shadow-2xl w-100' 
            />
          </div>
        </div>
      </div>

      {/* Ticket Count */}
      <div className='flex justify-center mt-3 mb-3'>
        <p className='text-xs text-gray-400 mb-3'>
          Showing {sortedTickets.length} of {tickets.length} tickets
        </p>
      </div>

      {/* Ticket Grid */}
      {sortedTickets.length === 0 ? (
        <p className='text-center text-gray-500 py-16'>
          No tickets match your filters.
        </p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {sortedTickets.map(ticket => {
            const pConf = priorityConfig[ticket.priority];
            const sConf = statusConfig[ticket.status];

            return (
              <div
                key={ticket.id}
                className='bg-gray-600 border border-black/50 rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-transform duration-200'
              >
                {/* Top */}
                <div className='px-5 pt-4 pb-3 border-b border-black/20'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs text-gray-400 uppercase'>
                      {ticket.id.slice(0,6)}
                    </span>

                    <span className={`text-xs px-2.5 py-1 rounded-md ${sConf.class}`}>
                      {sConf.label}
                    </span>
                  </div>

                  <p className='text-xs font-semibold text-gray-100'>
                    {ticket.subject}
                  </p>

                  <p className='text-xs text-gray-400 line-clamp-2'>
                    {ticket.description}
                  </p>
                </div>

                {/* Bottom */}
                <div className='px-5 py-3 flex justify-between'>
                  <span className={`flex items-center capitalize gap-2 ${pConf.text}`}>
                    <span className={`w-2 h-2 rounded-full ${pConf.dot}`} />
                      {ticket.priority}
                  </span>

                  <div className='flex items-end gap-2'>
                    <div className='flex items-center text-[9px]'>
                      {initials(ticket.userName)}
                    </div>

                    <div className='flex text-[12px]'>
                      -
                    </div> 

                    {ticket.createdAt && (
                      <span className='text-[10px] text-white/70'>
                        {timeAgo(ticket.createdAt.seconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='px-5 pb-4 flex gap-2'>
                  <button
                    onClick={() => cycleStatus(ticket)}
                    className='flex-1 py-1.5 bg-black/20 text-xs text-gray-400 rounded-lg cursor-pointer'
                  >
                    Change Status
                  </button>

                  <button
                    onClick={() => markResolved(ticket)}
                    className='flex-1 py-1.5 bg-emerald-500/20 text-xs text-emerald-300 rounded-lg cursor-pointer'
                  >
                    Resolve
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ITDashboard