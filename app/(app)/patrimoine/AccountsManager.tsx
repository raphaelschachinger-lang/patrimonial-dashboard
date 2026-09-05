"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPencil, IconTrash, IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import type { AccountCategory, AccountType } from "@prisma/client";
import type { AccountWithLatestBalance } from "@/lib/accounts";
import { CATEGORY_LABELS, TYPE_LABELS } from "@/lib/accounts";
import { formatMoney, formatDate } from "@/lib/format";

const CURRENCIES = ["EUR", "USD", "CHF"];
const CATEGORIES: AccountCategory[] = ["CASH", "PRIVATE_EQUITY", "REAL_ESTATE", "OTHER"];
const TYPES: AccountType[] = ["BANK", "BROKER", "CRYPTO", "MANUAL"];

const inputClass =
  "border-b hairline bg-transparent px-1 py-1 text-sm text-foreground outline-none focus:border-accent";

type FormState = {
  name: string;
  institution: string;
  currency: string;
  type: AccountType;
  category: AccountCategory;
  initialBalance: string;
};

const emptyForm: FormState = {
  name: "",
  institution: "",
  currency: "EUR",
  type: "MANUAL",
  category: "CASH",
  initialBalance: "",
};

export default function AccountsManager({
  accounts,
}: {
  accounts: AccountWithLatestBalance[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [balanceEdits, setBalanceEdits] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function createAccount() {
    if (!form.name) return;
    setPending(true);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        initialBalance: form.initialBalance ? Number(form.initialBalance) : undefined,
      }),
    });
    setPending(false);
    setCreating(false);
    setForm(emptyForm);
    router.refresh();
  }

  async function updateAccount(id: string, patch: Partial<FormState>) {
    setPending(true);
    await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setPending(false);
    setEditingId(null);
    router.refresh();
  }

  async function deleteAccount(id: string) {
    if (!window.confirm("Supprimer ce compte et son historique de soldes ?")) return;
    setPending(true);
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  async function submitBalance(accountId: string) {
    const raw = balanceEdits[accountId];
    if (raw === undefined || raw === "") return;
    setPending(true);
    await fetch("/api/balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, amount: Number(raw) }),
    });
    setPending(false);
    setBalanceEdits((s) => ({ ...s, [accountId]: "" }));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm text-muted">Comptes</h2>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-sm text-foreground transition-opacity hover:opacity-70"
          >
            <IconPlus size={16} stroke={1.5} />
            Ajouter un compte
          </button>
        )}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b hairline text-left text-muted">
            <th className="pb-2 font-normal">Nom</th>
            <th className="pb-2 font-normal">Type</th>
            <th className="pb-2 font-normal">Catégorie</th>
            <th className="pb-2 font-normal">Devise</th>
            <th className="pb-2 text-right font-normal">Solde</th>
            <th className="pb-2 pl-4 text-right font-normal">Au</th>
            <th className="pb-2 pl-4"></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) =>
            editingId === a.id ? (
              <EditRow
                key={a.id}
                account={a}
                pending={pending}
                onCancel={() => setEditingId(null)}
                onSave={(patch) => updateAccount(a.id, patch)}
              />
            ) : (
              <tr key={a.id} className="border-b hairline">
                <td className="py-2.5">
                  <div>{a.name}</div>
                  {a.institution && <div className="text-xs text-muted">{a.institution}</div>}
                </td>
                <td className="py-2.5 text-muted">{TYPE_LABELS[a.type]}</td>
                <td className="py-2.5 text-muted">{CATEGORY_LABELS[a.category]}</td>
                <td className="py-2.5 text-muted">{a.currency}</td>
                <td className="py-2.5 text-right tabular-nums">
                  <input
                    type="number"
                    placeholder={a.latestBalance !== null ? formatMoney(a.latestBalance, a.currency) : "—"}
                    value={balanceEdits[a.id] ?? ""}
                    onChange={(e) => setBalanceEdits((s) => ({ ...s, [a.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && submitBalance(a.id)}
                    className={`w-28 text-right ${inputClass}`}
                  />
                </td>
                <td className="py-2.5 pl-4 text-right text-xs text-muted">
                  {a.latestBalanceDate ? formatDate(a.latestBalanceDate) : "—"}
                </td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center justify-end gap-2 text-muted">
                    {balanceEdits[a.id] ? (
                      <button onClick={() => submitBalance(a.id)} aria-label="Valider le solde" className="hover:text-foreground">
                        <IconCheck size={15} stroke={1.5} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setEditingId(a.id)} aria-label="Modifier" className="hover:text-foreground">
                          <IconPencil size={15} stroke={1.5} />
                        </button>
                        <button onClick={() => deleteAccount(a.id)} aria-label="Supprimer" className="hover:text-foreground">
                          <IconTrash size={15} stroke={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          )}

          {creating && (
            <tr className="border-b hairline">
              <td className="py-2.5">
                <input
                  autoFocus
                  placeholder="Nom du compte"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full ${inputClass}`}
                />
                <input
                  placeholder="Institution (optionnel)"
                  value={form.institution}
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                  className={`mt-1 w-full text-xs ${inputClass}`}
                />
              </td>
              <td className="py-2.5">
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
                  className={inputClass}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2.5">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AccountCategory }))}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2.5">
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2.5 text-right">
                <input
                  type="number"
                  placeholder="Solde initial"
                  value={form.initialBalance}
                  onChange={(e) => setForm((f) => ({ ...f, initialBalance: e.target.value }))}
                  className={`w-28 text-right ${inputClass}`}
                />
              </td>
              <td></td>
              <td className="py-2.5 pl-4">
                <div className="flex items-center justify-end gap-2 text-muted">
                  <button onClick={createAccount} disabled={pending} aria-label="Créer" className="hover:text-foreground">
                    <IconCheck size={15} stroke={1.5} />
                  </button>
                  <button
                    onClick={() => {
                      setCreating(false);
                      setForm(emptyForm);
                    }}
                    aria-label="Annuler"
                    className="hover:text-foreground"
                  >
                    <IconX size={15} stroke={1.5} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EditRow({
  account,
  pending,
  onCancel,
  onSave,
}: {
  account: AccountWithLatestBalance;
  pending: boolean;
  onCancel: () => void;
  onSave: (patch: Partial<FormState>) => void;
}) {
  const [name, setName] = useState(account.name);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [currency, setCurrency] = useState(account.currency);
  const [type, setType] = useState(account.type);
  const [category, setCategory] = useState(account.category);

  return (
    <tr className="border-b hairline">
      <td className="py-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full ${inputClass}`} />
        <input
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Institution"
          className={`mt-1 w-full text-xs ${inputClass}`}
        />
      </td>
      <td className="py-2.5">
        <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className={inputClass}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2.5">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AccountCategory)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2.5">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
      <td colSpan={2}></td>
      <td className="py-2.5 pl-4">
        <div className="flex items-center justify-end gap-2 text-muted">
          <button
            disabled={pending}
            onClick={() => onSave({ name, institution, currency, type, category })}
            aria-label="Enregistrer"
            className="hover:text-foreground"
          >
            <IconCheck size={15} stroke={1.5} />
          </button>
          <button onClick={onCancel} aria-label="Annuler" className="hover:text-foreground">
            <IconX size={15} stroke={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
