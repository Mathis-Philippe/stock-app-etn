import { ArrowLeft } from 'lucide-react';

export default function Header({ title, subtitle, onBack, colorClass = "bg-slate-900" }) {
  return (
    <header className={`${colorClass} text-white shadow-lg sticky top-0 z-50`}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}