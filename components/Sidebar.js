'use client'

import { useState, useEffect } from 'react' // Ditambahkan useEffect untuk handle hydration
import Link from 'next/link'
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false) // State penanda komponen sudah masuk client side

  // Memastikan komponen dirender di client dulu untuk menghindari mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Jika belum mounted (masih di server), kembalikan layout dasar yang statis
  if (!mounted) {
    return (
      <div className="w-[250px] h-screen bg-blue-700 text-white p-6 fixed z-50">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">Akademik App</h1>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`h-screen bg-blue-700 text-white p-6 fixed z-50 transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[250px]'
      }`}
    >
      {/* HEADER SIDEBAR */}
      <div className="flex items-center justify-between mb-10">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold whitespace-nowrap">
            Akademik App
          </h1>
        )}
        
        {/* Tombol Panah Buka/Tutup */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hover:bg-blue-600 p-1.5 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* MENU ITEMS */}
      <div className="flex flex-col gap-5">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 hover:bg-blue-600 p-3 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Dashboard"
        >
          <LayoutDashboard />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link 
          href="/mahasiswa" 
          className={`flex items-center gap-3 hover:bg-blue-600 p-3 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Mahasiswa"
        >
          <Users />
          {!isCollapsed && <span>Mahasiswa</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 hover:bg-red-500 p-3 rounded-xl text-left transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}