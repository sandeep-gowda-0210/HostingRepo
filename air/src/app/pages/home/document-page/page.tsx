// app/dashboard/page.tsx
"use client"
import { useUserData } from '../layout';
import FileExplorer from './components/FileExplorer';

export default function DashboardPage() {
  const {user} = useUserData();
  const userId = user?.user_id || null;

  return (
    userId && 
    <main className="h-full bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Document Manager</h1>
      <FileExplorer userId={userId} />
    </main>
  );
}
