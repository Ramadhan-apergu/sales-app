"use client"; // WAJIB di atas file ini

import { useRouter } from "next/navigation"; // ✅ benar untuk App Router

const useNavigateWithParams = () => {
  const router = useRouter();

  const navigateWithParams = (basePath, params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    router.push(`${basePath}?${searchParams.toString()}`);
  };

  return navigateWithParams;
};

export default useNavigateWithParams;
