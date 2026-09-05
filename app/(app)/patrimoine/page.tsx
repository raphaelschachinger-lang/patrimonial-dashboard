import { getAccountsWithLatestBalance, summarizePatrimoine } from "@/lib/accounts";

// Dashboard authentifié, propre à l'utilisateur et alimenté par la DB à chaque
// visite — pas de prérendu statique à builder.
export const dynamic = "force-dynamic";
import { formatMoney } from "@/lib/format";
import PatrimoinePieChart from "./PatrimoinePieChart";
import CurrencyTable from "./CurrencyTable";
import AccountsManager from "./AccountsManager";

export default async function PatrimoinePage() {
  const accounts = await getAccountsWithLatestBalance();
  const summary = await summarizePatrimoine(accounts);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="mb-1 text-sm text-muted">Patrimoine net</h1>
        <p className="text-4xl font-medium tabular-nums tracking-tight">
          {formatMoney(summary.totalEur)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm text-muted">Par catégorie</h2>
          <PatrimoinePieChart data={summary.byCategory} />
        </section>

        <section>
          <h2 className="mb-4 text-sm text-muted">Par devise</h2>
          <CurrencyTable data={summary.byCurrency} />
        </section>
      </div>

      <section>
        <AccountsManager accounts={accounts} />
      </section>
    </div>
  );
}
