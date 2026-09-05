import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateBalanceBody = {
  accountId: string;
  amount: number;
  date?: string; // ISO date, défaut = aujourd'hui
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateBalanceBody;

  if (!body.accountId || typeof body.amount !== "number") {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const date = new Date((body.date ?? new Date().toISOString()).slice(0, 10));

  const balance = await prisma.balance.upsert({
    where: { accountId_date: { accountId: body.accountId, date } },
    create: {
      accountId: body.accountId,
      date,
      amount: body.amount,
      source: "MANUAL",
    },
    update: { amount: body.amount, source: "MANUAL" },
  });

  return NextResponse.json(balance, { status: 201 });
}
