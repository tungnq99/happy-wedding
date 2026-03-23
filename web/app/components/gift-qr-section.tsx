"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  groomQrImageUrl?: string | null;
  groomBankName?: string | null;
  groomBankAccountNumber?: string | null;
  groomBankAccountName?: string | null;
  brideQrImageUrl?: string | null;
  brideBankName?: string | null;
  brideBankAccountNumber?: string | null;
  brideBankAccountName?: string | null;
  primaryColor: string;
};

type BankCard = {
  key: "groom" | "bride";
  label: string;
  qrImageUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
};

export function GiftQrSection({
  groomQrImageUrl,
  groomBankName,
  groomBankAccountNumber,
  groomBankAccountName,
  brideQrImageUrl,
  brideBankName,
  brideBankAccountNumber,
  brideBankAccountName,
  primaryColor,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<"groom" | "bride" | null>(null);

  const cards: BankCard[] = [
    {
      key: "groom",
      label: "Chu Re",
      qrImageUrl: groomQrImageUrl,
      bankName: groomBankName,
      bankAccountNumber: groomBankAccountNumber,
      bankAccountName: groomBankAccountName,
    },
    {
      key: "bride",
      label: "Co Dau",
      qrImageUrl: brideQrImageUrl,
      bankName: brideBankName,
      bankAccountNumber: brideBankAccountNumber,
      bankAccountName: brideBankAccountName,
    },
  ].filter((card) => Boolean(card.qrImageUrl || card.bankName || card.bankAccountName || card.bankAccountNumber)) as BankCard[];

  if (cards.length === 0) {
    return null;
  }

  function handleCopy(key: "groom" | "bride", accountNumber?: string | null) {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return (
    <section className="relative overflow-hidden bg-white px-6 py-24" id="gift">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="relative z-10 mb-16 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-[1px] w-8" style={{ backgroundColor: `${primaryColor}66` }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
              Hop mung cuoi
            </p>
            <div className="h-[1px] w-8" style={{ backgroundColor: `${primaryColor}66` }} />
          </div>
          <h2 className="font-script text-6xl text-gray-800">Gui Loi Chuc & Qua Tang</h2>
        </div>

        <div className={`grid gap-8 ${cards.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {cards.map((card) => {
            const copied = copiedKey === card.key;
            const hasQr = Boolean(card.qrImageUrl);

            return (
              <div key={card.key} className="rounded-sm border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl sm:p-10">
                <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.35em] text-gray-400">{card.label}</p>

                <div className={`grid gap-8`}>
                  {hasQr && (
                    <div className="mx-auto flex w-full max-w-[260px] flex-col items-center justify-center">
                      <div className="relative h-64 w-64 overflow-hidden rounded-sm border border-gray-100 bg-white p-4 shadow-md">
                        <Image src={card.qrImageUrl!} alt={`QR ${card.label}`} fill className="object-contain" />
                      </div>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Mừng cưới</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
