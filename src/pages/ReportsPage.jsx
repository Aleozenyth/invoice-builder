import { useMemo } from 'react';
import { calcTotals } from '../utils/calc.js';
import { formatMoney } from '../utils/format.js';

export default function ReportsPage({ db }) {
  const byCurrency = useMemo(() => {
    const r = {};
    const row = (c) => (r[c] ??= { billed: 0, paid: 0, outstanding: 0, quotes: 0 });
    db.invoices.forEach((d) => {
      const t = calcTotals(d), x = row(d.currency);
      x.billed += t.total; x.paid += t.paid; x.outstanding += d.closed ? 0 : Math.max(0, t.balance);
    });
    db.quotes.forEach((d) => (row(d.currency).quotes += calcTotals(d).total));
    return r;
  }, [db.invoices, db.quotes]);

  const stats = [['Invoices', db.invoices.length], ['Quotes', db.quotes.length], ['Clients', db.clients.length]];
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">Reports</h1>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map(([l, n]) => (
          <div key={l} className="rounded-lg bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-bold">{n}</p></div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-2">Mata Uang</th><th>Ditagihkan</th><th>Lunas</th><th>Belum Lunas</th><th>Total Quotes</th></tr>
          </thead>
          <tbody>
            {Object.keys(byCurrency).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-slate-400">Belum ada data.</td></tr>}
            {Object.entries(byCurrency).map(([c, v]) => (
              <tr key={c} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{c}</td>
                <td>{formatMoney(v.billed, c)}</td><td className="text-green-600">{formatMoney(v.paid, c)}</td>
                <td className="text-red-500">{formatMoney(v.outstanding, c)}</td><td>{formatMoney(v.quotes, c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
