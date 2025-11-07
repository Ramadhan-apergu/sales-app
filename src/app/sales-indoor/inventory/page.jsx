'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/salesIndoor/Layout';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect setelah komponen mount
    router.replace('/sales-indoor/inventory/adjustment');
  }, [router]);

  return (
    <Layout>
        <div className='min-h-96 flex justify-between items-center'>
            <LoadingSpin />
        </div>
    </Layout>
  );
}
