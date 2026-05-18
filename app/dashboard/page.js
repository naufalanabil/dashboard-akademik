'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [mahasiswa, setMahasiswa] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [myStats, setMyStats] = useState({ ipk: '0.00', sksLulus: 0, totalMatkul: 0 })
  const [loading, setLoading] = useState(true)

  const TARGET_MAHASISWA_ID = 14 // ID Naufal

  useEffect(() => {
    setMounted(true)
    fetchDashboardContent()
  }, [])

  const fetchDashboardContent = async () => {
    setLoading(true)
    try {
      // 1. AMBIL DATA GLOBAL MAHASISWA & INJECT RANKING MANUAL
      const { data: globalData, error: globalError } = await supabase
        .from('mahasiswa')
        .select('*')
        .order('ipk', { ascending: false })

      let finalMahasiswaList = []
      if (!globalError && globalData) {
        const rankingManual = [
          { id: 1001, nama: 'Budi Santoso', npm: '51423991', fakultas: 'Teknologi Industri', jurusan: 'Teknik Informatika', kelas: '4IA99', semester: 8, status: 'Lulus', gender: 'Laki-laki', ipk: 3.86, nilai_a: 32, nilai_b: 6, nilai_c: 1, nilai_d: 0, nilai_e: 0 },
          { id: 1002, nama: 'Siti Aminah', npm: '31123882', fakultas: 'Ilmu Komputer', jurusan: 'Sistem Informasi', kelas: '4KA98', semester: 8, status: 'Lulus', gender: 'Perempuan', ipk: 3.84, nilai_a: 30, nilai_b: 8, nilai_c: 2, nilai_d: 0, nilai_e: 0 },
          { id: 1003, nama: 'Rian Hidayat', npm: '51422773', fakultas: 'Teknologi Industri', jurusan: 'Teknik Informatika', kelas: '4IA97', semester: 8, status: 'Lulus', gender: 'Laki-laki', ipk: 3.84, nilai_a: 31, nilai_b: 7, nilai_c: 1, nilai_d: 0, nilai_e: 0 },
          { id: 1004, nama: 'Dewi Lestari', npm: '51422664', fakultas: 'Teknologi Industri', jurusan: 'Teknik Informatika', kelas: '4IA96', semester: 8, status: 'Lulus', gender: 'Perempuan', ipk: 3.83, nilai_a: 30, nilai_b: 7, nilai_c: 2, nilai_d: 0, nilai_e: 0 },
          { id: 1005, nama: 'Eko Prasetyo', npm: '51422555', fakultas: 'Teknologi Industri', jurusan: 'Teknik Informatika', kelas: '4IA95', semester: 8, status: 'Lulus', gender: 'Laki-laki', ipk: 3.40, nilai_a: 24, nilai_b: 10, nilai_c: 5, nilai_d: 0, nilai_e: 0 },
        ]
        finalMahasiswaList = [...rankingManual, ...globalData]
        setMahasiswa(finalMahasiswaList)
      }

      // 2. AMBIL DATA PROFIL PRIBADI MAHASISWA ID 14
      const { data: dataMhs } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('id', TARGET_MAHASISWA_ID)
        .single()
      
      if (dataMhs) {
        setMyProfile(dataMhs)
      }

      // 3. AMBIL DATA TRANSKRIP UNTUK MENGHITUNG IPK REALTIME ID 14
      const { data: dataTranskrip } = await supabase
        .from('transkrip')
        .select('*')
        .eq('mahasiswa_id', TARGET_MAHASISWA_ID)

      if (dataTranskrip && dataTranskrip.length > 0) {
        let totalSksLulus = 0
        let mutuTotal = 0

        dataTranskrip.forEach((m) => {
          let bobot = 0
          if (m.nilai === 'A') bobot = 4
          if (m.nilai === 'B') bobot = 3
          if (m.nilai === 'C') bobot = 2
          if (m.nilai === 'D') bobot = 1
          
          mutuTotal += m.sks * bobot
          if (m.nilai !== 'E') totalSksLulus += m.sks
        })

        const totalSks = dataTranskrip.reduce((acc, curr) => acc + curr.sks, 0)
        const ipkCalc = totalSks > 0 ? (mutuTotal / totalSks).toFixed(2) : '0.00'

        setMyStats({
          ipk: ipkCalc,
          sksLulus: totalSksLulus,
          totalMatkul: dataTranskrip.length
        })

        // Opsional: Perbarui info IPK personal kamu di dalam list global mahasiswa jika ada
        if (dataMhs) {
          const updatedList = finalMahasiswaList.map(item => 
            item.id === TARGET_MAHASISWA_ID ? { ...item, ipk: parseFloat(ipkCalc) } : item
          )
          setMahasiswa(updatedList)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return <div className="p-10 text-center font-bold text-slate-500">Memuat Sistem Dashboard Akademik...</div>
  }

  // ==========================================
  // LOGIKAKALKULASI STATISTIK GLOBAL KAMPUS
  // ==========================================
  const totalMahasiswa = mahasiswa.length
  const mahasiswaAktif = mahasiswa.filter(item => item.status === 'Aktif').length
  const mahasiswaLulus = mahasiswa.filter(item => item.status === 'Lulus').length
  const mahasiswaCuti = mahasiswa.filter(item => item.status === 'Cuti').length
  const mahasiswaNonaktif = mahasiswa.filter(item => item.status === 'Nonaktif').length
  const mahasiswaLaki = mahasiswa.filter(item => item.gender === 'Laki-laki').length
  const mahasiswaPerempuan = mahasiswa.filter(item => item.gender === 'Perempuan').length

  const rataIpk = mahasiswa.length
    ? (mahasiswa.reduce((total, item) => total + Number(item.ipk || 0), 0) / mahasiswa.length).toFixed(2)
    : '0.00'

  // Hitung Rata-rata IPK per Semester (1-8)
  const semesterData = [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
    const dataSemester = mahasiswa.filter(item => Number(item.semester) === sem)
    return dataSemester.length
      ? (dataSemester.reduce((total, item) => total + Number(item.ipk || 0), 0) / dataSemester.length).toFixed(2)
      : 0
  })

  // Total Akumulasi Nilai Huruf Global
  const totalA = mahasiswa.reduce((total, item) => total + Number(item.nilai_a || 0), 0)
  const totalB = mahasiswa.reduce((total, item) => total + Number(item.nilai_b || 0), 0)
  const totalC = mahasiswa.reduce((total, item) => total + Number(item.nilai_c || 0), 0)
  const totalD = mahasiswa.reduce((total, item) => total + Number(item.nilai_d || 0), 0)
  const totalE = mahasiswa.reduce((total, item) => total + Number(item.nilai_e || 0), 0)

  // Ekstrak Fakultas Unique & Jumlah Mahasiswanya
  const fakultasLabels = [...new Set(mahasiswa.map(item => item.fakultas).filter(Boolean))]
  const fakultasData = fakultasLabels.map(fak => mahasiswa.filter(item => item.fakultas === fak).length)

  // Top 5 Ranking Mahasiswa
  const rankingMahasiswa = [...mahasiswa]
    .sort((a, b) => Number(b.ipk) - Number(a.ipk))
    .slice(0, 5)

  // ==========================================
  // CONFIGURATION DATA CHART.JS
  // ==========================================
  const barData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    datasets: [{ label: 'Rata-rata IPK', data: semesterData, backgroundColor: '#2563eb', borderRadius: 6 }],
  }

  const pieData = {
    labels: ['Nilai A', 'Nilai B', 'Nilai C', 'Nilai D', 'Nilai E'],
    datasets: [{ data: [totalA, totalB, totalC, totalD, totalE], backgroundColor: ['#22c55e', '#3b82f6', '#facc15', '#f97316', '#ef4444'] }],
  }

  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [{ data: [mahasiswaLaki, mahasiswaPerempuan], backgroundColor: ['#3b82f6', '#ec4899'] }],
  }

  const fakultasChartData = {
    labels: fakultasLabels,
    datasets: [{ label: 'Total Mahasiswa', data: fakultasData, backgroundColor: '#8b5cf6', borderRadius: 6 }],
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10 w-full space-y-10">
      
      {/* SECTION 1: HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard Akademik</h1>
          <p className="text-slate-500 mt-1">Sistem Terintegrasi Monitoring Data Mahasiswa & Transkrip</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Status Sistem</p>
            <p className="font-bold text-sm text-green-600">Online / Terhubung Supabase</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: PERSONAL SUMMARY PANEL MAHASISWA (ID 14) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Selamat Datang Kembali, {myProfile?.nama || 'Naufal Ardra Anabil'}! 👋
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Berikut rekapitulasi data Kartu Rencana Studi (KRS) personal kamu saat ini.
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-blue-100">
            NPM: {myProfile?.npm || '51422215'} | Kelas: {myProfile?.kelas || '4IA14'}
          </div>
        </div>

        {/* PERSONAL STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase opacity-80 tracking-wider">IPK Kumulatif Kamu</p>
            <p className="text-4xl font-black">{myStats.ipk}</p>
            <p className="text-xs opacity-70">Sinkronisasi otomatis dengan halaman transkrip</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total SKS Lulus</p>
            <p className="text-4xl font-black text-slate-800">{myStats.sksLulus} <span className="text-lg font-bold text-slate-400">SKS</span></p>
            <p className="text-xs text-green-600 font-medium">✓ Bebas dari nilai E</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Mata Kuliah Terkontrak</p>
            <p className="text-4xl font-black text-slate-800">{myStats.totalMatkul} <span className="text-lg font-bold text-slate-400">Matkul</span></p>
            <p className="text-xs text-slate-500">Terdaftar di database transkrip</p>
          </div>
        </div>

        {/* QUICK LINK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Link href="/transkrip" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group">
            <div>
              <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600">Update & CRUD Nilai Transkrip</p>
              <p className="text-xs text-slate-500">Kelola komponen nilai huruf matkul langsung ke Supabase</p>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition-transform">➡️</span>
          </Link>
          <Link href="/transkrip" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-green-50/50 border border-slate-200 hover:border-green-200 rounded-xl transition-all group">
            <div>
              <p className="font-bold text-sm text-slate-800 group-hover:text-green-600">Cetak Transkrip Resmi (PDF)</p>
              <p className="text-xs text-slate-500">Export seluruh lembar rekapitulasi nilai menjadi dokumen PDF</p>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition-transform">🖨️</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3: COUNTER WIDGET GLOBAL KAMPUS */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📊</span> Statistik Makro Mahasiswa Universitas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Mahasiswa', value: totalMahasiswa, color: 'text-blue-600' },
            { label: 'Rata-rata IPK', value: rataIpk, color: 'text-slate-700' },
            { label: 'Status Aktif', value: mahasiswaAktif, color: 'text-green-600' },
            { label: 'Status Lulus', value: mahasiswaLulus, color: 'text-indigo-600' },
            { label: 'Status Cuti', value: mahasiswaCuti, color: 'text-yellow-600' },
            { label: 'Status Nonaktif', value: mahasiswaNonaktif, color: 'text-red-600' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">{card.label}</p>
              <p className={`text-3xl mt-2 font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: DIAGRAM / GRAPHICS CHART.JS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Grafik Perkembangan Rata-rata IPK Semesta</h4>
          <div className="h-64 flex items-center justify-center">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Statistik Sebaran Mahasiswa per Fakultas</h4>
          <div className="h-64 flex items-center justify-center">
            <Bar data={fakultasChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <h4 className="text-lg font-bold text-slate-800 mb-4 text-center">Proporsi Distribusi Nilai Mutu Huruf</h4>
          <div className="w-56 h-56 mx-auto">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <h4 className="text-lg font-bold text-slate-800 mb-4 text-center">Distribusi Gender Mahasiswa</h4>
          <div className="w-56 h-56 mx-auto">
            <Pie data={genderData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* SECTION 5: TOP 5 RANKING IPK MAHASISWA */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-xl font-bold text-slate-800">Ranking Prestasi Akademik</h4>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 Mahasiswa dengan perolehan IPK tertinggi</p>
          </div>
          <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-200">👑 Penghargaan Tinggi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {rankingMahasiswa.map((item, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="absolute -top-2 -right-2 text-6xl font-black text-slate-200/40 group-hover:text-slate-200/80 transition-colors pointer-events-none">{index + 1}</span>
              <div className="space-y-1 z-10">
                <p className="font-bold text-slate-800 line-clamp-1">{index + 1}. {item.nama}</p>
                <p className="text-xs text-slate-400 font-mono">{item.npm}</p>
                <p className="text-xs text-slate-500 font-medium mt-2">{item.kelas} • Sem {item.semester}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.jurusan}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200/60 flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score</span>
                <p className="font-black text-2xl text-blue-600 tracking-tight">{Number(item.ipk).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: DATA INDUK MAHASISWA (TABLE) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h4 className="text-xl font-bold text-slate-800">Daftar Ledger Mahasiswa Induk</h4>
            <p className="text-xs text-slate-400 mt-0.5">Seluruh rekaman data mahasiswa yang terdaftar di sistem</p>
          </div>
          <div className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
            Total Data: {totalMahasiswa} Entri
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-600 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">NPM</th>
                <th className="p-4">Fakultas / Jurusan</th>
                <th className="p-4 text-center">Kelas</th>
                <th className="p-4 text-center">Sem</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">IPK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mahasiswa.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{item.nama}</td>
                  <td className="p-4 font-mono text-slate-500 text-xs">{item.npm}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700 text-xs">{item.fakultas}</p>
                    <p className="text-[11px] text-slate-400">{item.jurusan}</p>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-600 text-xs">{item.kelas || '-'}</td>
                  <td className="p-4 text-center text-slate-600 font-medium">{item.semester || 8}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm ${
                      item.status === 'Aktif' ? 'bg-green-500' :
                      item.status === 'Lulus' ? 'bg-blue-500' :
                      item.status === 'Cuti' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {item.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-blue-600 text-base">{Number(item.ipk || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}