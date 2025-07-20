"use client";
import Confirmation from "@/components/details/Confirmation";
// import { use } from "react";

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  return <Confirmation params={params} />;
}