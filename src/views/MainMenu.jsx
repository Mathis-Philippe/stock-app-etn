import { ClipboardList, Search, Truck, ShoppingCart } from 'lucide-react';

export default function MainMenu({ onNavigate }) {
  const menuItems = [
    { id: 'inventory', title: 'Inventaire', icon: <ClipboardList size={32}/>, color: 'bg-blue-600', desc: 'Comptage et régularisation' },
    { id: 'check', title: 'Vérification', icon: <Search size={32}/>, color: 'bg-emerald-600', desc: 'Consulter un prix ou un stock' },
    { id: 'stock_in', title: 'Réception', icon: <Truck size={32}/>, color: 'bg-orange-600', desc: 'Ajout de marchandise' },
    { id: 'picking', title: 'Commandes', icon: <ShoppingCart size={32}/>, color: 'bg-purple-600', desc: 'Préparation de colis (Bientôt)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-black text-slate-800">Bonjour</h1>
        <p className="text-slate-500">Que souhaitez-vous faire aujourd'hui ?</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className={`${item.color} text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}