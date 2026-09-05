import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccountsWithLatestBalance } from "@/lib/accounts";
import type { AccountCategory, AccountType } from "@prisma/client";

export async function GET() {
  const accounts = await getAccountsWithLatestBalance();
  return NextResponse.json(accounts);
}

type CreateAccountBody = {
  name: string;
  institution?: string;
  currency: string;
  type: AccountType;
  category: AccountCategory;
  initialBalance?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateAccountBody;

  if (!body.name || !body.currency || !body.type || !body.category) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const account = await prisma.account.create({
    data: {
      name: body.name,
      institution: body.institution || null,
      currency: body.currency,
      type: body.type,
      category: body.category,
      ...(typeof body.initialBalance === "number"
        ? {
            balances: {
              create: {
                date: new Date(new Date().toISOString().slice(0, 10)),
                amount: body.initialBalance,
                source: "MANUAL",
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json(account, { status: 201 });
}
