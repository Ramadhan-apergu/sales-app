'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/shared/Layout';
import LoadingSpin from '@/components/shared/LoadingSpin';
import useRolePrefix from "@/hooks/useRolePrefix";
import { firstTransactionResource } from "@/config/roleAccess";

export default function Page() {
  const prefix = useRolePrefix();
  const { role } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect setelah komponen mount, ke sub-menu transaction pertama
    // yang memang bisa diakses role ini (tidak semua role punya semua
    // sub-menu transaction - lihat src/config/roleAccess.js).
    router.replace(`${prefix}/transaction/${firstTransactionResource(role)}`);
  }, [router]);

  return (
    <Layout>
      <LoadingSpin />
    </Layout>
  );
}
