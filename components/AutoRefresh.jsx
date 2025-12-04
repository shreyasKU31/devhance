"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AutoRefresh({ hasReport }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    if (paymentSuccess && !hasReport) {
      // Payment successful but report not ready yet
      // Refresh every 10 seconds
      const interval = setInterval(() => {
        router.refresh();
      }, 10000);

      // Stop after 5 minutes (30 attempts)
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 300000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [paymentSuccess, hasReport, router]);

  return null; // This component doesn't render anything
}