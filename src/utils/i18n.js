const K = 'invoice quote date due from billTo item unit qty price total subtotal discount tax shipping deducted paid balance payment notes signature'.split(' ');
const V = {
  en: ['INVOICE','QUOTE','Date','Due date','From','Bill to','Item','Unit','Qty','Unit cost','Total','Subtotal','Discount','Tax','Shipping','Tax deducted','Paid','Balance due','Payment information','Notes','Signature'],
  id: ['FAKTUR','PENAWARAN','Tanggal','Jatuh tempo','Dari','Tagihan untuk','Item','Satuan','Jml','Harga','Total','Subtotal','Diskon','Pajak','Ongkir','Pajak dipotong','Dibayar','Sisa tagihan','Info pembayaran','Catatan','Tanda tangan'],
  fr: ['FACTURE','DEVIS','Date','Échéance','De','Facturé à','Article','Unité','Qté','Prix unit.','Total','Sous-total','Remise','TVA','Livraison','Taxe déduite','Payé','Solde dû','Informations de paiement','Notes','Signature'],
  de: ['RECHNUNG','ANGEBOT','Datum','Fällig am','Von','Rechnung an','Artikel','Einheit','Menge','Einzelpreis','Gesamt','Zwischensumme','Rabatt','Steuer','Versand','Abzugssteuer','Bezahlt','Restbetrag','Zahlungsinformationen','Notizen','Unterschrift'],
};
export const LANGS = Object.keys(V);
export const labels = (lang) => Object.fromEntries(K.map((k, i) => [k, (V[lang] ?? V.en)[i]]));
