'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from 'lucide-react';


export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '/';
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (<div className="flex h-full overflow-hidden">

        <div className="relative h-fit w-fit z-10 md:hidden">
        <button onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="hidden md:flex w-[40%] max-w-[400px] h-full bg-gradient-to-b from-[#1e1e2f] to-[#111116] backdrop-blur-lg border-r border-gray-700 text-white flex-col p-6 shadow-inner">
  {/* Heading */}
  <p className="text-2xl font-semibold border-b border-gray-600 pb-2 mb-6 tracking-wide">
    Settings
  </p>

  {/* Links */}
  <nav className="flex flex-col gap-4 text-sm font-medium">
    <Link
      href="/pages/home/settings/profile-page"
      className={`px-4 py-2 rounded-md transition-all ${
        pathname.startsWith('/pages/home/settings/profile-page')
          ? "bg-blue-600 text-white shadow"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      👤 Profile
    </Link>

    <Link
      href="/pages/home/settings/help-feedback-page"
      className={`px-4 py-2 rounded-md transition-all ${
        pathname.startsWith('/pages/home/settings/help-feedback-page')
          ? "bg-blue-600 text-white shadow"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      💬 Help & Feedback
    </Link>
  </nav>

  {/* Optional Footer */}
  {/* <div className="mt-auto pt-6 text-xs text-gray-500">
    © {new Date().getFullYear()} YourApp
  </div> */}
</div>



        <AnimatePresence>
  {isSidebarOpen && (
    <motion.div
      key="mobile-sidebar"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 z-50 w-72 h-full bg-gradient-to-b from-[#1e1e2f] to-[#111116] backdrop-blur-lg border-r border-gray-700 text-white px-5 py-6 md:hidden shadow-xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-wide">Settings</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-5 text-sm">
        <Link
          href="/pages/home/settings/profile-page"
          onClick={() => setIsSidebarOpen(false)}
          className={`px-3 py-2 rounded-md transition-all ${
            pathname.startsWith('/pages/home/settings/profile-page')
              ? "bg-blue-600 text-white font-medium shadow-sm"
              : "text-gray-300 hover:bg-white/10"
          }`}
        >
          👤 Profile
        </Link>

        <Link
          href="/pages/home/settings/help-feedback-page"
          onClick={() => setIsSidebarOpen(false)}
          className={`px-3 py-2 rounded-md transition-all ${
            pathname.startsWith('/pages/home/settings/help-feedback-page')
              ? "bg-blue-600 text-white font-medium shadow-sm"
              : "text-gray-300 hover:bg-white/10"
          }`}
        >
          💬 Help & Feedback
        </Link>
      </nav>

      {/* Optional Footer */}
      {/* <div className="mt-auto pt-6 text-xs text-gray-500">
        © {new Date().getFullYear()} AIR. All rights reserved.
      </div> */}
    </motion.div>
  )}
</AnimatePresence>

        <div className="w-full md:min-w-[80%] h-full overflow-y-auto">
        {children}
      </div>
    </div>
    )
}