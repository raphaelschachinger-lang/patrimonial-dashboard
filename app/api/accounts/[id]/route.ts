import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AccountCategory, AccountType } from "@prisma/client";

type UpdateAccountBody = Partial<{
  name: string;
  institution: string | null;
  currency: string;
  type: AccountType;
  category: AccountCategory;
}>;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as UpdateAccountBody;

  const account = await prisma.account.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(account);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
