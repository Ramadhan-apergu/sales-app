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
    router.replace(`${prefix}/access-control/user`);
  }, [router]);

  return (
    <Layout>
      <LoadingSpin />
    </Layout>
  );
}
