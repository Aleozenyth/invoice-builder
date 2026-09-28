import { useState } from 'react';
import Field from '../components/Field.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { PAGES, SECTIONS } from '../data/schema.js';
import { readImage } from '../utils/image.js';
import { uid } from '../utils/format.js';

export default function DataPage({ section, db, setDb }) {
  const cfg = SECTIONS[section], rows = db[section];
  const [form, setForm] = useState(null);
  const [ui, setUi] = useLocalStorage(`ib:ui:${section}`, { q: '', desc: false, archived: false }); // pencarian/sort/filter persisten
  const isNew = form && !rows.some((r) => r.id === form.id);
  const first = cfg.fields[0].key;

  const shown = rows
    .filter((r) => !!r.archived === ui.archived && JSON.stringify(r).toLowerCase().includes(ui.q.toLowerCase()))
    .sort((a, b) => String(a[first] ?? '').localeCompare(String(b[first] ?? '')) * (ui.desc ? -1 : 1));

  const put = (fn) => setDb((p) => ({ ...p, [section]: fn(p[section]) }));
  const save = () => {
    if (!String(form[first] ?? '').trim()) return alert(`${cfg.fields[0].label} wajib diisi`);
    put((l) => (isNew ? [...l, form] : l.map((r) => (r.id === form.id ? form : r)))); setForm(null);
  };
  const archive = (r) => put((l) => l.map((x) => (x.id === r.id ? { ...x, archived: !x.archived } : x)));
  const del = (r) => window.confirm('Hapus permanen?') && put((l) => l.filter((x) => x.id !== r.id));
  const set = (k, v) => setForm({ ...form, [k]: v });

  const input = (f) => {
    const v = form[f.key] ?? '';
    if (f.type === 'checkbox') return <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />{f.label}</label>;
    if (f.type === 'image') return (
      <div className="text-sm"><span className="mb-1 block font-medium text-slate-600">{f.label}</span>
        <input type="file" accept="image/*" onChange={async (e) => e.target.files[0] && set(f.key, await readImage(e.target.files[0]))} />
        {v && <div className="mt-1 flex items-center gap-2"><img src={v} alt="" className="h-12" /><button className="text-red-500" onClick={() => set(f.key, '')}>Hapus</button></div>}</div>);
    if (f.type === 'select') return <Field label={f.label} as="select" value={v} onChange={(e) => set(f.key, e.target.value)}><option value="" />{f.opts.map((o) => <option key={o}>{o}</option>)}</Field>;
    return (<>
      <Field label={f.label} as={f.type === 'textarea' ? 'textarea' : 'input'} type={f.type === 'textarea' ? undefined : f.type ?? 'text'} rows={f.type === 'textarea' ? 2 : undefined}
        list={f.ref ? `${f.key}-l` : undefined} value={v} onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} />
      {f.ref && <datalist id={`${f.key}-l`}>{db[f.ref].map((r) => <option key={r.id} value={r.name} />)}</datalist>}</>);
  };

  const exportXlsx = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook(), ws = wb.addWorksheet(section);
    ws.addRow(cfg.fields.filter((f) => f.type !== 'image').map((f) => f.label));
    rows.forEach((r) => ws.addRow(cfg.fields.filter((f) => f.type !== 'image').map((f) => r[f.key] ?? '')));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([await wb.xlsx.writeBuffer()])); a.download = `${section}.xlsx`; a.click();
  };
  const importXlsx = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const ExcelJS = (await import('exceljs')).default, wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0], fs = cfg.fields.filter((f) => f.type !== 'image'), recs = [];
    ws.eachRow((row, i) => { if (i === 1) return; const r = { id: uid() }; fs.forEach((f, j) => (r[f.key] = row.getCell(j + 1).value ?? '')); recs.push(r); });
    setDb((p) => {
      const next = { ...p, [section]: [...p[section], ...recs] };
      if (section === 'items') // buat unit/kategori yang belum ada otomatis
        ['units', 'categories'].forEach((k) => {
          const f = k === 'units' ? 'unit' : 'category', have = new Set(next[k].map((x) => x.name));
          recs.forEach((r) => { if (r[f] && !have.has(r[f])) { have.add(r[f]); next[k] = [...next[k], { id: uid(), name: r[f] }]; } });
        });
      return next;
    });
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{PAGES[section].label}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={exportXlsx} className="rounded-md border border-slate-300 bg-white px-3 py-2">Ekspor XLSX</button>
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2">Impor XLSX<input type="file" accept=".xlsx" className="hidden" onChange={importXlsx} /></label>
          <button onClick={() => setForm({ id: uid(), accent: '#4338ca', showRow: true, showUnit: true, showQty: true })} className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white">+ Tambah</button>
        </div>
      </div>
      <div className="mb-3 flex gap-2 text-sm">
        <input value={ui.q} onChange={(e) => setUi({ ...ui, q: e.target.value })} placeholder="Cari..." className="w-full rounded-md border border-slate-300 bg-white px-3 py-2" />
        <button onClick={() => setUi({ ...ui, desc: !ui.desc })} className="rounded-md border border-slate-300 bg-white px-3">{ui.desc ? 'Z→A' : 'A→Z'}</button>
        <button onClick={() => setUi({ ...ui, archived: !ui.archived })} className={`rounded-md border px-3 ${ui.archived ? 'border-indigo-500 text-indigo-600' : 'border-slate-300'} bg-white`}>Arsip</button>
      </div>

      {form && (
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">{cfg.fields.map((f) => <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>{input(f)}</div>)}</div>
          <div className="mt-3 flex gap-2"><button onClick={save} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white">Simpan</button><button onClick={() => setForm(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm">Batal</button></div>
        </div>)}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{cfg.columns.map((c) => <th key={c} className="px-4 py-2">{cfg.fields.find((f) => f.key === c)?.label}</th>)}<th /></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td className="px-4 py-6 text-slate-400" colSpan={cfg.columns.length + 1}>Tidak ada data.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                {cfg.columns.map((c) => <td key={c} className="px-4 py-2">{c === 'accent' ? <span className="inline-block h-4 w-8 rounded" style={{ background: r[c] }} /> : r[c]}</td>)}
                <td className="space-x-3 px-4 py-2 text-right">
                  <button onClick={() => setForm(r)} className="text-indigo-600">Edit</button>
                  <button onClick={() => archive(r)} className="text-slate-500">{r.archived ? 'Pulihkan' : 'Arsip'}</button>
                  {r.archived && <button onClick={() => del(r)} className="text-red-500">Hapus</button>}
                </td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
