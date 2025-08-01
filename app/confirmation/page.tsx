"use client"

import BookingConfirmationPage from "@/components/details/Confirmation";
import { Suspense } from "react";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    }>
      <BookingConfirmationPage params={{ id: "" }} />
    </Suspense>
  );
}
