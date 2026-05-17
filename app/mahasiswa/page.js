'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import Swal from 'sweetalert2'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function MahasiswaPage() {

  const [mahasiswa, setMahasiswa] = useState([])

  const [nama, setNama] = useState('')
  const [npm, setNpm] = useState('')

  const [fakultas, setFakultas] = useState('')
  const [jurusan, setJurusan] = useState('')

  const [kelas, setKelas] = useState('')
  const [angkatan, setAngkatan] = useState('')

  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('')

  const [semester, setSemester] = useState('')
  const [ipk, setIpk] = useState('')

  const [nilaiA, setNilaiA] = useState('')
  const [nilaiB, setNilaiB] = useState('')
  const [nilaiC, setNilaiC] = useState('')
  const [nilaiD, setNilaiD] = useState('')
  const [nilaiE, setNilaiE] = useState('')

  const [search, setSearch] = useState('')

  const [editId, setEditId] = useState(null)

  // =========================
  // GET DATA
  // =========================

  const getMahasiswa = async () => {

    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('ipk', { ascending: false })

    if (!error) {
      setMahasiswa(data)
    }
  }

  useEffect(() => {
    getMahasiswa()
  }, [])

  // =========================
  // RANKING
  // =========================

  const rankingMahasiswa = [...mahasiswa]
    .sort((a, b) => b.ipk - a.ipk)
    .slice(0, 5)

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setNama('')
    setNpm('')

    setFakultas('')
    setJurusan('')

    setKelas('')
    setAngkatan('')

    setGender('')
    setStatus('')

    setSemester('')
    setIpk('')

    setNilaiA('')
    setNilaiB('')
    setNilaiC('')
    setNilaiD('')
    setNilaiE('')

    setEditId(null)
  }

  // =========================
  // TAMBAH DATA
  // =========================

  const tambahMahasiswa = async () => {

    if (
      !nama ||
      !npm ||
      !fakultas ||
      !jurusan ||
      !kelas ||
      !angkatan ||
      !gender ||
      !status ||
      !semester ||
      !ipk
    ) {

      Swal.fire({
        title: 'Error',
        text: 'Semua field wajib diisi',
        icon: 'error',
      })

      return
    }

    const { error } = await supabase
      .from('mahasiswa')
      .insert([
        {
          nama,
          npm,
          fakultas,
          jurusan,
          kelas,
          angkatan,
          gender,
          status,
          semester,
          ipk,

          nilai_a: nilaiA,
          nilai_b: nilaiB,
          nilai_c: nilaiC,
          nilai_d: nilaiD,
          nilai_e: nilaiE,
        },
      ])

    if (!error) {

      Swal.fire({
        title: 'Berhasil',
        text: 'Data mahasiswa berhasil ditambahkan',
        icon: 'success',
      })

      getMahasiswa()
      resetForm()
    }
  }

  // =========================
  // EDIT
  // =========================

  const editMahasiswa = (item) => {

    setEditId(item.id)

    setNama(item.nama)
    setNpm(item.npm)

    setFakultas(item.fakultas)
    setJurusan(item.jurusan)

    setKelas(item.kelas)
    setAngkatan(item.angkatan)

    setGender(item.gender)
    setStatus(item.status)

    setSemester(item.semester)
    setIpk(item.ipk)

    setNilaiA(item.nilai_a)
    setNilaiB(item.nilai_b)
    setNilaiC(item.nilai_c)
    setNilaiD(item.nilai_d)
    setNilaiE(item.nilai_e)
  }

  // =========================
  // UPDATE
  // =========================

  const updateMahasiswa = async () => {

    const { error } = await supabase
      .from('mahasiswa')
      .update({
        nama,
        npm,
        fakultas,
        jurusan,
        kelas,
        angkatan,
        gender,
        status,
        semester,
        ipk,

        nilai_a: nilaiA,
        nilai_b: nilaiB,
        nilai_c: nilaiC,
        nilai_d: nilaiD,
        nilai_e: nilaiE,
      })

      .eq('id', editId)

    if (!error) {

      Swal.fire({
        title: 'Berhasil',
        text: 'Data berhasil diupdate',
        icon: 'success',
      })

      getMahasiswa()
      resetForm()
    }
  }

  // =========================
  // HAPUS
  // =========================

  const hapusMahasiswa = async (id) => {

    const confirm = await Swal.fire({
      title: 'Hapus Data?',
      text: 'Data mahasiswa akan dihapus',
      icon: 'warning',
      showCancelButton: true,
    })

    if (confirm.isConfirmed) {

      await supabase
        .from('mahasiswa')
        .delete()
        .eq('id', id)

      Swal.fire({
        title: 'Berhasil',
        text: 'Data berhasil dihapus',
        icon: 'success',
      })

      getMahasiswa()
    }
  }

  // =========================
  // EXPORT EXCEL
  // =========================

  const exportExcel = () => {

    const worksheet =
      XLSX.utils.json_to_sheet(mahasiswa)

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Mahasiswa'
    )

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })

    const data = new Blob([excelBuffer])

    saveAs(data, 'data-mahasiswa.xlsx')
  }

  // =========================
  // STATISTIK
  // =========================

  const totalMahasiswa = mahasiswa.length

  const totalAktif = mahasiswa.filter(
    (item) => item.status === 'Aktif'
  ).length

  const totalLulus = mahasiswa.filter(
    (item) => item.status === 'Lulus'
  ).length

  const totalCuti = mahasiswa.filter(
    (item) => item.status === 'Cuti'
  ).length

  const totalNonaktif = mahasiswa.filter(
    (item) => item.status === 'Nonaktif'
  ).length

  return (
    <div className="min-h-screen bg-slate-100 p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            Sistem Data Mahasiswa
          </h1>

          <p className="text-slate-500 mt-2">
            Monitoring Akademik Mahasiswa
          </p>

        </div>

        <button
          onClick={exportExcel}
          className="
            bg-green-600
            hover:bg-green-700
            text-white
            px-6
            py-3
            rounded-2xl
            font-semibold
          "
        >
          Export Excel
        </button>

      </div>

      {/* CARD */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-6 rounded-3xl shadow-lg">

          <p className="text-slate-500">
            Total Mahasiswa
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-3">
            {totalMahasiswa}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">

          <p className="text-slate-500">
            Mahasiswa Aktif
          </p>

          <h2 className="text-4xl font-bold text-green-600 mt-3">
            {totalAktif}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">

          <p className="text-slate-500">
            Mahasiswa Lulus
          </p>

          <h2 className="text-4xl font-bold text-purple-600 mt-3">
            {totalLulus}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">

          <p className="text-slate-500">
            Mahasiswa Nonaktif
          </p>

          <h2 className="text-4xl font-bold text-red-600 mt-3">
            {totalNonaktif + totalCuti}
          </h2>

        </div>

      </div>

      {/* FORM */}

      <div className="bg-white p-8 rounded-3xl shadow-lg mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Form Mahasiswa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            type="text"
            placeholder="Nama Mahasiswa"
            className="border p-3 rounded-xl"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <input
            type="text"
            placeholder="NPM"
            className="border p-3 rounded-xl"
            value={npm}
            onChange={(e) => setNpm(e.target.value)}
          />

          {/* FAKULTAS */}

          <select
            className="border p-3 rounded-xl"
            value={fakultas}
            onChange={(e) => setFakultas(e.target.value)}
          >

            <option value="">
              Pilih Fakultas
            </option>

            <option value="Fakultas Teknologi Industri">
              Fakultas Teknologi Industri
            </option>

            <option value="Fakultas Ilmu Komputer">
              Fakultas Ilmu Komputer
            </option>

            <option value="Fakultas Ekonomi">
              Fakultas Ekonomi
            </option>

            <option value="Fakultas Psikologi">
              Fakultas Psikologi
            </option>

          </select>

          {/* JURUSAN */}

          <select
            className="border p-3 rounded-xl"
            value={jurusan}
            onChange={(e) => setJurusan(e.target.value)}
          >

            <option value="">
              Pilih Jurusan
            </option>

            <option value="Teknik Informatika">
              Teknik Informatika
            </option>

            <option value="Sistem Informasi">
              Sistem Informasi
            </option>

            <option value="Teknik Komputer">
              Teknik Komputer
            </option>

            <option value="Manajemen Informatika">
              Manajemen Informatika
            </option>

          </select>

          {/* KELAS */}

          <select
            className="border p-3 rounded-xl"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
          >

            <option value="">
              Pilih Kelas
            </option>

            {/* IA */}

            <option value="4IA01">4IA01</option>
            <option value="4IA02">4IA02</option>
            <option value="4IA03">4IA03</option>
            <option value="4IA04">4IA04</option>
            <option value="4IA05">4IA05</option>
            <option value="4IA06">4IA06</option>
            <option value="4IA07">4IA07</option>
            <option value="4IA08">4IA08</option>
            <option value="4IA09">4IA09</option>
            <option value="4IA10">4IA10</option>
            <option value="4IA11">4IA11</option>
            <option value="4IA12">4IA12</option>
            <option value="4IA13">4IA13</option>
            <option value="4IA14">4IA14</option>
            <option value="4IA15">4IA15</option>
            <option value="4IA16">4IA16</option>
            <option value="4IA17">4IA17</option>
            <option value="4IA18">4IA18</option>
            <option value="4IA19">4IA19</option>
            <option value="4IA20">4IA20</option>

            {/* KA */}

            <option value="4KA01">4KA01</option>
            <option value="4KA02">4KA02</option>
            <option value="4KA03">4KA03</option>
            <option value="4KA04">4KA04</option>
            <option value="4KA05">4KA05</option>
            <option value="4KA06">4KA06</option>
            <option value="4KA07">4KA07</option>
            <option value="4KA08">4KA08</option>
            <option value="4KA09">4KA09</option>
            <option value="4KA10">4KA10</option>
            <option value="4KA11">4KA11</option>
            <option value="4KA12">4KA12</option>
            <option value="4KA13">4KA13</option>
            <option value="4KA14">4KA14</option>
            <option value="4KA15">4KA15</option>
            <option value="4KA16">4KA16</option>
            <option value="4KA17">4KA17</option>
            <option value="4KA18">4KA18</option>
            <option value="4KA19">4KA19</option>
            <option value="4KA20">4KA20</option>

          </select>

          <select
            className="border p-3 rounded-xl"
            value={angkatan}
            onChange={(e) => setAngkatan(e.target.value)}
          >

            <option value="">
              Tahun Angkatan
            </option>

            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>

          </select>

          <select
            className="border p-3 rounded-xl"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >

            <option value="">
              Jenis Kelamin
            </option>

            <option value="Laki-laki">
              Laki-laki
            </option>

            <option value="Perempuan">
              Perempuan
            </option>

          </select>

          <select
            className="border p-3 rounded-xl"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >

            <option value="">
              Status Mahasiswa
            </option>

            <option value="Aktif">
              Aktif
            </option>

            <option value="Lulus">
              Lulus
            </option>

            <option value="Cuti">
              Cuti
            </option>

            <option value="Nonaktif">
              Nonaktif
            </option>

          </select>

          <select
            className="border p-3 rounded-xl"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >

            <option value="">
              Pilih Semester
            </option>

            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>

          </select>

          <input
            type="number"
            step="0.01"
            placeholder="IPK"
            className="border p-3 rounded-xl"
            value={ipk}
            onChange={(e) => setIpk(e.target.value)}
          />

          <input
            type="number"
            placeholder="Nilai A"
            className="border p-3 rounded-xl"
            value={nilaiA}
            onChange={(e) => setNilaiA(e.target.value)}
          />

          <input
            type="number"
            placeholder="Nilai B"
            className="border p-3 rounded-xl"
            value={nilaiB}
            onChange={(e) => setNilaiB(e.target.value)}
          />

          <input
            type="number"
            placeholder="Nilai C"
            className="border p-3 rounded-xl"
            value={nilaiC}
            onChange={(e) => setNilaiC(e.target.value)}
          />

          <input
            type="number"
            placeholder="Nilai D"
            className="border p-3 rounded-xl"
            value={nilaiD}
            onChange={(e) => setNilaiD(e.target.value)}
          />

          <input
            type="number"
            placeholder="Nilai E"
            className="border p-3 rounded-xl"
            value={nilaiE}
            onChange={(e) => setNilaiE(e.target.value)}
          />

        </div>

        <div className="flex gap-4 mt-6">

          <button
            onClick={
              editId
                ? updateMahasiswa
                : tambahMahasiswa
            }

            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
            "
          >
            {editId
              ? 'Update Mahasiswa'
              : 'Tambah Mahasiswa'}
          </button>

          <button
            onClick={resetForm}

            className="
              bg-slate-500
              hover:bg-slate-600
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
            "
          >
            Reset
          </button>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">

        <input
          type="text"
          placeholder="Search mahasiswa..."
          className="border p-3 rounded-xl w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">NPM</th>
              <th className="p-4 text-left">Fakultas</th>
              <th className="p-4 text-left">Jurusan</th>
              <th className="p-4 text-left">Kelas</th>
              <th className="p-4 text-left">Angkatan</th>
              <th className="p-4 text-left">Gender</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Semester</th>
              <th className="p-4 text-left">IPK</th>
              <th className="p-4 text-left">Aksi</th>

            </tr>

          </thead>

          <tbody>

            {mahasiswa
              ?.filter((item) =>
                item.nama
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )

              .map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4 font-semibold">
                    {item.nama}
                  </td>

                  <td className="p-4">
                    {item.npm}
                  </td>

                  <td className="p-4">
                    {item.fakultas}
                  </td>

                  <td className="p-4">
                    {item.jurusan}
                  </td>

                  <td className="p-4">
                    {item.kelas}
                  </td>

                  <td className="p-4">
                    {item.angkatan}
                  </td>

                  <td className="p-4">
                    {item.gender}
                  </td>

                  <td className="p-4">

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-white
                        text-sm
                        font-semibold

                        ${
                          item.status === 'Aktif'
                            ? 'bg-green-500'
                            : item.status === 'Lulus'
                            ? 'bg-blue-500'
                            : item.status === 'Cuti'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }
                      `}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="p-4">
                    Semester {item.semester}
                  </td>

                  <td className="p-4 font-bold text-blue-600">
                    {item.ipk}
                  </td>

                  <td className="p-4 flex gap-2">

                    <button
                      onClick={() => editMahasiswa(item)}

                      className="
                        bg-yellow-500
                        hover:bg-yellow-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                      "
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        hapusMahasiswa(item.id)
                      }

                      className="
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                      "
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

          </tbody>

        </table>

      </div>

      {/* RANKING */}

      <div className="bg-white p-8 rounded-3xl shadow-lg mt-10">

        <h2 className="text-2xl font-bold mb-6">
          Ranking IPK Mahasiswa
        </h2>

        <div className="space-y-4">

          {rankingMahasiswa.map((item, index) => (

            <div
              key={item.id}

              className="
                flex
                justify-between
                items-center
                bg-slate-100
                p-5
                rounded-2xl
              "
            >

              <div>

                <p className="font-bold text-lg">
                  #{index + 1} {item.nama}
                </p>

                <p className="text-sm text-slate-500">
                  {item.jurusan}
                </p>

                <p className="text-sm text-slate-500">
                  {item.kelas}
                </p>

              </div>

              <div className="text-right">

                <p className="text-3xl font-bold text-blue-600">
                  {item.ipk}
                </p>

                <p className="text-sm text-slate-500">
                  IPK
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}