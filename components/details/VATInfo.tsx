"use client";

import { Card, CardContent } from "../../components/ui/card";
import { Percent } from "lucide-react";

interface VATInfoProps {
  tourPrice: number;
  agencyId: string | null;
  referralCode: string | null;
}

export default function VATInfo({ tourPrice, agencyId, referralCode }: VATInfoProps) {
  if (!agencyId) return null;

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Phí VAT:</span>
          </div>
          <span className="font-bold text-green-800">10%</span>
        </div>
      </CardContent>
    </Card>
  );
}
