const FEATURES = [
  ['🧾', 'Invoice & Quote', 'Buat, kirim, dan lacak status faktur dan penawaran dalam satu tempat.'],
  ['💳', 'Pembayaran Sebagian', 'Catat pembayaran bertahap, status lunas terhitung otomatis.'],
  ['🎨', 'Style Profile', 'Atur logo, warna, dan tata letak PDF sesuai identitas bisnis Anda.'],
  ['🌍', 'Multi Bahasa & Mata Uang', 'Dokumen bisa dalam Bahasa Indonesia, Inggris, dan lainnya.'],
  ['🔒', 'Data Terpisah per Akun', 'Setiap pengguna hanya bisa melihat datanya sendiri.'],
  ['📤', 'Ekspor UBL / Peppol', 'Ekspor XML siap pakai untuk sistem e-invoicing.'],
];

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <span className="text-lg font-bold text-indigo-700">Invoice Builder</span>
        <div className="flex gap-2 text-sm">
          <button onClick={onLogin} className="rounded-md px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-50">Masuk</button>
          <button onClick={onSignup} className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Coba Gratis</button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Buat faktur profesional <span className="text-indigo-600">dalam hitungan menit</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Kelola invoice, quote, klien, dan pembayaran dalam satu dashboard. Setiap akun memiliki data yang terpisah dan aman.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={onSignup} className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Mulai Gratis</button>
          <button onClick={onLogin} className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Sudah punya akun</button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(([icon, title, desc]) => (
          <div key={title} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-2 text-2xl">{icon}</div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Invoice Builder. Data Anda tersimpan aman dan terpisah per akun.
      </footer>
    </div>
  );
}
