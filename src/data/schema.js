import { uid } from '../utils/format.js';

const party = [
  { key: 'name', label: 'Nama' },
  { key: 'address', label: 'Alamat', type: 'textarea' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telepon' },
  { key: 'taxId', label: 'NPWP / VAT' },
  { key: 'city', label: 'Kota' },
  { key: 'postal', label: 'Kode Pos' },
  { key: 'country', label: 'Negara (2 huruf, mis. ID)' },
];

// Halaman CRUD generik (menu Data + Style Profiles)
export const SECTIONS = {
  banks: { fields: [{ key: 'name', label: 'Nama Bank' }, { key: 'account', label: 'No. Rekening / IBAN' }, { key: 'swift', label: 'SWIFT / BIC' }, { key: 'address', label: 'Alamat Bank', type: 'textarea' }], columns: ['name', 'account'] },
  items: { fields: [{ key: 'name', label: 'Nama Item' }, { key: 'price', label: 'Harga Satuan', type: 'number' }, { key: 'unit', label: 'Satuan', ref: 'units' }, { key: 'category', label: 'Kategori', ref: 'categories' }, { key: 'taxRate', label: 'Pajak (%)', type: 'number' }], columns: ['name', 'price', 'unit', 'category'] },
  currencies: { fields: [{ key: 'code', label: 'Kode (mis. IDR)' }, { key: 'symbol', label: 'Simbol' }, { key: 'name', label: 'Nama' }], columns: ['code', 'symbol', 'name'] },
  units: { fields: [{ key: 'name', label: 'Nama Satuan' }, { key: 'abbr', label: 'Singkatan' }], columns: ['name', 'abbr'] },
  categories: { fields: [{ key: 'name', label: 'Nama Kategori' }], columns: ['name'] },
  clients: { fields: party, columns: ['name', 'email', 'phone'] },
  businesses: { fields: [...party, { key: 'logo', label: 'Logo', type: 'image' }], columns: ['name', 'email', 'phone'] },
  styleProfiles: { fields: [{ key: 'name', label: 'Nama Profil' }, { key: 'accent', label: 'Warna Aksen', type: 'color' },
    { key: 'font', label: 'Font', type: 'select', opts: ['Helvetica', 'Times-Roman', 'Courier', 'Roboto', 'Inter'] },
    { key: 'fontSize', label: 'Ukuran Font (px)', type: 'number' }, { key: 'logoSize', label: 'Ukuran Logo (px)', type: 'number' },
    { key: 'page', label: 'Ukuran Kertas', type: 'select', opts: ['A4', 'Letter'] },
    { key: 'headerStyle', label: 'Gaya Header Tabel', type: 'select', opts: ['filled', 'outline'] },
    { key: 'rowStyle', label: 'Gaya Baris', type: 'select', opts: ['lines', 'striped', 'none'] },
    { key: 'titleLabel', label: 'Label Judul Kustom' }, { key: 'watermark', label: 'Teks Watermark' },
    { key: 'paidWatermark', label: 'Watermark PAID', type: 'checkbox' }, { key: 'uppercase', label: 'Label Huruf Besar', type: 'checkbox' },
    { key: 'showRow', label: 'Tampilkan No. Baris', type: 'checkbox' }, { key: 'showUnit', label: 'Tampilkan Satuan', type: 'checkbox' },
    { key: 'showQty', label: 'Tampilkan Jumlah', type: 'checkbox' }], columns: ['name', 'accent', 'font', 'page'] },
};

export const PAGES = {
  invoices: { label: 'Invoices', icon: '🧾' },
  quotes: { label: 'Quotes', icon: '📋' },
  banks: { label: 'Banks', icon: '🏦' },
  items: { label: 'Items', icon: '📦' },
  currencies: { label: 'Currencies', icon: '💲' },
  units: { label: 'Units', icon: '⏳' },
  categories: { label: 'Categories', icon: '🔷' },
  clients: { label: 'Clients', icon: '👥' },
  businesses: { label: 'Businesses', icon: '🏢' },
  styleProfiles: { label: 'Style Profiles', icon: '🎨' },
  reports: { label: 'Reports', icon: '📊' },
  settings: { label: 'Settings', icon: '⚙️' },
};

export const GROUPS = [
  { label: 'Documents', icon: '📁', items: ['invoices', 'quotes'] },
  { label: 'Data', icon: '🗂️', items: ['banks', 'items', 'currencies', 'units', 'categories', 'clients', 'businesses'] },
];
export const SINGLES = ['styleProfiles', 'reports', 'settings'];

export const createEmptyDb = () => ({
  invoices: [],
  quotes: [],
  banks: [],
  items: [],
  currencies: [
    { id: uid(), code: 'IDR', symbol: 'Rp', name: 'Rupiah' },
    { id: uid(), code: 'USD', symbol: '$', name: 'US Dollar' },
    { id: uid(), code: 'EUR', symbol: '€', name: 'Euro' },
  ],
  units: [{ id: uid(), name: 'Pieces', abbr: 'pcs' }, { id: uid(), name: 'Hours', abbr: 'hrs' }],
  categories: [],
  clients: [],
  businesses: [],
  styleProfiles: [{ id: uid(), name: 'Default', accent: '#4338ca', font: 'Helvetica', fontSize: 12, logoSize: 90, page: 'A4', headerStyle: 'filled', rowStyle: 'lines', showRow: true, showUnit: true, showQty: true }],
  settings: { defaultCurrency: 'IDR', defaultTaxRate: 0, defaultDueDays: 14, defaultLang: 'en', numFormat: 'en', dateFormat: 'YYYY-MM-DD', invoicePrefix: 'INV-', invoiceSuffix: '', quotePrefix: 'QUO-', quoteSuffix: '', fileName: '{number}-{client}', dark: false, modules: { quotes: true, reports: true, styleProfiles: true, ubl: true } },
});
