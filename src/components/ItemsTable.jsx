import { formatMoney } from '../utils/format.js';

const cell =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function ItemsTable({ items, currency, onChange, onAdd, onRemove, showTax }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">Item Tagihan</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="pb-2">Nama Barang</th>
              <th className="w-20 pb-2">Jumlah</th>
              <th className="w-36 pb-2">Harga Satuan</th>
              {showTax && <th className="w-20 pb-2">Pajak %</th>}
              <th className="w-36 pb-2 text-right">Total</th>
              <th className="w-10 pb-2" />
            </tr>
          </thead>
          <tbody className="align-middle">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-1 pr-2">
                  <input className={cell} value={it.name} placeholder="Deskripsi" onChange={(e) => onChange(it.id, 'name', e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className={cell} type="number" min="0" step="any" value={it.qty} onChange={(e) => onChange(it.id, 'qty', e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className={cell} type="number" min="0" step="any" value={it.price} onChange={(e) => onChange(it.id, 'price', e.target.value)} />
                </td>
                {showTax && <td className="py-1 pr-2"><input className={cell} type="number" min="0" step="any" value={it.taxRate ?? 0} onChange={(e) => onChange(it.id, 'taxRate', e.target.value)} /></td>}
                <td className="py-1 pr-2 text-right font-medium">
                  {formatMoney((Number(it.qty) || 0) * (Number(it.price) || 0), currency)}
                </td>
                <td className="py-1 text-right">
                  <button type="button" onClick={() => onRemove(it.id)} disabled={items.length === 1}
                    className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Hapus item">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={onAdd}
        className="mt-3 rounded-md border border-dashed border-indigo-400 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
        + Tambah Item
      </button>
    </section>
  );
}
