'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MahasiswaPage() {
  const [mounted, setMounted] = useState(false)
  const [mahasiswaList, setMahasiswaList] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  
  const [formData, setFormData] = useState({
    nama: '',
    npm: '',
    fakultas: 'Teknologi Industri',
    jurusan: 'Teknik Informatika',
    kelas: '',
    semester: 1,
    status: 'Aktif',
    gender: 'Laki-laki',
    ipk: 0.00
  })

  useEffect(() => {
    setMounted(true)
    fetchMahasiswa()
  }, [])

  // 1. READ: Ambil data dari Supabase
  const fetchMahasiswa = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mahasiswa')
        .select('*')
        .order('id', { ascending: true })

      if (!error && data) {
        setMahasiswaList(data)
      }
    } catch (error) {
      console.error('Gagal mengambil data mahasiswa:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle Input Form
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'semester' || name === 'ipk' ? Number(value) : value
    })
  }

  // Buka Modal Tambah
  const openAddModal = () => {
    setIsEditing(false)
    setCurrentId(null)
    setFormData({
      nama: '',
      npm: '',
      fakultas: 'Teknologi Industri',
      jurusan: 'Teknik Informatika',
      kelas: '',
      semester: 1,
      status: 'Aktif',
      gender: 'Laki-laki',
      ipk: 0.00
    })
    setIsModalOpen(true)
  }

  // Buka Modal Edit
  const openEditModal = (item) => {
    setIsEditing(true)
    setCurrentId(item.id)
    setFormData({
      nama: item.nama || '',
      npm: item.npm || '',
      fakultas: item.fakultas || 'Teknologi Industri',
      jurusan: item.jurusan || 'Teknik Informatika',
      kelas: item.kelas || '',
      semester: item.semester || 1,
      status: item.status || 'Aktif',
      gender: item.gender || 'Laki-laki',
      ipk: item.ipk || 0.00
    })
    setIsModalOpen(true)
  }

  // 2. CREATE & UPDATE: Simpan ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        // Logika UPDATE
        const { error } = await supabase
          .from('mahasiswa')
          .update(formData)
          .eq('id', currentId)
        
        if (error) throw error
      } else {
        // Logika CREATE
        const { error } = await supabase
          .from('mahasiswa')
          .insert([formData])
        
        if (error) throw error
      }
      
      setIsModalOpen(false)
      fetchMahasiswa() // Refresh data
    } catch (error) {
      alert('Gagal menyimpan data: ' + error.message)
    }
  }

  // 3. DELETE: Hapus data dari Supabase
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mahasiswa ini? Data transkrip terkait mungkin akan ikut terpengaruh.')) {
      try {
        const { error } = await supabase
          .from('mahasiswa')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        fetchMahasiswa() // Refresh data
      } catch (error) {
        alert('Gagal menghapus data: ' + error.message)
      }
    }
  }

  if (!mounted || loading) return <div className="p-10 text-center font-bold text-slate-500">Memuat Manajer Data Mahasiswa...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10 w-full space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Master Data Mahasiswa</h1>
          <p className="text-slate-500 mt-1">Kelola data profil induk dan status akademik mahasiswa universitas.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm"
        >
          <span>➕</span> Tambah Mahasiswa Baru
        </button>
      </div>

      {/* TABLE DATA INDUK */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">NPM</th>
                <th className="p-4">Fakultas / Jurusan</th>
                <th className="p-4 text-center">Kelas</th>
                <th className="p-4 text-center">Sem</th>
                <th className="p-4 text-center">Gender</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mahasiswaList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400 font-medium">Belum ada data mahasiswa di database.</td>
                </tr>
              ) : (
                mahasiswaList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{item.nama}</td>
                    <td className="p-4 font-mono text-slate-500 text-xs">{item.npm}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700 text-xs">{item.fakultas}</p>
                      <p className="text-[11px] text-slate-400">{item.jurusan}</p>
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600 text-xs">{item.kelas || '-'}</td>
                    <td className="p-4 text-center text-slate-600 font-semibold">{item.semester}</td>
                    <td className="p-4 text-center text-xs text-slate-500 font-medium">{item.gender}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm ${
                        item.status === 'Aktif' ? 'bg-green-500' :
                        item.status === 'Lulus' ? 'bg-blue-500' :
                        item.status === 'Cuti' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded-xl text-xs font-bold transition-colors"
                          title="Edit Profil"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl text-xs font-bold transition-colors"
                          title="Hapus Mahasiswa"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DIALOG (FORM TAMBAH / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div>
              <h3 className="text-xl font-black text-slate-800">
                {isEditing ? '✏️ Edit Data Mahasiswa' : '➕ Tambah Mahasiswa Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Isi data identitas akademik mahasiswa secara lengkap.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Contoh: Naufal Ardra Anabil"
                  required
                />
              </div>

              {/* NPM & Kelas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NPM</label>
                  <input
                    type="text"
                    name="npm"
                    value={formData.npm}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="51422215"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</label>
                  <input
                    type="text"
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="4IA14"
                    required
                  />
                </div>
              </div>

              {/* Fakultas & Jurusan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fakultas</label>
                <input
                  type="text"
                  name="fakultas"
                  value={formData.fakultas}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Teknologi Industri"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jurusan</label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="Teknik Informatika"
                />
              </div>

              {/* Semester & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    min="1"
                    max="14"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Status & Base IPK Default */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IPK Awal (Default)</label>
                  <input
                    type="number"
                    name="ipk"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.ipk}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-bold text-blue-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* BUTTONS ACTION */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}