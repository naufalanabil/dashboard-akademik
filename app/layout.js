import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'Akademik App',
  description: 'Dashboard Akademik',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-screen bg-slate-100 text-black dark:bg-slate-900 dark:text-white">

        <div className="flex min-h-screen">

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENT */}
          <main className="
            flex-1
            md:ml-[250px]
            p-4
            min-h-screen
            bg-slate-100
            dark:bg-slate-900
          ">
            {children}
          </main>

        </div>

      </body>
    </html>
  )
}