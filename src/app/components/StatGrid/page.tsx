import React from 'react'
import StatCard from '../StatCard/page'

type Stats = {
  total: number
  open: number
  inProgress: number
  highPriority: number
}

const StatGrid = ({ stats }: { stats: Stats }) => {
  const statList = [
    {
      label: 'Total Tickets',
      value: stats.total,
      color: 'text-white',
      sub: 'All time',
    },
    {
      label: 'Open',
      value: stats.open,
      color: 'text-blue-300',
      sub: 'Awaiting assignment',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'text-amber-300',
      sub: 'Being worked on',
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      color: 'text-red-300',
      sub: 'Needs attention',
    },
  ];

  return (
    <div className='flex w-full justify-center gap-10'>
      {statList.map((stat) => (
        <StatCard key={stat.label} {...stat}/>
      ))}
    </div>
  )
}

export default StatGrid