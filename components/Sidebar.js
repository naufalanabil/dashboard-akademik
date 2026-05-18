'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react' // Tetap lengkap & ditambah FileSpreadsheet untuk Transkrip
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation' // Ditambahkan usePathname untuk deteksi halaman aktif

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname() // Ambil path URL aktif (misal: '/login', '/dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Efek untuk menangani sinkronisasi pergeseran konten utama di sebelah kanan
  useEffect(() => {
    setMounted(true)

    // Jika user sedang berada di halaman login, bersihkan padding body
    if (pathname === '/login') {
      document.body.style.paddingLeft = '0px'
      return
    }

    // Mengubah padding-left body secara dinamis sesuai state collapse sidebar
    if (isCollapsed) {
      document.body.style.paddingLeft = '80px'
    } else {
      document.body.style.paddingLeft = '250px'
    }

    // Berikan efek transisi halus (0.3 detik) agar konten kanan bergeser mulus
    document.body.style.transition = 'padding-left 0.3s ease'

    // Clean up style saat komponen dilepas atau rute berpindah
    return () => {
      document.body.style.paddingLeft = '0px'
    }
  }, [isCollapsed, pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // JIKA SEDANG DI HALAMAN LOGIN: Sidebar tidak akan dirender agar form login otomatis ke tengah layar
  if (pathname === '/login') {
    return null
  }

  // Jika belum mounted (masih di server/proses SSR), kembalikan layout dasar statis
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
      className={`h-screen bg-blue-700 text-white p-6 fixed top-0 left-0 z-50 transition-all duration-300 ${
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
        {/* Menu Dashboard */}
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

        {/* Menu Mahasiswa */}
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

        {/* MENU BARU: Transkrip Nilai (Sesuai Request Anda) */}
        <Link 
          href="/transkrip" 
          className={`flex items-center gap-3 hover:bg-blue-600 p-3 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Transkrip Nilai"
        >
          <FileSpreadsheet />
          {!isCollapsed && <span>Transkrip Nilai</span>}
        </Link>

        {/* Tombol Logout */}
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