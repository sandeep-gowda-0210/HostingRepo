'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularLoader } from '@/components/loader/Loader';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState<Boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    
    setMessage('');
    setLoading(true);
    e.preventDefault();
    const res = await fetch('/api/userauth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("called");
    if (res.ok) {
      router.push('/pages/home/chat-page');
    } else {
      setMessage('Login failed');
    }
    setLoading(false);

  }


  return (
    <div className={`flex justify-center  w-[100vw] h-[100vh]`}>
      {loading && (
        <div className="absolute inset-0 z-10 bg-[#0000008c] flex justify-center items-center">
          <CircularLoader />
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-sm pt-20">
        <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-sm">
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600 transition-all ease-in-out duration-200">
            Log In
          </button>
          {message && <p>{message}</p>}
        </form>
        <div className='border-t-orange-400 border-t-2 border-dashed text-center mt-5'>
          go to signup page if account doesn't exists

        </div>
        <button className="bg-blue-500 text-white p-2 rounded mt-10 w-full" onClick={() => { router.push('/pages/signup') }}>signup</button>
      </div>
    </div>
  );
}
