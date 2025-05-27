import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function Layout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  return (<div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-blue-300">
  <Topbar user={user} />
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />
    <main className="flex-1 bg-[#171717] p-1 overflow-y-auto  rounded-r-lg">
      {children}
    </main>
  </div>
</div>

  );
}
