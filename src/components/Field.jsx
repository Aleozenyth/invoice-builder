export default function Field({ label, as = 'input', className = '', ...props }) {
  const Tag = as;
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-slate-600">{label}</span>
      <Tag
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        {...props}
      />
    </label>
  );
}
