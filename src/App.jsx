import { useEffect, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import { SECTIONS } from './data/schema.js';
import { configureFormat } from './utils/format.js';
import { supabase } from './lib/supabase.js';
import { useCloudStore, useLocalStore } from './lib/store.js';
import { PlanContext } from './lib/PlanContext.js';
import Sidebar from './components/Sidebar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import DataPage from './pages/DataPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const STATUS = { saving: 'Menyimpan…', saved: '✓ Tersimpan', error: '⚠ Gagal sinkron', local: 'Mode lokal' };

function Shell({ store, user }) {
  const { db, setDb, status, plan } = store;
  const [page, setPage] = useLocalStorage('invoice-builder:page', 'invoices');
  configureFormat(db.settings);
  useEffect(() => { document.documentElement.classList.toggle('dark', !!db.settings.dark); }, [db.settings.dark]);

  let view;
  if (page === 'invoices' || page === 'quotes') view = <DocumentsPage key={page} type={page === 'invoices' ? 'invoice' : 'quote'} db={db} setDb={setDb} />;
  else if (page === 'reports') view = <ReportsPage db={db} />;
  else if (page === 'settings') view = <SettingsPage db={db} setDb={setDb} />;
  else if (SECTIONS[page]) view = <DataPage key={page} section={page} db={db} setDb={setDb} />;

  const footer = (
    <div className="space-y-1 border-t border-slate-700 px-2 pt-3 text-xs text-slate-400">
      {user && <div className="truncate">{user.email}</div>}
      <div>{STATUS[status]}{user && ` · paket ${plan.plan}`}</div>
      {user && <button onClick={() => supabase.auth.signOut()} className="text-sky-300">Keluar</button>}
    </div>
  );

  return (
    <PlanContext.Provider value={plan}>
      <div className="flex min-h-screen print:block">
        <Sidebar page={page} setPage={setPage} modules={db.settings.modules} footer={footer} />
        <main className="min-w-0 flex-1 p-4 print:p-0">{view}</main>
      </div>
    </PlanContext.Provider>
  );
}

function LocalGate() { return <Shell store={useLocalStore()} />; }

function CloudGate({ user }) {
  const store = useCloudStore(user.id);
  if (!store.db) return <p className="p-8 text-slate-500">{store.status === 'error' ? 'Gagal memuat data. Coba muat ulang.' : 'Memuat data…'}</p>;
  return <Shell store={store} user={user} />;
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [view, setView] = useState('landing'); // landing | login | signup
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) return <LocalGate />;
  if (session === undefined) return <p className="p-8 text-slate-500">Memuat…</p>;
  if (session) return <CloudGate key={session.user.id} user={session.user} />;
  if (view === 'landing') return <LandingPage onLogin={() => setView('login')} onSignup={() => setView('signup')} />;
  return <AuthPage initialMode={view} onBack={() => setView('landing')} />;
}
