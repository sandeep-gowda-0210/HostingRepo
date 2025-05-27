'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Topbar({ user }: { user: any }) {
    const pathname = usePathname();

  return (
    <div className="w-full h-16 bg-[#313131] shadow-md flex items-center justify-between px-6 border-b border-gray-700">
  <div className="text-xl font-bold text-blue-400 tracking-wide select-none hover:scale-200 transition-all ease-in-out duration-500 cursor-grab">AIR</div>

  <div className="flex items-center gap-4">
    <Link
      href="/pages/home/settings/profile-page"
      className={`flex items-center gap-2 text-blue-300 hover:text-white transition-transform duration-300 transform hover:scale-110 ${
        pathname === '/pages/home/settings/profile-page' ? 'text-blue-400' : ''
      }`}
      aria-label="User Profile Settings"
    >
      <img
        src={`${user?.profile_url}?t=${new Date().getTime()}`}
        alt="User Profile"
        className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
      />
    </Link>
  </div>
</div>

  );
}
