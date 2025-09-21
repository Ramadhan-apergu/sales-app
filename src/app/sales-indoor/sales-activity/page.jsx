"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import LayoutSalesIndoor from "@/components/salesIndoor/Layout";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect setelah komponen mount
    router.replace("/sales-indoor/sales-activity/target");
  }, [router]);

  return (
    <LayoutSalesIndoor>
      <LoadingSpin />
    </LayoutSalesIndoor>
  );
}
