'use client'

import React from 'react'
import { TicketCheck } from 'lucide-react';
import { TicketPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RoleCard from '@/app/components/RoleCard/page';


const RoleSelection = () => {
  const router = useRouter();
  
  const roles = [
    {
      id: 1,
      tag: "Technical",
      icon: <TicketCheck className='text-sm'/>,
      role: "IT Team",
      dsc: "Manage tickets, assign tickets, and monitor system status.",
      btn: "IT Dashboard"
    },
    {
      id: 2,
      tag: "General",
      icon: <TicketPlus className='text-sm'/>,
      role: "Non-IT Team",
      dsc: "Submit tickets, view updates, and track progress.",
      btn: "User Dashboard"
    },
  ];

  const handleClick = (role: string) => {
    //Selected Card 1
    if(role === "IT Team"){
      console.log("Routing to IT Dashboard!")
      router.push("/pages/ItDashboard")
    }

    //Selected Card 2
    if(role === "Non-IT Team"){
      console.log("Routing to User Dashboard!")
      router.push("/pages/UserDashboard")
    }
  }

  return (
    <div className='min-h-screen bg-[#060a12] overflow-hidden'>
      {/* Header */}
      <h1 className='flex justify-center text-l mt-25 mb-24'>Select your role to continue.</h1>

      {/* Card(s) Wrapper */}
      <div className='flex flex-col gap-10 items-center'>
        {/* Card 1 */}
        <div className='flex flex-col gap-5'>
          {roles.map((cards) => (
            <RoleCard
            key={cards.id}
            {...cards}
            onClick={() => handleClick(cards.role)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection