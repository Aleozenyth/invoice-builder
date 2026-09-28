import { useContext } from 'react';
import { PlanContext } from '../lib/PlanContext.js';
import Field from '../components/Field.jsx';
import PartyForm from '../components/PartyForm.jsx';
import ItemsTable from '../components/ItemsTable.jsx';
import InvoicePreview from '../components/InvoicePreview.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { calcTotals, createDoc, getStatus, newItem } from '../utils/calc.js';
import { formatDate, formatMoney, today, uid } from '../utils/format.js';
import { LANGS, labels } from '../utils/i18n.js';
import { buildUbl, download } from '../utils/ubl.js';
import { readImage } from '../utils/image.js';

const BADGE = { unpaid: 'text-red-500', partial: 'text-amber-500', paid: 'text-green-600', open: 'text-sky-500', closed: 'text-slate-400' };

export default function DocumentsPage({ type, db, setDb }) {
  const key = type === 'invoice' ? 'invoices' : 'quotes', docs = db[key], S = db.settings;
  const [selId, setSelId] = useLocalStorage(`ib:sel:${type}`, null);
  const [mode, setMode] = useLocalStorage(`ib:mode:${type}`, 'edit');
  const [ui, setUi] = useLocalStorage(`ib:ui:${type}`, { q: '', sort: 'date', status: '', archived: false });
  const doc = docs.find((d) => d.id === selId);
  const T = doc ? calcTotals(doc) : null;

  const shown = docs
    .filter((d) => !!d.archived === ui.archived && (!ui.status || getStatus(d) === ui.status) && `${d.number} ${d.client.name}`.toLowerCase().includes(ui.q.toLowerCase()))
    .sort((a, b) => ui.sort === 'total' ? calcTotals(b).total - calcTotals(a).total : ui.sort === 'number' ? a.number.localeCompare(b.number) : b.date.localeCompare(a.date));

  const put = (fn) => setDb((p) => ({ ...p, [key]: fn(p[key]) }));
  const patch = (x) => put((l) => l.map((d) => (d.id === selId ? { ...d, ...x } : d)));
  const set = (k, num) => (e) => patch({ [k]: num ? Number(e.target.value) : e.target.value });
  const party = (who) => (k, v) => patch({ [who]: { ...doc[who], [k]: v } });
  const pick = (list, id, fn) => { const r = db[list].find((x) => x.id === id); if (r) fn(structuredClone(r)); }; // snapshot
  const { limit } = useContext(PlanContext);
  const add = () => { if (db.invoices.length + db.quotes.length >= limit) return alert('Batas paket gratis tercapai. Silakan upgrade untuk membuat dokumen baru.'); const d = createDoc(type, db); put((l) => [d, ...l]); setSelId(d.id); setMode('edit'); };
  const dup = () => { const c = { ...structuredClone(doc), id: uid(), number: `${doc.number}-COPY`, payments: [], closed: false }; put((l) => [c, ...l]); setSelId(c.id); };
  const fileName = () => S.fileName.replace('{number}', doc.number).replace('{client}', doc.client.name || '').replace(/[^\w.-]+/g, '_');
  const print = () => { const t = document.title; document.title = fileName(); window.print(); document.title = t; };
  const pay = (amount) => patch({ payments: [...doc.payments, { id: uid(), date: today(), amount }] });
  const exportList = async () => {
    const ExcelJS = (await import('exceljs')).default, wb = new ExcelJS.Workbook(), ws = wb.addWorksheet(key);
    ws.addRow(['Number', 'Date', 'Due', 'Client', 'Status', 'Currency', 'Total', 'Paid']);
    shown.forEach((d) => { const t = calcTotals(d); ws.addRow([d.number, d.date, d.dueDate, d.client.name, getStatus(d), d.currency, t.total, t.paid]); });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([await wb.xlsx.writeBuffer()])); a.download = `${key}.xlsx`; a.click();
  };

  const preview = doc && <InvoicePreview doc={doc} totals={T} t={labels(doc.lang)} />;
  const box = 'space-y-3 rounded-lg bg-white p-4 shadow-sm';
  const sel = (label, k, opts) => <Field label={label} as="select" value={doc[k]} onChange={set(k)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Field>;
  const fill = (label, list, fn) => (
    <Field label={label} as="select" value="" onChange={(e) => pick(list, e.target.value, fn)}>
      <option value="">— pilih —</option>{db[list].filter((r) => !r.archived).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Field>);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] print:block">
      <style>{`@media print{@page{size:${doc?.style?.page ?? 'A4'};margin:12mm}}`}</style>
      <aside className="space-y-2 print:hidden">
        <div className="flex gap-2">
          <input value={ui.q} onChange={(e) => setUi({ ...ui, q: e.target.value })} placeholder="Cari..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
          <button onClick={add} className="rounded-md bg-indigo-600 px-3 text-lg text-white" aria-label="Baru">+</button>
        </div>
        <div className="flex gap-1 text-xs">
          <select value={ui.sort} onChange={(e) => setUi({ ...ui, sort: e.target.value })} className="flex-1 rounded border border-slate-300 bg-white p-1"><option value="date">Tanggal</option><option value="number">Nomor</option><option value="total">Total</option></select>
          <select value={ui.status} onChange={(e) => setUi({ ...ui, status: e.target.value })} className="flex-1 rounded border border-slate-300 bg-white p-1"><option value="">Semua</option>{Object.keys(BADGE).filter((s) => type === 'invoice' ? !['open'].includes(s) : ['open', 'closed'].includes(s)).map((s) => <option key={s}>{s}</option>)}</select>
          <button onClick={() => setUi({ ...ui, archived: !ui.archived })} className={`rounded border px-2 ${ui.archived ? 'border-indigo-500 text-indigo-600' : 'border-slate-300'} bg-white`}>Arsip</button>
          <button onClick={exportList} className="rounded border border-slate-300 bg-white px-2">Export</button>
        </div>
        {shown.length === 0 && <p className="text-sm text-slate-400">Tidak ada dokumen.</p>}
        {shown.map((d) => { const st = getStatus(d), t = calcTotals(d); return (
          <button key={d.id} onClick={() => setSelId(d.id)} className={`block w-full rounded-lg border bg-white p-3 text-left text-sm shadow-sm ${d.id === selId ? 'border-indigo-500' : 'border-transparent'}`}>
            <div className="flex justify-between text-slate-500"><span>{formatDate(d.date)}</span><span className={`font-semibold uppercase ${BADGE[st]}`}>{st}</span></div>
            <div className="mt-1 flex justify-between font-medium"><span>{d.client.name || d.number}</span><span>{formatMoney(t.total, d.currency)}</span></div>
            {st === 'partial' && <div className="text-xs text-sky-500">Sisa {formatMoney(t.balance, d.currency)}</div>}
          </button>); })}
      </aside>

      <section className="min-w-0">
        {!doc ? <p className="text-slate-400 print:hidden">Pilih atau buat dokumen.</p> : (<>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm print:hidden">
            <div className="inline-flex overflow-hidden rounded-md border border-slate-300">
              {['edit', 'preview'].map((m) => <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 capitalize ${mode === m ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{m}</button>)}</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={dup} className="rounded-md border border-slate-300 bg-white px-3 py-2">Duplikat</button>
              {type === 'invoice' && S.modules.ubl && <>
                <button onClick={() => download(`${fileName()}.xml`, buildUbl(doc, 'peppol'))} className="rounded-md border border-slate-300 bg-white px-3 py-2">UBL / Peppol</button>
                <button onClick={() => download(`${fileName()}-xrechnung.xml`, buildUbl(doc, 'xrechnung'))} className="rounded-md border border-slate-300 bg-white px-3 py-2">XRechnung</button></>}
              <button onClick={print} className="rounded-md bg-indigo-600 px-3 py-2 font-medium text-white">Cetak PDF</button></div>
          </div>

          {mode === 'preview' ? preview : (<>
            <div className="space-y-4 print:hidden">
              <section className={box}><div className="grid gap-3 sm:grid-cols-3">
                <Field label="No. Dokumen" value={doc.number} onChange={set('number')} />
                <Field label="Tanggal" type="date" value={doc.date} onChange={set('date')} />
                <Field label="Jatuh Tempo" type="date" value={doc.dueDate} onChange={set('dueDate')} />
                {sel('Mata Uang', 'currency', db.currencies.map((c) => [c.code, c.code]))}
                {sel('Bahasa Dokumen', 'lang', LANGS.map((l) => [l, l.toUpperCase()]))}
                <Field label="Style Profile" as="select" value={doc.style?.id ?? ''} onChange={(e) => pick('styleProfiles', e.target.value, (s) => patch({ style: s }))}><option value="">Default</option>{db.styleProfiles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Field>
              </div></section>

              {fill('Isi dari Businesses', 'businesses', (b) => patch({ company: b }))}
              <PartyForm title="Perusahaan Anda" data={doc.company} onChange={party('company')} />
              {fill('Isi dari Clients', 'clients', (c) => patch({ client: c }))}
              <PartyForm title="Klien" data={doc.client} onChange={party('client')} />

              <Field label="Tambah dari Items" as="select" value="" onChange={(e) => pick('items', e.target.value, (it) => patch({ items: [...doc.items, { id: uid(), name: it.name, unit: it.unit, qty: 1, price: it.price ?? 0, taxRate: it.taxRate ?? 0 }] }))}><option value="">— pilih item —</option>{db.items.filter((i) => !i.archived).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Field>
              <ItemsTable items={doc.items} currency={doc.currency} showTax={doc.taxScope === 'item'}
                onChange={(id, k, v) => patch({ items: doc.items.map((it) => (it.id === id ? { ...it, [k]: v } : it)) })}
                onAdd={() => patch({ items: [...doc.items, newItem()] })} onRemove={(id) => patch({ items: doc.items.filter((it) => it.id !== id) })} />

              <section className={box}><h2 className="font-semibold">Diskon, Pajak & Biaya</h2><div className="grid gap-3 sm:grid-cols-3">
                {sel('Jenis Diskon', 'discountType', [['percent', 'Persen (%)'], ['fixed', 'Nominal tetap']])}
                <Field label="Diskon" type="number" min="0" value={doc.discount ?? 0} onChange={set('discount', 1)} />
                <Field label="Ongkir" type="number" min="0" value={doc.shipping} onChange={set('shipping', 1)} />
                {sel('Mode Pajak', 'taxMode', [['exclusive', 'Eksklusif'], ['inclusive', 'Inklusif']])}
                {sel('Pajak Berlaku', 'taxScope', [['total', 'Pada total'], ['item', 'Per item']])}
                {doc.taxScope === 'total' && <Field label="Pajak (%)" type="number" min="0" value={doc.taxRate} onChange={set('taxRate', 1)} />}
                <Field label="Pajak Dipotong (%)" type="number" min="0" value={doc.deductedRate} onChange={set('deductedRate', 1)} />
              </div></section>

              <section className={box}><h2 className="font-semibold">Pembayaran</h2>
                {doc.payments.map((p) => (
                  <div key={p.id} className="flex items-end gap-2">
                    <Field label="Tanggal" type="date" value={p.date} onChange={(e) => patch({ payments: doc.payments.map((x) => x.id === p.id ? { ...x, date: e.target.value } : x) })} />
                    <Field label="Jumlah" type="number" min="0" value={p.amount} onChange={(e) => patch({ payments: doc.payments.map((x) => x.id === p.id ? { ...x, amount: Number(e.target.value) } : x) })} />
                    <button className="pb-2 text-red-500" onClick={() => patch({ payments: doc.payments.filter((x) => x.id !== p.id) })}>✕</button></div>))}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <button onClick={() => pay(0)} className="rounded-md border border-dashed border-indigo-400 px-3 py-1.5 text-indigo-600">+ Pembayaran</button>
                  {type === 'invoice' && <button onClick={() => T.balance > 0 && pay(Math.round(T.balance * 100) / 100)} className="rounded-md border border-slate-300 px-3 py-1.5">Tandai lunas</button>}
                  <span>Total {formatMoney(T.total, doc.currency)} · Sisa <b>{formatMoney(T.balance, doc.currency)}</b> · Status <b className={BADGE[getStatus(doc)]}>{getStatus(doc)}</b></span></div>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={doc.closed} onChange={(e) => patch({ closed: e.target.checked })} />Closed</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!doc.archived} onChange={(e) => patch({ archived: e.target.checked })} />Diarsipkan</label></div>
              </section>

              <section className={box}>
                {fill('Isi info pembayaran dari Banks', 'banks', (b) => patch({ bank: b, payment: [b.name, b.account, b.swift, b.address].filter(Boolean).join('\n') }))}
                <Field label="Info Pembayaran" as="textarea" rows={3} value={doc.payment} onChange={set('payment')} />
                <Field label="Catatan" as="textarea" rows={3} value={doc.notes} onChange={set('notes')} />
                <div className="text-sm"><span className="mb-1 block font-medium text-slate-600">Tanda tangan (unggah gambar)</span>
                  <input type="file" accept="image/*" onChange={async (e) => e.target.files[0] && patch({ signature: await readImage(e.target.files[0], 300) })} />
                  {doc.signature && <button className="ml-2 text-red-500" onClick={() => patch({ signature: '' })}>Hapus</button>}</div>
              </section>
              <button onClick={() => window.confirm('Hapus permanen dokumen ini?') && (put((l) => l.filter((d) => d.id !== selId)), setSelId(null))} className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600">Hapus dokumen</button>
            </div>
            <div className="hidden print:block">{preview}</div>
          </>)}
        </>)}
      </section>
    </div>
  );
}
