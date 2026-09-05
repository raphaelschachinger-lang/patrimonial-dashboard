import { prisma } from "./prisma";
import { toEur } from "./fx";
import type { AccountCategory, AccountType } from "@prisma/client";

export type AccountWithLatestBalance = {
  id: string;
  name: string;
  institution: string | null;
  currency: string;
  type: AccountType;
  category: AccountCategory;
  latestBalance: number | null;
  latestBalanceDate: string | null; // ISO date
};

/** Comptes non archivés, avec leur dernier solde connu (ou null si jamais saisi). */
export async function getAccountsWithLatestBalance(): Promise<
  AccountWithLatestBalance[]
> {
  const accounts = await prisma.account.findMany({
    where: { archivedAt: null },
    include: {
      balances: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });

  return accounts.map((a) => {
    const latest = a.balances[0];
    return {
      id: a.id,
      name: a.name,
      institution: a.institution,
      currency: a.currency,
      type: a.type,
      category: a.category,
      latestBalance: latest ? Number(latest.amount) : null,
      latestBalanceDate: latest ? latest.date.toISOString().slice(0, 10) : null,
    };
  });
}

export type PatrimoineSummary = {
  totalEur: number;
  byCategory: { category: AccountCategory; totalEur: number }[];
  byCurrency: { currency: string; totalOriginal: number; totalEur: number; rate: number }[];
};

const CATEGORY_ORDER: AccountCategory[] = [
  "CASH",
  "PRIVATE_EQUITY",
  "REAL_ESTATE",
  "OTHER",
];

/** Agrège les comptes en EUR par catégorie et par devise (§5.1). */
export async function summarizePatrimoine(
  accounts: AccountWithLatestBalance[]
): Promise<PatrimoineSummary> {
  const byCategoryMap = new Map<AccountCategory, number>();
  const byCurrencyMap = new Map<string, { totalOriginal: number; totalEur: number; rate: number }>();

  let totalEur = 0;

  for (const account of accounts) {
    if (account.latestBalance === null) continue;

    const eurAmount = await toEur(account.latestBalance, account.currency);
    totalEur += eurAmount;

    byCategoryMap.set(
      account.category,
      (byCategoryMap.get(account.category) ?? 0) + eurAmount
    );

    const currencyEntry = byCurrencyMap.get(account.currency) ?? {
      totalOriginal: 0,
      totalEur: 0,
      rate: eurAmount / account.latestBalance || 0,
    };
    currencyEntry.totalOriginal += account.latestBalance;
    currencyEntry.totalEur += eurAmount;
    byCurrencyMap.set(account.currency, currencyEntry);
  }

  return {
    totalEur,
    byCategory: CATEGORY_ORDER.filter((c) => byCategoryMap.has(c)).map((category) => ({
      category,
      totalEur: byCategoryMap.get(category)!,
    })),
    byCurrency: Array.from(byCurrencyMap.entries()).map(([currency, v]) => ({
      currency,
      ...v,
    })),
  };
}

export const CATEGORY_LABELS: Record<AccountCategory, string> = {
  CASH: "Cash",
  PRIVATE_EQUITY: "Private Equities",
  REAL_ESTATE: "Immobilier",
  OTHER: "Autre",
};

export const TYPE_LABELS: Record<AccountType, string> = {
  BANK: "Bancaire",
  BROKER: "Broker",
  CRYPTO: "Crypto",
  MANUAL: "Manuel",
};
