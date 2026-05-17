'use client'

import { useEffect, useState } from 'react'

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

import { supabase } from '@/lib/supabase'

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

  const [mahasiswa, setMahasiswa] = useState([])

  useEffect(() => {
    getMahasiswa()
  }, [])

  const getMahasiswa = async () => {

    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('ipk', { ascending: false })

    if (!error && data) {

      // =========================
      // Tambahan Ranking Manual (Diubah Menjadi Sampel Random)
      // =========================

      const rankingManual = [
        {
          id: 1001,
          nama: 'Budi Santoso',
          npm: '51423991',
          fakultas: 'Teknologi Industri',
          jurusan: 'Teknik Informatika',
          kelas: '4IA99',
          semester: 8,
          status: 'Lulus',
          gender: 'Laki-laki',
          ipk: 3.86,
          nilai_a: 32,
          nilai_b: 6,
          nilai_c: 1,
          nilai_d: 0,
          nilai_e: 0,
        },

        {
          id: 1002,
          nama: 'Siti Aminah',
          npm: '31123882',
          fakultas: 'Ilmu Komputer',
          jurusan: 'Sistem Informasi',
          kelas: '4KA98',
          semester: 8,
          status: 'Lulus',
          gender: 'Perempuan',
          ipk: 3.84,
          nilai_a: 30,
          nilai_b: 8,
          nilai_c: 2,
          nilai_d: 0,
          nilai_e: 0,
        },

        {
          id: 1003,
          nama: 'Rian Hidayat',
          npm: '51422773',
          fakultas: 'Teknologi Industri',
          jurusan: 'Teknik Informatika',
          kelas: '4IA97',
          semester: 8,
          status: 'Lulus',
          gender: 'Laki-laki',
          ipk: 3.84,
          nilai_a: 31,
          nilai_b: 7,
          nilai_c: 1,
          nilai_d: 0,
          nilai_e: 0,
        },

        {
          id: 1004,
          nama: 'Dewi Lestari',
          npm: '51422664',
          fakultas: 'Teknologi Industri',
          jurusan: 'Teknik Informatika',
          kelas: '4IA96',
          semester: 8,
          status: 'Lulus',
          gender: 'Perempuan',
          ipk: 3.83,
          nilai_a: 30,
          nilai_b: 7,
          nilai_c: 2,
          nilai_d: 0,
          nilai_e: 0,
        },

        {
          id: 1005,
          nama: 'Eko Prasetyo',
          npm: '51422555',
          fakultas: 'Teknologi Industri',
          jurusan: 'Teknik Informatika',
          kelas: '4IA95',
          semester: 8,
          status: 'Lulus',
          gender: 'Laki-laki',
          ipk: 3.40,
          nilai_a: 24,
          nilai_b: 10,
          nilai_c: 5,
          nilai_d: 0,
          nilai_e: 0,
        },
      ]

      setMahasiswa([
        ...rankingManual,
        ...data,
      ])
    }
  }

  // =========================
  // Statistik
  // =========================

  const totalMahasiswa = mahasiswa.length

  const mahasiswaAktif =
    mahasiswa.filter(
      (item) => item.status === 'Aktif'
    ).length

  const mahasiswaLulus =
    mahasiswa.filter(
      (item) => item.status === 'Lulus'
    ).length

  const mahasiswaCuti =
    mahasiswa.filter(
      (item) => item.status === 'Cuti'
    ).length

  const mahasiswaNonaktif =
    mahasiswa.filter(
      (item) => item.status === 'Nonaktif'
    ).length

  const mahasiswaLaki =
    mahasiswa.filter(
      (item) => item.gender === 'Laki-laki'
    ).length

  const mahasiswaPerempuan =
    mahasiswa.filter(
      (item) => item.gender === 'Perempuan'
    ).length

  const rataIpk = mahasiswa.length
    ? (
        mahasiswa.reduce(
          (total, item) =>
            total + Number(item.ipk || 0),
          0
        ) / mahasiswa.length
      ).toFixed(2)
    : 0

  // =========================
  // Data Semester
  // =========================

  const semesterData = [
    1, 2, 3, 4, 5, 6, 7, 8
  ].map((semester) => {

    const dataSemester =
      mahasiswa.filter(
        (item) =>
          Number(item.semester) === semester
      )

    const avg =
      dataSemester.length
        ? (
            dataSemester.reduce(
              (total, item) =>
                total + Number(item.ipk || 0),
              0
            ) / dataSemester.length
          ).toFixed(2)
        : 0

    return avg
  })

  // =========================
  // Nilai
  // =========================

  const totalA = mahasiswa.reduce(
    (total, item) =>
      total + Number(item.nilai_a || 0),
    0
  )

  const totalB = mahasiswa.reduce(
    (total, item) =>
      total + Number(item.nilai_b || 0),
    0
  )

  const totalC = mahasiswa.reduce(
    (total, item) =>
      total + Number(item.nilai_c || 0),
    0
  )

  const totalD = mahasiswa.reduce(
    (total, item) =>
      total + Number(item.nilai_d || 0),
    0
  )

  const totalE = mahasiswa.reduce(
    (total, item) =>
      total + Number(item.nilai_e || 0),
    0
  )

  // =========================
  // Fakultas
  // =========================

  const fakultasLabels = [
    ...new Set(
      mahasiswa.map(
        (item) => item.fakultas
      )
    ),
  ]

  const fakultasData =
    fakultasLabels.map((fakultas) => {

      return mahasiswa.filter(
        (item) =>
          item.fakultas === fakultas
      ).length
    })

  // =========================
  // Ranking
  // =========================

  const rankingMahasiswa =
    [...mahasiswa]
      .sort(
        (a, b) =>
          Number(b.ipk) - Number(a.ipk)
      )
      .slice(0, 5)

  // =========================
  // Chart
  // =========================

  const barData = {

    labels: [
      'Semester 1',
      'Semester 2',
      'Semester 3',
      'Semester 4',
      'Semester 5',
      'Semester 6',
      'Semester 7',
      'Semester 8',
    ],

    datasets: [
      {
        label: 'Rata-rata IPK',

        data: semesterData,

        backgroundColor: '#2563eb',

        borderRadius: 10,
      },
    ],
  }

  const pieData = {

    labels: [
      'Nilai A',
      'Nilai B',
      'Nilai C',
      'Nilai D',
      'Nilai E',
    ],

    datasets: [
      {
        data: [
          totalA,
          totalB,
          totalC,
          totalD,
          totalE,
        ],

        backgroundColor: [
          '#22c55e',
          '#3b82f6',
          '#facc15',
          '#f97316',
          '#ef4444',
        ],
      },
    ],
  }

  const genderData = {

    labels: [
      'Laki-laki',
      'Perempuan',
    ],

    datasets: [
      {
        data: [
          mahasiswaLaki,
          mahasiswaPerempuan,
        ],

        backgroundColor: [
          '#3b82f6',
          '#ec4899',
        ],
      },
    ],
  }

  const fakultasChartData = {

    labels: fakultasLabels,

    datasets: [
      {
        label: 'Total Mahasiswa',

        data: fakultasData,

        backgroundColor: '#8b5cf6',

        borderRadius: 10,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            Dashboard Akademik
          </h1>

          <p className="text-slate-500 mt-2">
            Sistem Monitoring Akademik Mahasiswa
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg">

          <p className="text-sm text-slate-500">
            Status Sistem
          </p>

          <p className="font-bold text-green-600">
            Online
          </p>
        </div>
      </div>

      {/* CARD */}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Total Mahasiswa
          </h2>

          <p className="text-4xl mt-4 font-bold text-blue-600">
            {totalMahasiswa}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Rata-rata IPK
          </h2>

          <p className="text-4xl mt-4 font-bold text-green-600">
            {rataIpk}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Aktif
          </h2>

          <p className="text-4xl mt-4 font-bold text-purple-600">
            {mahasiswaAktif}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Lulus
          </h2>

          <p className="text-4xl mt-4 font-bold text-green-500">
            {mahasiswaLulus}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Cuti
          </h2>

          <p className="text-4xl mt-4 font-bold text-yellow-500">
            {mahasiswaCuti}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Nonaktif
          </h2>

          <p className="text-4xl mt-4 font-bold text-red-500">
            {mahasiswaNonaktif}
          </p>
        </div>
      </div>

      {/* CHART */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <div className="bg-white p-10 rounded-3xl shadow-lg">

          <h2 className="text-2xl font-bold mb-6">
            Grafik Perkembangan IPK
          </h2>

          <Bar data={barData} />
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-lg">

          <h2 className="text-2xl font-bold mb-6">
            Distribusi Nilai
          </h2>

          <div className="w-[350px] mx-auto">
            <Pie data={pieData} />
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-lg">

          <h2 className="text-2xl font-bold mb-6">
            Distribusi Gender
          </h2>

          <div className="w-[350px] mx-auto">
            <Pie data={genderData} />
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-lg">

          <h2 className="text-2xl font-bold mb-6">
            Statistik Fakultas
          </h2>

          <Bar data={fakultasChartData} />
        </div>
      </div>

      {/* RANKING */}

      <div className="bg-white p-8 rounded-3xl shadow-lg mt-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Ranking IPK Mahasiswa
          </h2>

          <p className="text-slate-500">
            Top 5 Mahasiswa
          </p>
        </div>

        <div className="space-y-4">

          {rankingMahasiswa.map(
            (item, index) => (

              <div
                key={index}

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
                    {index + 1}. {item.nama}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.npm}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.jurusan}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.fakultas}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.kelas} • Semester {item.semester}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-bold text-3xl text-blue-600">
                    {item.ipk}
                  </p>

                  <p className="text-sm text-slate-500">
                    IPK
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white p-8 rounded-3xl shadow-lg mt-10 overflow-x-auto">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Data Mahasiswa
          </h2>

          <p className="text-slate-500">
            Total Data: {totalMahasiswa}
          </p>
        </div>

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="p-4 text-left">
                Nama
              </th>

              <th className="p-4 text-left">
                NPM
              </th>

              <th className="p-4 text-left">
                Fakultas
              </th>

              <th className="p-4 text-left">
                Jurusan
              </th>

              <th className="p-4 text-left">
                Kelas
              </th>

              <th className="p-4 text-left">
                Semester
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                IPK
              </th>
            </tr>
          </thead>

          <tbody>

            {mahasiswa.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-4 font-medium">
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
                  {item.semester}
                </td>

                <td className="p-4">

                  <span
                    className={`
                      px-3 py-1 rounded-full text-white text-sm
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

                <td className="p-4 font-bold text-blue-600">
                  {item.ipk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}