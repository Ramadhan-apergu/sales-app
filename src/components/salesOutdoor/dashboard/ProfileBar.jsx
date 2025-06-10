'use client'

import { useRef } from 'react';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';

export default function ProfilBar({ data }) {
  const containerRef = useRef(null);

  const handleLogout = () => {
    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    // Optionally clear localStorage/sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    // Redirect to login
    window.location.href = '/auth/login';
  };

  return (
    <div
      className="flex px-3 pt-5 pb-4 justify-between items-center bg-white shadow-b-sm relative"
      ref={containerRef}
    >
      <div className="flex gap-2">
        <img
          className="h-11 aspect-square rounded-full bg-gray-7"
          src={data?.url || ''}
          alt="user"
        />
        <div className="flex flex-col justify-between">
          <p className="font-semibold tracking-wide h-6 flex items-center">
            {data?.name || ''}
          </p>
          <p className="text-[0.75rem] text-blue-7 h-4 flex items-center">
            {data?.role || ''}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          className="h-10 aspect-square flex items-center justify-center rounded-full bg-gray-3"
          onClick={handleLogout}
        >
          <HiArrowRightOnRectangle className="text-blue-7" />
        </button>
      </div>
    </div>
  );
}

