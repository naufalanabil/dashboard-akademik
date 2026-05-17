import React from "react"; 
import Sidebar from '@/components/Sidebar'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex">
        {/* Sidebar akan muncul di kiri terus-menerus */}
        <Sidebar /> 
        
        <main className="flex-1 ml-[250px] bg-slate-100 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}