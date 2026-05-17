import Sidebar from '@/components/Sidebar'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex text-black">
        {/* Sidebar nempel di kiri */}
        <Sidebar /> 
        
        {/* Konten di kanan */}
        <main className="flex-1 ml-[250px] bg-slate-100 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}