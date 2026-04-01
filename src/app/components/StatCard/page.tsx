import React from 'react'

type StatCardProps = {
  label: string
  value: number
  sub?: string
  color?: string
}

const StatCard = ({ label, value, sub, color = 'text-white' }: StatCardProps) => {
  return (
    <div className='bg-linear-to-br from-gray-700 to-gray-900 border border-white/50 rounded-xl shadow-2xl px-5 py-4'>
      <p className='text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1'>
        {label}
      </p>

      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>

      {sub && (
        <p className='text-xs text-gray-500 mt-1'>
          {sub}
        </p>
      )}
    </div>
  )
}

export default StatCard