"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmationPage from "@/components/details/Confirmation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  
  // Lấy booking ID từ URL params
  const bookingId = searchParams.get("bookingId") || searchParams.get("orderId") || "";
  
  return <BookingConfirmationPage params={{ id: bookingId }} />;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin booking...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 