'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Memakai client supabase kamu
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // Perubahan impor di sini

export default function TranskripPage() {
  const [mounted, setMounted] = useState(false)
  const [mahasiswa, setMahasiswa] = useState(null)
  const [dataMatkul, setDataMatkul] = useState([])
  const [loading, setLoading] = useState(true)

  // State untuk Handle Form CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    semester: 1,
    kode_matkul: '',
    nama_matkul: '',
    sks: 2,
    nilai: 'A'
  })

  // ID Mahasiswa yang ditampilkan (Naufal)
  const TARGET_MAHASISWA_ID = 14 

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  // ================= READ DATA DARI SUPABASE =================
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Ambil Data Profil Mahasiswa
      const { data: dataMhs } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('id', TARGET_MAHASISWA_ID)
        .single()
      
      setMahasiswa(dataMhs)

      // 2. Ambil Data Nilai Transkrip Matkul
      const { data: dataTranskrip } = await supabase
        .from('transkrip')
        .select('*')
        .eq('mahasiswa_id', TARGET_MAHASISWA_ID)
        .order('semester', { ascending: true })

      setDataMatkul(dataTranskrip || [])
    } catch (error) {
      console.error('Gagal mengambil data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ================= LOGIKA HITUNG BOBOT MUTU & WARNA =================
  const getBobot = (nilai) => {
    if (nilai === 'A') return 4
    if (nilai === 'B') return 3
    if (nilai === 'C') return 2
    if (nilai === 'D') return 1
    return 0
  }

  const getBadgeStyle = (nilai) => {
    if (nilai === 'C') return 'bg-yellow-500 text-white font-bold px-3 py-1 rounded-md'
    if (nilai === 'D') return 'bg-orange-500 text-white font-bold px-3 py-1 rounded-md'
    if (nilai === 'E') return 'bg-amber-800 text-white font-bold px-3 py-1 rounded-md'
    return 'font-bold text-slate-800'
  }

  // Perhitungan Akumulasi Otomatis
  let totalSksLulus = 0
  let totalSksGagal = 0
  let mutuTotal = 0

  dataMatkul.forEach((m) => {
    const bobot = getBobot(m.nilai)
    mutuTotal += m.sks * bobot
    if (m.nilai === 'E') totalSksGagal += m.sks
    else totalSksLulus += m.sks
  })

  const totalSksKRS = totalSksLulus + totalSksGagal
  const ipkTotal = totalSksKRS > 0 ? (mutuTotal / totalSksKRS).toFixed(2) : '0.00'

  // Hitung Tren IPK per Semester untuk Grafik Batang
  const ipkPerSemester = []
  for (let i = 1; i <= 8; i++) {
    const matkulSem = dataMatkul.filter((m) => m.semester === i)
    let sksSem = 0
    let mutuSem = 0
    matkulSem.forEach((m) => {
      sksSem += m.sks
      mutuSem += m.sks * getBobot(m.nilai)
    })
    const ipkSem = sksSem > 0 ? (mutuSem / sksSem).toFixed(2) : '0.00'
    ipkPerSemester.push({ semester: i, ipk: ipkSem })
  }

  // ================= FUNGSI CETAK PDF DENGAN DATA DYNAMIC SUPABASE =================
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Judul PDF
    doc.setFontSize(18)
    doc.text('TRANSKRIP NILAI AKADEMIK MAHASISWA', 14, 20)
    
    // Informasi Biodata (Dynamic)
    doc.setFontSize(10)
    doc.text(`Nama: ${mahasiswa?.nama || '-'}`, 14, 28)
    doc.text(`NPM: ${mahasiswa?.npm || '-'}`, 14, 34)
    doc.text(`Fakultas: ${mahasiswa?.fakultas || '-'} / ${mahasiswa?.jurusan || '-'}`, 14, 40)
    
    // Sub-info Ringkasan Nilai
    doc.text(`Total IPK Kumulatif: ${ipkTotal}`, 120, 28)
    doc.text(`Total SKS Lulus: ${totalSksLulus} SKS`, 120, 34)
    doc.text(`Total Mutu Prestasi: ${mutuTotal}`, 120, 40)

    // Menyusun baris tabel dari state dataMatkul Supabase
    const tableRows = []
    dataMatkul.forEach((m) => {
      const bobot = getBobot(m.nilai)
      const mutu = m.sks * bobot
      tableRows.push([
        `Semester ${m.semester}`,
        m.kode_matkul,
        m.nama_matkul,
        m.sks.toString(),
        m.nilai,
        `${m.sks} x ${bobot} = ${mutu}`
      ])
    })

    // Perubahan pemanggilan autoTable di sini (bukan doc.autoTable lagi)
    autoTable(doc, {
      startY: 48,
      head: [['Semester', 'Kode', 'Mata Kuliah', 'SKS', 'Nilai', 'Mutu']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216] }, // Warna Biru tema akademik
    })

    // Download otomatis file PDF
    doc.save(`Transkrip_Nilai_${mahasiswa?.npm || 'Akademik'}.pdf`)
  }

  // ================= PROSES CRUD (CREATE, UPDATE, DELETE) =================
  const handleOpenAddModal = () => {
    setEditId(null)
    setFormData({ semester: 1, kode_matkul: '', nama_matkul: '', sks: 2, nilai: 'A' })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (matkul) => {
    setEditId(matkul.id)
    setFormData({
      semester: matkul.semester,
      kode_matkul: matkul.kode_matkul,
      nama_matkul: matkul.nama_matkul,
      sks: matkul.sks,
      nilai: matkul.nilai
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Jaga-jaga jika input kosong atau bernilai 0 saat disubmit manual
    const finalData = {
      ...formData,
      semester: !formData.semester || formData.semester < 1 ? 1 : formData.semester,
      sks: !formData.sks || formData.sks < 1 ? 2 : formData.sks
    }

    if (editId) {
      // PROSES UPDATE
      await supabase
        .from('transkrip')
        .update(finalData)
        .eq('id', editId)
    } else {
      // PROSES CREATE
      await supabase
        .from('transkrip')
        .insert([{ ...finalData, mahasiswa_id: TARGET_MAHASISWA_ID }])
    }
    setIsModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus mata kuliah ini?')) {
      await supabase.from('transkrip').delete().eq('id', id)
      fetchData()
    }
  }

  if (!mounted || loading) return <div className="p-10 text-center font-bold text-slate-500">Memuat Data Akademik Supabase...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 w-full transition-all duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* DATA PROFIL MAHASISWA DARI SUPABASE */}
        {mahasiswa && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-xs opacity-75">Nama Mahasiswa</p><p className="text-base font-bold">{mahasiswa.nama}</p></div>
            <div><p className="text-xs opacity-75">NPM</p><p className="text-base font-mono font-bold">{mahasiswa.npm}</p></div>
            <div><p className="text-xs opacity-75">Fakultas / Jurusan</p><p className="text-sm font-bold">{mahasiswa.fakultas} / {mahasiswa.jurusan}</p></div>
            <div><p className="text-xs opacity-75">Kelas / Angkatan</p><p className="text-base font-bold">{mahasiswa.kelas} / {mahasiswa.angkatan}</p></div>
          </div>
        )}

        {/* HEADER HALAMAN & TOMBOL AKSI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">KRS & Transkrip Nilai</h1>
            <p className="text-xs text-slate-500 mt-1">Kelola komponen nilai akademik secara realtime terintegrasi database</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              Cetak PDF
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              + Tambah Matkul Baru
            </button>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-400 font-bold uppercase">IPK Total</p><p className="text-2xl font-black text-blue-600">{ipkTotal}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-400 font-bold uppercase">SKS Lulus</p><p className="text-2xl font-black text-green-600">{totalSksLulus}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-400 font-bold uppercase">SKS Gagal</p><p className="text-2xl font-black text-red-500">{totalSksGagal}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-400 font-bold uppercase">Total Mutu</p><p className="text-2xl font-black text-indigo-600">{mutuTotal}</p></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 md:col-span-1"><p className="text-xs text-slate-400 font-bold uppercase">SKS Kontrak</p><p className="text-2xl font-black text-slate-700">{totalSksKRS}</p></div>
        </div>

        {/* GRAFIK NAIK TURUN IPK PER SEMESTER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-slate-800 mb-6">Grafik Tren Naik-Turun IPK Per Semester</h2>
          <div className="flex justify-between items-end h-48 pt-6 px-4 bg-slate-50/50 rounded-xl border border-slate-100">
            {ipkPerSemester.map((item) => (
              <div key={item.semester} className="flex flex-col items-center flex-1 group">
                <span className="text-xs font-bold text-blue-600 mb-2 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                  {item.ipk}
                </span>
                <div 
                  style={{ height: `${(parseFloat(item.ipk) / 4) * 120}px` }}
                  className="w-7 md:w-10 bg-blue-600 rounded-t-lg hover:bg-blue-500 transition-all duration-300 shadow-sm"
                />
                <span className="text-xs font-semibold text-slate-500 mt-2">Smt {item.semester}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TABEL DATA TRANSKRIP DENGAN FITUR EDIT & HAPUS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-200">
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Mata Kuliah</th>
                <th className="px-6 py-3 text-center">SKS</th>
                <th className="px-6 py-3 text-center">Nilai</th>
                <th className="px-6 py-3 text-center">Mutu</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {dataMatkul.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-bold text-blue-600">Semester {m.semester}</td>
                  <td className="px-6 py-3 text-xs text-slate-400 font-mono">{m.kode_matkul}</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{m.nama_matkul}</td>
                  <td className="px-6 py-3 text-center font-bold">{m.sks}</td>
                  <td className="px-6 py-3 text-center"><span className={getBadgeStyle(m.nilai)}>{m.nilai}</span></td>
                  <td className="px-6 py-3 text-center font-mono font-bold text-indigo-600">{m.sks * getBobot(m.nilai)}</td>
                  <td className="px-6 py-3 text-center space-x-2">
                    <button onClick={() => handleOpenEditModal(m)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 font-bold text-xs hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL POP-UP UNTUK CRUD (TAMBAH / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-800">{editId ? 'Edit Nilai Mata Kuliah' : 'Tambah Mata Kuliah Baru'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              
              <div>
                <label className="text-xs font-bold text-slate-500">Semester</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-full p-2 border rounded-xl" 
                  value={formData.semester || ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setFormData({...formData, semester: ''});
                    } else {
                      const num = parseInt(val);
                      if (num >= 1 && num <= 8) setFormData({...formData, semester: num});
                    }
                  }} 
                  required 
                />
              </div>

              <div><label className="text-xs font-bold text-slate-500">Kode Matkul</label><input type="text" className="w-full p-2 border rounded-xl uppercase" value={formData.kode_matkul} onChange={(e) => setFormData({...formData, kode_matkul: e.target.value})} required /></div>
              <div><label className="text-xs font-bold text-slate-500">Nama Mata Kuliah</label><input type="text" className="w-full p-2 border rounded-xl" value={formData.nama_matkul} onChange={(e) => setFormData({...formData, nama_matkul: e.target.value})} required /></div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">SKS</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    className="w-full p-2 border rounded-xl" 
                    value={formData.sks || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormData({...formData, sks: ''});
                      } else {
                        const num = parseInt(val);
                        if (num >= 1 && num <= 6) setFormData({...formData, sks: num});
                      }
                    }} 
                    required 
                  />
                </div>
                <div><label className="text-xs font-bold text-slate-500">Nilai Huruf</label><select className="w-full p-2 border rounded-xl" value={formData.nilai} onChange={(e) => setFormData({...formData, nilai: e.target.value})}><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option></select></div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}