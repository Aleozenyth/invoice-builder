import { useState } from 'react';
import Field from '../components/Field.jsx';
import { supabase } from '../lib/supabase.js';

export default function AuthPage({ initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode); // login | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const auth = supabase.auth;
    const { error, data } =
      mode === 'login' ? await auth.signInWithPassword({ email, password })
      : mode === 'signup' ? await auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === 'signup' && !data.session) setMsg('Cek email Anda untuk konfirmasi akun.');
    if (mode === 'reset') setMsg('Tautan reset password sudah dikirim ke email Anda.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
        {onBack && <button type="button" onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600">← Kembali</button>}
        <h1 className="text-xl font-bold text-indigo-700">Invoice Builder</h1>
        <p className="text-sm text-slate-500">{mode === 'login' ? 'Masuk ke akun Anda' : mode === 'signup' ? 'Buat akun baru' : 'Reset password'}</p>
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== 'reset' && <Field label="Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />}
        {msg && <p className="text-sm text-amber-600">{msg}</p>}
        <button disabled={busy} className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-50">
          {mode === 'login' ? 'Masuk' : mode === 'signup' ? 'Daftar' : 'Kirim tautan reset'}
        </button>
        <div className="flex justify-between text-sm text-indigo-600">
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Daftar' : 'Kembali masuk'}</button>
          {mode === 'login' && <button type="button" onClick={() => setMode('reset')}>Lupa password?</button>}
        </div>
      </form>
    </div>
  );
}
