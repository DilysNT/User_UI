"use client";
import Payment from "../../../../components/details/Payment";
import { use } from "react";

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <Payment params={resolvedParams} />;
}