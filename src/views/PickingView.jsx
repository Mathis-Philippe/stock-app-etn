import { useState, useEffect } from 'react';
import { parseScanData } from '../utils/scanner';
import Header from '../components/Header';
import { 
    ShoppingCart, Check, XCircle, BoxSelect, 
    ChevronRight, User, Calendar, Clock, ArrowRight
} from 'lucide-react';

const MOCK_ORDERS = [
  { 
    id: "CMD-8024", 
    client: "SARL DUPONT", 
    date: "10:30", 
    status: "pending", 
    items: [
        { sku: "1.1/2 GALVA", qty_asked: 10, qty_picked: 0, status: 'pending' },
        { sku: "1.1 GALVA", qty_asked: 20, qty_picked: 0, status: 'pending' }
    ]
  },
  { 
    id: "CMD-8025", 
    client: "M. MARTIN", 
    date: "11:15", 
    status: "pending", 
    items: [
        { sku: "1.3/4 NOIR", qty_asked: 5, qty_picked: 0, status: 'pending' },
        { sku: "1.2 NOIR", qty_asked: 2, qty_picked: 0, status: 'pending' },
        { sku: "1.1/4 GALVA", qty_asked: 50, qty_picked: 0, status: 'pending' }
    ]
  },
  { 
    id: "CMD-8020", 
    client: "ENTREPRISE BATIPRO", 
    date: "09:00", 
    status: "done", 
    items: [
        { sku: "1.3/8 GALVA", qty_asked: 100, qty_picked: 100, status: 'done' }
    ]
  }
];


const PickingSession = ({ order, onBack }) => {
    const [items, setItems] = useState([...order.items]);
    const [feedback, setFeedback] = useState(null);


    const handleScan = (sku) => {
        const index = items.findIndex(i => i.sku === sku);

        if (index === -1) {
            setFeedback({ type: 'error', text: `ERREUR : ${sku} n'est pas dans cette commande !` });
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return;
        }

        const item = items[index];
        if (item.status === 'done') {
            setFeedback({ type: 'info', text: `Article déjà validé.` });
            return;
        }

        const newItems = [...items];
        newItems[index] = { ...item, qty_picked: item.qty_asked, status: 'done' };
        setItems(newItems);
        setFeedback({ type: 'success', text: `Validé : ${item.qty_asked}x ${item.sku}` });
    };

    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();
        const handleKeyDown = (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) || e.key === ' ') {
                e.preventDefault();
            }
            const currentTime = Date.now();
            if (currentTime - lastKeyTime > 2000) buffer = '';
            lastKeyTime = currentTime;
            if (e.key === 'Enter') buffer += " "; 
            else if (e.key.length === 1) buffer += e.key;
            
            const detectedSku = parseScanData(buffer);
            if (detectedSku) {
                handleScan(detectedSku);
                buffer = '';
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items]);

    const doneCount = items.filter(i => i.status === 'done').length;
    const progress = Math.round((doneCount / items.length) * 100);
    const isFinished = doneCount === items.length;

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            <Header 
                title={order.id} 
                subtitle={order.client} 
                onBack={onBack} 
                colorClass="bg-purple-900" 
            />

            {feedback && (
                <div className={`p-4 text-center font-bold text-white animate-fade-in-down ${
                    feedback.type === 'error' ? 'bg-red-600' : 
                    feedback.type === 'info' ? 'bg-blue-500' : 'bg-green-600'
                }`}>
                    {feedback.text}
                </div>
            )}

            <div className="max-w-md mx-auto p-4 pt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-700">Progression</span>
                        <span className="text-2xl font-black text-purple-600">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="space-y-3">
                    {items
                        .sort((a, b) => (a.status === b.status ? 0 : a.status === 'done' ? 1 : -1))
                        .map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                            item.status === 'done' 
                                ? 'bg-green-50 border-green-500 opacity-60' 
                                : 'bg-white border-slate-200 shadow-md border-l-4 border-l-purple-500'
                        }`}>
                            <div>
                                <div className="font-black text-slate-800 text-lg">{item.sku}</div>
                                <div className="text-sm font-medium text-slate-500">
                                    À prendre : <span className="text-black font-bold text-base">{item.qty_asked}</span>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                item.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'
                            }`}>
                                {item.status === 'done' && <Check size={24} strokeWidth={4}/>}
                            </div>
                        </div>
                    ))}
                </div>

                {isFinished && (
                    <div className="mt-8 p-6 bg-green-600 rounded-2xl text-white text-center shadow-lg animate-scale-in">
                        <Check size={48} className="mx-auto mb-2"/>
                        <h3 className="text-2xl font-bold">Commande Complète !</h3>
                        <button onClick={onBack} className="mt-6 bg-white text-green-700 font-bold py-3 px-6 rounded-lg w-full">
                            Retour à la liste
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PickingView({ onBack }) {
    const [selectedOrder, setSelectedOrder] = useState(null);

    if (selectedOrder) {
        return <PickingSession order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            <Header title="Commandes" subtitle="À préparer" onBack={onBack} colorClass="bg-purple-800" />
            
            <div className="max-w-md mx-auto p-4 pt-6">
                <div className="space-y-4">
                    {MOCK_ORDERS.map((order) => (
                        <button 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-purple-300 transition-all text-left group"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        order.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {order.status === 'done' ? 'Terminé' : 'En attente'}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={12}/> {order.date}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 group-hover:text-purple-700 transition-colors">
                                    {order.id}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <User size={14}/> {order.client}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {order.items.length} articles à scanner
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                {order.status === 'done' ? <Check size={20} className="text-green-500"/> : <ArrowRight size={20}/>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}