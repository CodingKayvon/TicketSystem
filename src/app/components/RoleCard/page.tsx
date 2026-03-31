import React from 'react'

const RoleCard = ({ id, tag, icon, role, dsc, btn, onClick }: any) => {
  return (
    <div className='flex flex-col bg-linear-to-br from-slate-700 to-slate-900 rounded-xl p-6 w-90 shadow-lg items-center space-y-4 border border-cyan-800 transform transition-transform duration-300 hover:scale-105'>
      <div
        className={`rounded-md px-2 py-1 ${
          id === 1
          ? "bg-linear-to-br from-cyan-950 to-cyan-900 text-cyan-400"
          : "bg-linear-to-br from-amber-950 to-amber-800 text-amber-500"
        }`}
      >
        {tag}
      </div>

      {icon}
      <h2 className='text-white font-semibold text-2xl'>{role}</h2>
      <p className='text-white text-xs text-center mb-5'>{dsc}</p>
      <button
        onClick={onClick}
        className={`text-white hover:shadow-2xl hover:scale-105 px-4 py-2 rounded-md transform transition-transform duration-300 cursor-pointer ${
          id === 1
          ? "bg-linear-to-br from-cyan-950 to-cyan-900 hover:from-cyan-900 hover:to-cyan-600"
          : "bg-linear-to-br from-amber-950 to-amber-800 hover:from-amber-900 hover:to-amber-600"
        }`}
      >
        {btn}
      </button>

    </div>
  )
}

export default RoleCard