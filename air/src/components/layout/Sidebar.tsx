'use client'
import React from "react";
import { Settings, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const logout = async () => {
    const result = await fetch('/api/userauth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (result.ok) {
      console.log("logged out");
      router.push('/pages/login');  // redirect after logout
    }
  }
  return (
    <div className="w-12 sm:w-16 h-full bg-[#232323] items-center border-r border-gray-700 flex flex-col justify-between  py-6">
      <div className="flex flex-col gap-8">
        <Link
          href="/pages/home/chat-page"
          className={`flex items-center justify-center text-blue-200 hover:text-white transition-transform duration-300 transform hover:scale-110 ${pathname.startsWith('/pages/home/chat-page') ? 'text-blue-500' : ''
            }`}
          aria-label="Chat Page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle-more-icon"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
        </Link>

        <Link
          href="/pages/home/document-page"
          className={`flex items-center justify-center text-blue-200 hover:text-white transition-transform duration-300 transform hover:scale-110 ${pathname.startsWith('/pages/home/document-page') ? 'text-blue-500' : ''
            }`}
          aria-label="Document Page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-files-icon"
          >
            <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
            <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
            <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        <Link
          href="/pages/home/settings/profile-page"
          className={`flex items-center justify-center text-blue-200 hover:text-white transition-transform duration-300 transform hover:scale-110 ${pathname.startsWith('/pages/home/settings') ? 'text-blue-500' : ''
            }`}
          aria-label="Settings"
        >
          <Settings size={30} />
        </Link>

        <button
          className="flex items-center justify-center text-blue-200 hover:text-white transition-transform duration-300 transform hover:scale-110 cursor-pointer"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut size={30} />
        </button>
      </div>
    </div>

  );
}
