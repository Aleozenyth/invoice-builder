let fmt = { num: 'en', date: 'YYYY-MM-DD' };
export const configureFormat = (s) => { fmt = { num: s.numFormat ?? 'en', date: s.dateFormat ?? 'YYYY-MM-DD' }; };

export const formatMoney = (amount, currency = 'IDR') => {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(fmt.num === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(n);
  } catch { return `${currency} ${n.toLocaleString()}`; }
};

export const formatDate = (iso) => {
  const [y, m, d] = (iso || '').split('-');
  if (!y) return '';
  return fmt.date === 'DD/MM/YYYY' ? `${d}/${m}/${y}` : fmt.date === 'MM/DD/YYYY' ? `${m}/${d}/${y}` : iso;
};

export const uid = () => Math.random().toString(36).slice(2, 9);
export const today = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + Number(off)); return d.toISOString().slice(0, 10); };
