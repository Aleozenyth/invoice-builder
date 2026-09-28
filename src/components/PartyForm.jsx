import Field from './Field.jsx';

export default function PartyForm({ title, data, onChange }) {
  const set = (key) => (e) => onChange(key, e.target.value);
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama" value={data.name} onChange={set('name')} placeholder="Nama / perusahaan" className="sm:col-span-2" />
        <Field label="Alamat" as="textarea" rows={2} value={data.address} onChange={set('address')} className="sm:col-span-2" />
        <Field label="Email" type="email" value={data.email} onChange={set('email')} />
        <Field label="Telepon" value={data.phone} onChange={set('phone')} />
      </div>
    </section>
  );
}
