"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORY_LABELS } from "@/lib/accounts";
import { formatMoney } from "@/lib/format";
import type { AccountCategory } from "@prisma/client";

// Palette restreinte : tons du même gris (aucune couleur décorative), l'accent
// bronze reste réservé aux flux d'épargne/investissement (§4, futur Sankey).
const OPACITIES = [0.92, 0.66, 0.42, 0.24];

export default function PatrimoinePieChart({
  data,
}: {
  data: { category: AccountCategory; totalEur: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Aucun compte avec un solde pour l’instant.</p>;
  }

  return (
    <div className="flex items-center gap-8">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="totalEur"
              nameKey="category"
              innerRadius="62%"
              outerRadius="100%"
              stroke="var(--background)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.category} fill="var(--foreground)" fillOpacity={OPACITIES[i % OPACITIES.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatMoney(Number(value)),
                CATEGORY_LABELS[name as AccountCategory],
              ]}
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--hairline)",
                borderRadius: 4,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {data.map((entry, i) => (
          <li key={entry.category} className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-foreground"
              style={{ opacity: OPACITIES[i % OPACITIES.length] }}
            />
            <span className="text-muted">{CATEGORY_LABELS[entry.category]}</span>
            <span className="tabular-nums">{formatMoney(entry.totalEur)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
