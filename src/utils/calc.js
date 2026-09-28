import { today, uid } from './format.js';

export const newItem = () => ({ id: uid(), name: '', qty: 1, price: 0, taxRate: 0 });
const n = (v) => Number(v) || 0;

// Diskon (% / tetap), pajak (inklusif/eksklusif, per item/total), ongkir, pajak dipotong, pembayaran sebagian
export const calcTotals = (d) => {
  const subtotal = d.items.reduce((s, it) => s + n(it.qty) * n(it.price), 0);
  const dv = n(d.discount ?? d.discountRate);
  const discount = Math.min(subtotal, (d.discountType ?? 'percent') === 'percent' ? (subtotal * dv) / 100 : dv);
  const ratio = subtotal ? (subtotal - discount) / subtotal : 1;
  const inclusive = d.taxMode === 'inclusive';
  const perItem = d.taxScope === 'item';
  const lines = d.items.map((it) => {
    const gross = n(it.qty) * n(it.price) * ratio;
    const rate = perItem ? n(it.taxRate) : n(d.taxRate);
    const tax = inclusive ? gross - gross / (1 + rate / 100) : (gross * rate) / 100;
    return { id: it.id, rate, tax, net: inclusive ? gross - tax : gross };
  });
  const tax = lines.reduce((s, l) => s + l.tax, 0);
  const base = lines.reduce((s, l) => s + l.net, 0);
  const shipping = n(d.shipping);
  const deducted = (base * n(d.deductedRate)) / 100;
  const total = base + tax + shipping - deducted;
  const paid = (d.payments ?? []).reduce((s, p) => s + n(p.amount), 0);
  return { subtotal, discount, tax, base, shipping, deducted, total, paid, balance: total - paid, lines };
};

export const getStatus = (d) => {
  if (d.closed) return 'closed';
  if (d.type === 'quote') return 'open';
  const t = calcTotals(d);
  return t.total > 0 && t.balance <= 0.005 ? 'paid' : t.paid > 0 ? 'partial' : 'unpaid';
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Penomoran otomatis, nol di depan dipertahankan (001 -> 002)
export const nextNumber = (list, prefix, suffix) => {
  const re = new RegExp(`^${esc(prefix)}(\\d+)${esc(suffix)}$`);
  let last = null;
  list.forEach((d) => { const m = re.exec(d.number); if (m && (!last || +m[1] > +last)) last = m[1]; });
  return `${prefix}${last ? String(+last + 1).padStart(last.length, '0') : '001'}${suffix}`;
};

export const createDoc = (type, db) => {
  const s = db.settings, inv = type === 'invoice';
  const list = db[inv ? 'invoices' : 'quotes'];
  return {
    id: uid(), type, closed: false, archived: false,
    number: nextNumber(list, inv ? s.invoicePrefix : s.quotePrefix, inv ? s.invoiceSuffix : s.quoteSuffix),
    date: today(), dueDate: today(s.defaultDueDays), currency: s.defaultCurrency, lang: s.defaultLang,
    discountType: 'percent', discount: 0, taxMode: 'exclusive', taxScope: 'total', taxRate: s.defaultTaxRate,
    shipping: 0, deductedRate: 0, payments: [], signature: '', payment: '', notes: '',
    company: {}, client: {}, bank: null, style: null, items: [newItem()],
  };
};
