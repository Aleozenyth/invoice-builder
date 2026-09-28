import Field from '../components/Field.jsx';
import { createEmptyDb } from '../data/schema.js';
import { LANGS } from '../utils/i18n.js';

export default function SettingsPage({ db, setDb }) {
  const s = db.settings;
  const set = (k, v) => setDb((p) => ({ ...p, settings: { ...p.settings, [k]: v } }));
  const txt = (label, k, type) => <Field label={label} type={type} value={s[k]} onChange={(e) => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} />;
  const opt = (label, k, opts) => <Field label={label} as="select" value={s[k]} onChange={(e) => set(k, e.target.value)}>{opts.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</Field>;
  const box = 'grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-3';

  const exportData = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })); a.download = 'invoice-builder-backup.json'; a.click(); };
  const importData = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { setDb(() => ({ ...createEmptyDb(), ...JSON.parse(r.result) })); } catch { alert('File backup tidak valid'); } };
    r.readAsText(f); e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <section className={box}>
        {opt('Mata Uang Default', 'defaultCurrency', db.currencies.map((c) => [c.code, c.code]))}
        {opt('Bahasa Dokumen Default', 'defaultLang', LANGS.map((l) => [l, l.toUpperCase()]))}
        {txt('Pajak Default (%)', 'defaultTaxRate', 'number')}
        {txt('Jatuh Tempo (hari)', 'defaultDueDays', 'number')}
        {opt('Format Angka', 'numFormat', [['en', '1,234.10'], ['de', '1.234,10']])}
        {opt('Format Tanggal', 'dateFormat', [['YYYY-MM-DD', 'YYYY-MM-DD'], ['DD/MM/YYYY', 'DD/MM/YYYY'], ['MM/DD/YYYY', 'MM/DD/YYYY']])}
      </section>
      <section className={box}>
        {txt('Prefix Invoice', 'invoicePrefix')}{txt('Suffix Invoice', 'invoiceSuffix')}<span />
        {txt('Prefix Quote', 'quotePrefix')}{txt('Suffix Quote', 'quoteSuffix')}<span />
        <div className="sm:col-span-3">{txt('Nama file PDF/XML ({number}, {client})', 'fileName')}</div>
      </section>
      <section className="space-y-2 rounded-lg bg-white p-4 text-sm shadow-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={s.dark} onChange={(e) => set('dark', e.target.checked)} />Mode gelap</label>
        <p className="pt-1 font-semibold">Aktifkan fitur</p>
        {[['quotes', 'Quotes'], ['reports', 'Reports'], ['styleProfiles', 'Style Profiles'], ['ubl', 'UBL / Peppol / XRechnung']].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={s.modules[k] !== false} onChange={(e) => set('modules', { ...s.modules, [k]: e.target.checked })} />{l}</label>))}
      </section>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-1 font-semibold">Backup data</h2>
        <p className="mb-3 text-sm text-slate-500">Data hanya tersimpan di browser ini. Ekspor JSON secara berkala.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={exportData} className="rounded-md bg-indigo-600 px-4 py-2 text-white">Ekspor JSON</button>
          <label className="cursor-pointer rounded-md border border-slate-300 px-4 py-2">Impor JSON<input type="file" accept="application/json" onChange={importData} className="hidden" /></label>
          <button onClick={() => window.confirm('Hapus SEMUA data?') && setDb(() => createEmptyDb())} className="rounded-md border border-red-300 px-4 py-2 text-red-600">Hapus semua data</button>
        </div>
      </section>
    </div>
  );
}
