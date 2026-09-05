import { formatMoney } from "@/lib/format";
import type { PatrimoineSummary } from "@/lib/accounts";

export default function CurrencyTable({ data }: { data: PatrimoineSummary["byCurrency"] }) {
  if (data.length === 0) return null;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b hairline text-left text-muted">
          <th className="pb-2 font-normal">Devise</th>
          <th className="pb-2 text-right font-normal">Montant</th>
          <th className="pb-2 text-right font-normal">≈ EUR</th>
          <th className="pb-2 text-right font-normal">Taux</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.currency} className="border-b hairline">
            <td className="py-2.5 text-muted">{row.currency}</td>
            <td className="py-2.5 text-right tabular-nums">{formatMoney(row.totalOriginal, row.currency)}</td>
            <td className="py-2.5 text-right tabular-nums">{formatMoney(row.totalEur)}</td>
            <td className="py-2.5 text-right tabular-nums text-muted">{row.rate.toFixed(4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
