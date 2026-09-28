import { useEffect, useRef, useState } from 'react';
import { createEmptyDb } from '../data/schema.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { supabase } from './supabase.js';
import { PLAN_LIMITS } from './PlanContext.js';

export const normalizeDb = (raw) => {
  const d = createEmptyDb();
  return { ...d, ...raw, settings: { ...d.settings, ...raw?.settings, modules: { ...d.settings.modules, ...raw?.settings?.modules } } };
};

// Mode lokal: LocalStorage
export function useLocalStore() {
  const [raw, setRaw] = useLocalStorage('invoice-builder:v2', createEmptyDb());
  return { db: normalizeDb(raw), setDb: (fn) => setRaw((p) => fn(normalizeDb(p))), status: 'local', plan: { plan: 'local', limit: Infinity } };
}

// Mode cloud: satu dokumen JSON per pengguna di Supabase (dipisahkan oleh RLS), autosave 0,8 dtk
export function useCloudStore(userId) {
  const [raw, setRaw] = useState(null);
  const [status, setStatus] = useState('loading');
  const [plan, setPlan] = useState('free');
  const dirty = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, s] = await Promise.all([
        supabase.from('user_data').select('data').eq('user_id', userId).maybeSingle(),
        supabase.from('subscriptions').select('plan,status').eq('user_id', userId).maybeSingle(),
      ]);
      if (!alive) return;
      if (d.error) return setStatus('error');
      let init = d.data?.data;
      if (!init) { // login pertama: tawarkan impor data lokal dari browser ini
        try {
          const local = JSON.parse(localStorage.getItem('invoice-builder:v2'));
          if (local && window.confirm('Impor data yang ada di browser ini ke akun Anda?')) init = local;
        } catch { /* abaikan */ }
        dirty.current = true;
      }
      setPlan(s.data?.status === 'active' ? s.data.plan : 'free');
      setRaw(init ?? createEmptyDb());
      setStatus('saved');
    })();
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => {
    if (raw === null || !dirty.current) return;
    setStatus('saving');
    const t = setTimeout(async () => {
      const { error } = await supabase.from('user_data').upsert({ user_id: userId, data: raw, updated_at: new Date().toISOString() });
      if (!error) dirty.current = false;
      setStatus(error ? 'error' : 'saved');
    }, 800);
    return () => clearTimeout(t);
  }, [raw, userId]);

  return {
    db: raw && normalizeDb(raw),
    setDb: (fn) => { dirty.current = true; setRaw((p) => fn(normalizeDb(p))); },
    status,
    plan: { plan, limit: PLAN_LIMITS[plan] ?? PLAN_LIMITS.free },
  };
}
