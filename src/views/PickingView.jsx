import { useState, useEffect } from 'react';
import { parseScanData } from '../utils/scanner';
import Header from '../components/Header';
import { 
    ShoppingCart, Check, XCircle, BoxSelect, 
    ChevronRight, User, Calendar, Clock, ArrowRight, Lock
} from 'lucide-react';

const INITIAL_ORDERS = [
  { 
    id: "CMD-8024", 
    client: "SARL DUPONT", 
    date: "10:30", 
    status: "pending", 
    isLocked: false, 
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
    isLocked: false,
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
    isLocked: false,
    items: [
        { sku: "1.3/8 GALVA", qty_asked: 100, qty_picked: 100, status: 'done' }
    ]
  }
];

const PickingSession = ({ order, onBack, onComplete, onUpdateOrder }) => {
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
        
        onUpdateOrder(order.id, newItems);
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
                        <button 
                            onClick={onComplete} 
                            className="mt-6 bg-white text-green-700 font-bold py-3 px-6 rounded-lg w-full hover:bg-green-50 transition-colors"
                        >
                            Valider et Retourner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PickingView({ onBack }) {
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('app_picking_orders');
        return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    });
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        localStorage.setItem('app_picking_orders', JSON.stringify(orders));
    }, [orders]);

    const handleSelectOrder = (order) => {
        if (order.status === 'done') {
            alert("Cette commande est déjà terminée !");
            return;
        }

        if (order.isLocked) {
            alert("Cette commande est en cours de traitement par un autre utilisateur.");
            return;
        }

        const updatedOrders = orders.map(o => 
            o.id === order.id ? { ...o, isLocked: true } : o
        );
        setOrders(updatedOrders);
        setSelectedOrderId(order.id);
    };

    const handleUpdateItems = (orderId, newItems) => {
        setOrders(prevOrders => prevOrders.map(o => 
            o.id === orderId ? { ...o, items: newItems } : o
        ));
    };

    const handleExitSession = () => {
        setOrders(prevOrders => prevOrders.map(o => 
            o.id === selectedOrderId ? { ...o, isLocked: false } : o
        ));
        setSelectedOrderId(null);
    };

    const handleCompleteSession = () => {
        setOrders(prevOrders => prevOrders.map(o => 
            o.id === selectedOrderId ? { ...o, status: 'done', isLocked: false } : o
        ));
        setSelectedOrderId(null);
    };

    const activeOrder = orders.find(o => o.id === selectedOrderId);

    if (activeOrder) {
        return (
            <PickingSession 
                order={activeOrder} 
                onBack={handleExitSession} 
                onComplete={handleCompleteSession}
                onUpdateOrder={handleUpdateItems}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            <Header title="Commandes" subtitle="À préparer" onBack={onBack} colorClass="bg-purple-800" />
            
            <div className="max-w-md mx-auto p-4 pt-6">
                <div className="space-y-4">
                    {orders.map((order) => {
                        const isDone = order.status === 'done';
                        const isLocked = order.isLocked;

                        return (
                            <button 
                                key={order.id}
                                onClick={() => handleSelectOrder(order)}
                                className={`w-full p-5 rounded-2xl shadow-sm border flex justify-between items-center transition-all text-left group relative overflow-hidden
                                    ${isDone 
                                        ? 'bg-slate-100 border-slate-200 opacity-75 cursor-not-allowed' 
                                        : 'bg-white border-slate-200 hover:shadow-md hover:border-purple-300'
                                    }
                                `}
                            >
                                {isLocked && !isDone && (
                                    <div className="absolute inset-0 bg-slate-50/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                        <div className="bg-white px-3 py-1 rounded-full shadow-sm border flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Lock size={12} /> En cours...
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {isDone ? 'Terminé' : 'En attente'}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12}/> {order.date}
                                        </span>
                                    </div>
                                    <h3 className={`text-lg font-black transition-colors ${isDone ? 'text-slate-500' : 'text-slate-800 group-hover:text-purple-700'}`}>
                                        {order.id}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                        <User size={14}/> {order.client}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {order.items.length} articles à scanner
                                    </p>
                                </div>

                                <div className={`p-3 rounded-full transition-colors ${
                                    isDone 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-slate-50 group-hover:bg-purple-50 group-hover:text-purple-600'
                                }`}>
                                    {isDone ? <Check size={20}/> : <ArrowRight size={20}/>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}