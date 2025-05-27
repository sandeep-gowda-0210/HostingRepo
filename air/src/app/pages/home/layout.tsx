
// src/app/pages/home/layout.tsx
import { UserProvider } from "@/context/UserContext";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
