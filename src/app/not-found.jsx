'use client'

import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-dvh flex flex-col bg-gray-3 justify-center items-center text-center">
      <div className="flex flex-col justify-center items-center text-center px-6 max-w-md">
        <Image
          src="/icons/empty.svg"
          alt="Not Found Illustration"
          width={300}
          height={200}
        />
      </div>
      <p className="md:text-3xl font-semibold mt-6 mb-2">Oops, page not found</p>
      <Button shape="round" onClick={() => router.back()} type="primary">
        Go Back
      </Button>
      {/* <button
        onClick={() => router.back()}
        className="text-sm md:text-base px-4 py-2 bg-blue-6 rounded-full text-white cursor-pointer hover:bg-blue-5 duration-150"
      >
        Go Back
      </button> */}
    </div>
  );
}
