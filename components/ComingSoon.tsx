export default function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-8 text-lg font-medium tracking-tight">{title}</h1>
      <p className="border-t hairline pt-6 text-sm text-muted">À venir.</p>
    </div>
  );
}
