import { formatDate, formatMoney } from '../utils/format.js';
import { getStatus } from '../utils/calc.js';

export const FONTS = { Helvetica: 'Helvetica, Arial, sans-serif', 'Times-Roman': '"Times New Roman", serif', Courier: '"Courier New", monospace', Roboto: 'Roboto, sans-serif', Inter: 'Inter, sans-serif' };
const DEF = { accent: '#4338ca', font: 'Helvetica', fontSize: 12, logoSize: 90, headerStyle: 'filled', rowStyle: 'lines', showRow: true, showUnit: true, showQty: true };

export default function InvoicePreview({ doc, totals: t, t: L }) {
  const s = { ...DEF, ...(doc.style ?? {}) };
  const m = (v) => formatMoney(v, doc.currency);
  const up = (v) => (s.uppercase ? String(v).toUpperCase() : v);
  const title = s.titleLabel || (doc.type === 'invoice' ? L.invoice : L.quote);
  const th = { padding: '6px 8px', textAlign: 'right', ...(s.headerStyle === 'filled' ? { background: s.accent, color: '#fff' } : { borderBottom: `2px solid ${s.accent}`, color: s.accent }) };
  const wm = s.paidWatermark && doc.type === 'invoice' && getStatus(doc) === 'paid' ? 'PAID' : s.watermark;
  const Party = ({ label, p }) => (
    <div><b style={{ fontSize: '0.8em', color: '#64748b' }}>{up(label)}</b>
      <div style={{ fontWeight: 700 }}>{p.name}</div>
      <div style={{ whiteSpace: 'pre-line', color: '#475569' }}>{p.address}{p.city ? `\n${p.postal ?? ''} ${p.city}` : ''}</div>
      <div style={{ color: '#475569' }}>{[p.email, p.phone, p.taxId].filter(Boolean).join(' · ')}</div></div>
  );
  const Row = ({ k, v, bold, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 700 : 400, color, borderTop: bold ? '1px solid #cbd5e1' : 0, paddingTop: bold ? 4 : 0 }}><span>{up(k)}</span><span>{v}</span></div>
  );

  return (
    <article style={{ position: 'relative', overflow: 'hidden', background: '#fff', color: '#1e293b', padding: 32, fontFamily: FONTS[s.font], fontSize: s.fontSize }} className="rounded-lg shadow-sm print:rounded-none print:p-0 print:shadow-none">
      {wm && <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', fontSize: 96, fontWeight: 800, color: 'rgba(100,116,139,.12)', transform: 'rotate(-25deg)', pointerEvents: 'none' }}>{wm}</div>}
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div><h1 style={{ fontSize: '2.2em', fontWeight: 800, color: s.accent, margin: 0 }}>{title}</h1>
          <div style={{ marginTop: 6 }}><b>{doc.number}</b><br />{up(L.date)}: {formatDate(doc.date)}<br />{up(L.due)}: {formatDate(doc.dueDate)}</div></div>
        {doc.company.logo && <img src={doc.company.logo} alt="logo" style={{ maxWidth: s.logoSize, maxHeight: s.logoSize, objectFit: 'contain' }} />}
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 0' }}>
        <Party label={L.from} p={doc.company} /><Party label={L.billTo} p={doc.client} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          {s.showRow && <th style={{ ...th, textAlign: 'left', width: 28 }}>#</th>}
          <th style={{ ...th, textAlign: 'left' }}>{up(L.item)}</th>
          {s.showUnit && <th style={th}>{up(L.unit)}</th>}
          {s.showQty && <th style={th}>{up(L.qty)}</th>}
          <th style={th}>{up(L.price)}</th><th style={th}>{up(L.total)}</th></tr></thead>
        <tbody>{doc.items.map((it, i) => (
          <tr key={it.id} style={{ background: s.rowStyle === 'striped' && i % 2 ? '#f1f5f9' : 'transparent', borderBottom: s.rowStyle === 'lines' ? '1px solid #e2e8f0' : 0 }}>
            {s.showRow && <td style={{ padding: '6px 8px' }}>{i + 1}</td>}
            <td style={{ padding: '6px 8px' }}>{it.name}{doc.taxScope === 'item' && Number(it.taxRate) > 0 && <div style={{ fontSize: '0.8em', color: '#64748b' }}>{L.tax} {it.taxRate}%: {m(totals(t, it.id).tax)}</div>}</td>
            {s.showUnit && <td style={{ padding: '6px 8px', textAlign: 'right' }}>{it.unit}</td>}
            {s.showQty && <td style={{ padding: '6px 8px', textAlign: 'right' }}>{it.qty}</td>}
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{m(Number(it.price) || 0)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{m((Number(it.qty) || 0) * (Number(it.price) || 0))}</td></tr>))}</tbody>
      </table>
      <div style={{ marginLeft: 'auto', maxWidth: 300, marginTop: 12, display: 'grid', gap: 3 }}>
        <Row k={L.subtotal} v={m(t.subtotal)} />
        {t.discount > 0 && <Row k={L.discount} v={`-${m(t.discount)}`} />}
        {t.tax > 0 && <Row k={`${L.tax}${doc.taxScope === 'total' ? ` (${doc.taxRate}%)` : ''}${doc.taxMode === 'inclusive' ? ' ✓' : ''}`} v={m(t.tax)} />}
        {t.shipping > 0 && <Row k={L.shipping} v={m(t.shipping)} />}
        {t.deducted > 0 && <Row k={`${L.deducted} (${doc.deductedRate}%)`} v={`-${m(t.deducted)}`} />}
        <Row k={L.total} v={m(t.total)} bold color={s.accent} />
        {t.paid > 0 && <Row k={L.paid} v={m(t.paid)} />}
        {t.paid > 0 && <Row k={L.balance} v={m(t.balance)} bold color={s.accent} />}
      </div>
      {[[L.payment, doc.payment], [L.notes, doc.notes]].map(([k, v]) => v && (
        <div key={k} style={{ marginTop: 20 }}><b style={{ fontSize: '0.8em', color: '#64748b' }}>{up(k)}</b><div style={{ whiteSpace: 'pre-line', color: '#475569' }}>{v}</div></div>))}
      {doc.signature && <div style={{ marginTop: 24 }}><img src={doc.signature} alt="signature" style={{ maxHeight: 70 }} /><div style={{ fontSize: '0.8em', color: '#64748b' }}>{up(L.signature)}</div></div>}
    </article>
  );
}
const totals = (t, id) => t.lines.find((l) => l.id === id) ?? { tax: 0 };
