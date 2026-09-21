'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/shared/Layout';
import LoadingSpin from '@/components/shared/LoadingSpin';
import useRolePrefix from "@/hooks/useRolePrefix";

export default function Page() {
  const prefix = useRolePrefix();
  const router = useRouter();

  useEffect(() => {
    // Redirect setelah komponen mount
    router.replace(`${prefix}/inventory/adjustment`);
  }, [router]);

  return (
    <Layout>
        <div className='min-h-96 flex justify-between items-center'>
            <LoadingSpin />
        </div>
    </Layout>
  );
}
