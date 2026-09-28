import { calcTotals } from './calc.js';

const x = (v) => String(v ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const f = (v) => (Number(v) || 0).toFixed(2);

const party = (p, tag) => `<cac:${tag}><cac:Party><cbc:EndpointID schemeID="EM">${x(p.email)}</cbc:EndpointID>
<cac:PartyName><cbc:Name>${x(p.name)}</cbc:Name></cac:PartyName>
<cac:PostalAddress><cbc:StreetName>${x(p.address)}</cbc:StreetName><cbc:CityName>${x(p.city)}</cbc:CityName><cbc:PostalZone>${x(p.postal)}</cbc:PostalZone><cac:Country><cbc:IdentificationCode>${x(p.country || 'ID')}</cbc:IdentificationCode></cac:Country></cac:PostalAddress>
<cac:PartyTaxScheme><cbc:CompanyID>${x(p.taxId)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>
<cac:PartyLegalEntity><cbc:RegistrationName>${x(p.name)}</cbc:RegistrationName></cac:PartyLegalEntity>
<cac:Contact><cbc:Telephone>${x(p.phone)}</cbc:Telephone><cbc:ElectronicMail>${x(p.email)}</cbc:ElectronicMail></cac:Contact></cac:Party></cac:${tag}>`;

// mode: 'peppol' (BIS Billing 3.0) | 'xrechnung'
export function buildUbl(d, mode = 'peppol') {
  const t = calcTotals(d), c = d.currency;
  const cust = mode === 'xrechnung'
    ? 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0'
    : 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
  const cat = (r) => `<cac:TaxCategory><cbc:ID>${r > 0 ? 'S' : 'Z'}</cbc:ID><cbc:Percent>${f(r)}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>`;
  const groups = {};
  t.lines.forEach((l) => { const g = (groups[l.rate] ??= { net: 0, tax: 0 }); g.net += l.net; g.tax += l.tax; });
  const items = d.items.map((it, i) => {
    const l = t.lines[i], q = Number(it.qty) || 1;
    return `<cac:InvoiceLine><cbc:ID>${i + 1}</cbc:ID><cbc:InvoicedQuantity unitCode="C62">${q}</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="${c}">${f(l.net)}</cbc:LineExtensionAmount><cac:Item><cbc:Name>${x(it.name)}</cbc:Name><cac:ClassifiedTaxCategory><cbc:ID>${l.rate > 0 ? 'S' : 'Z'}</cbc:ID><cbc:Percent>${f(l.rate)}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory></cac:Item><cac:Price><cbc:PriceAmount currencyID="${c}">${f(l.net / q)}</cbc:PriceAmount></cac:Price></cac:InvoiceLine>`;
  }).join('\n');
  const prepaid = t.paid + t.deducted;
  const excl = t.base + t.shipping;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
<cbc:CustomizationID>${cust}</cbc:CustomizationID>
<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
<cbc:ID>${x(d.number)}</cbc:ID><cbc:IssueDate>${d.date}</cbc:IssueDate><cbc:DueDate>${d.dueDate}</cbc:DueDate>
<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode><cbc:DocumentCurrencyCode>${c}</cbc:DocumentCurrencyCode>
<cbc:BuyerReference>${x(d.client.name || d.number)}</cbc:BuyerReference>
${party(d.company, 'AccountingSupplierParty')}
${party(d.client, 'AccountingCustomerParty')}
<cac:PaymentMeans><cbc:PaymentMeansCode>30</cbc:PaymentMeansCode><cac:PayeeFinancialAccount><cbc:ID>${x(d.bank?.account)}</cbc:ID></cac:PayeeFinancialAccount></cac:PaymentMeans>
<cac:TaxTotal><cbc:TaxAmount currencyID="${c}">${f(t.tax)}</cbc:TaxAmount>${Object.entries(groups).map(([r, g]) => `<cac:TaxSubtotal><cbc:TaxableAmount currencyID="${c}">${f(g.net)}</cbc:TaxableAmount><cbc:TaxAmount currencyID="${c}">${f(g.tax)}</cbc:TaxAmount>${cat(+r)}</cac:TaxSubtotal>`).join('')}</cac:TaxTotal>
<cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="${c}">${f(t.base)}</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="${c}">${f(excl)}</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="${c}">${f(excl + t.tax)}</cbc:TaxInclusiveAmount><cbc:PrepaidAmount currencyID="${c}">${f(prepaid)}</cbc:PrepaidAmount><cbc:PayableAmount currencyID="${c}">${f(excl + t.tax - prepaid)}</cbc:PayableAmount></cac:LegalMonetaryTotal>
${items}
</Invoice>`;
}

export const download = (name, text, type = 'application/xml') => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
};
