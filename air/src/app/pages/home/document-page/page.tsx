// app/dashboard/page.tsx
"use client"
import { useUserData } from '@/context/UserContext';
import FileExplorer from './components/FileExplorer';

export default function DashboardPage() {
  const {user} = useUserData();
  const userId = user?.user_id || null;

  return (
    userId && 
    <main className="h-full bg-gray-900 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Document Manager</h1>
      <div className='border-1 border-gray-700'></div>
      <FileExplorer userId={userId} />
    </main>
  );
}
