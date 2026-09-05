import { prisma } from "./prisma";

const BASE_CURRENCY = "EUR";

function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Retourne le taux de change quote->EUR (1 unité de `quote` = X EUR), avec cache
 * quotidien en base (§3 : "1 appel/jour max"). EUR->EUR vaut toujours 1.
 */
export async function getRateToEur(quote: string): Promise<number> {
  if (quote === BASE_CURRENCY) return 1;

  const date = todayUTC();

  const cached = await prisma.exchangeRate.findUnique({
    where: { base_quote_date: { base: BASE_CURRENCY, quote, date } },
  });
  if (cached) return Number(cached.rate);

  // Frankfurter renvoie "1 EUR = X quote" -> on veut l'inverse (1 quote = ? EUR).
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}&symbols=${quote}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Frankfurter API error ${res.status}`);
  }
  const data: { rates: Record<string, number> } = await res.json();
  const eurToQuote = data.rates[quote];
  if (!eurToQuote) {
    throw new Error(`Devise inconnue chez Frankfurter: ${quote}`);
  }
  const rate = 1 / eurToQuote;

  await prisma.exchangeRate.upsert({
    where: { base_quote_date: { base: BASE_CURRENCY, quote, date } },
    create: { base: BASE_CURRENCY, quote, date, rate },
    update: { rate },
  });

  return rate;
}

/** Convertit un montant depuis sa devise d'origine vers EUR. */
export async function toEur(amount: number, currency: string): Promise<number> {
  const rate = await getRateToEur(currency);
  return amount * rate;
}
