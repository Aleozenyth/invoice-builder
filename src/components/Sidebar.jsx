import { useState } from 'react';
import { GROUPS, PAGES, SINGLES } from '../data/schema.js';

export default function Sidebar({ page, setPage, modules = {}, footer }) {
  const on = (id) => !(id === 'quotes' && modules.quotes === false) && !(id === 'reports' && modules.reports === false) && !(id === 'styleProfiles' && modules.styleProfiles === false);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState({ Documents: true, Data: true });

  const btn = (id, indent) => (
    <button
      key={id}
      title={PAGES[id].label}
      onClick={() => setPage(id)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm ${
        page === id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
      } ${indent && !collapsed ? 'pl-9' : ''}`}
    >
      <span>{PAGES[id].icon}</span>
      {!collapsed && <span>{PAGES[id].label}</span>}
    </button>
  );

  return (
    <nav className={`flex shrink-0 flex-col gap-1 bg-slate-900 p-2 print:hidden ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="mb-2 flex items-center justify-between border-b border-slate-700 px-2 py-3">
        {!collapsed && <span className="text-lg font-semibold text-sky-300">Invoice Builder</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-300" aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {GROUPS.map((g) => (
        <div key={g.label} className="mb-1 border-b border-slate-800 pb-1">
          <button
            onClick={() => setOpen({ ...open, [g.label]: !open[g.label] })}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-100"
          >
            <span>{g.icon}</span>
            {!collapsed && <><span className="flex-1 text-left">{g.label}</span><span>{open[g.label] ? '⌃' : '⌄'}</span></>}
          </button>
          {(open[g.label] || collapsed) && g.items.filter(on).map((id) => btn(id, true))}
        </div>
      ))}

      {SINGLES.filter(on).map((id) => btn(id, false))}
      {!collapsed && footer && <div className="mt-auto">{footer}</div>}
    </nav>
  );
}
