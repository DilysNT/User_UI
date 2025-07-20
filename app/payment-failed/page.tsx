"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function PaymentFailedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Thanh toán thất bại!</h2>
          <p className="text-gray-600 mb-4">Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 