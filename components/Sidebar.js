'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Sidebar() {

  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-[250px] h-screen bg-blue-700 text-white p-6 fixed">

      <h1 className="text-2xl font-bold mb-10">
        Akademik App
      </h1>

      <div className="flex flex-col gap-5">

        <Link href="/dashboard" className="flex items-center gap-3 hover:bg-blue-600 p-3 rounded-xl">
          <LayoutDashboard />
          Dashboard
        </Link>

        <Link href="/mahasiswa" className="flex items-center gap-3 hover:bg-blue-600 p-3 rounded-xl">
          <Users />
          Mahasiswa
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 hover:bg-red-500 p-3 rounded-xl text-left"
        >
          <LogOut />
          Logout
        </button>
      </div>
    </div>
  )
}