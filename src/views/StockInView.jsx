import { useState, useEffect } from 'react';
import { useScanListener } from '../hooks/useScannerListener';
import { stockData } from '../stockData';
import Header from '../components/Header';
import NumericKeypad from '../components/NumericKeypad';
import toast from 'react-hot-toast';
import { logAction } from '../utils/audit';
import { Truck, PlusCircle, Save, History, Box, ArrowRight, Download, X, Trash2, Check, Pencil } from 'lucide-react';

export default function StockInView({ onBack, user }) {
  const [product, setProduct] = useState(null);
  const [addQty, setAddQty] = useState("");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('app_stock_in_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingItem, setEditingItem] = useState(null); 
  const [editQty, setEditQty] = useState("");


  useEffect(() => {
     localStorage.setItem('app_stock_in_history', JSON.stringify(history));
  }, [history]);


  useScanListener((detectedSku) => {
    if (editingItem) setEditingItem(null);

    const found = stockData.find(p => p.sku === detectedSku);
    if (found) {
        setProduct(found);
        setAddQty("");
        toast.success(`Produit identifié : ${found.nom}`);
    } else {
        if(navigator.vibrate) navigator.vibrate(200);
        toast.error("Produit inconnu ! Vérifiez le code-barres.");
    }
    });


  const handleNumberClick = (num) => {
    if (addQty.length < 5) setAddQty(prev => prev + num);
  };

  const handleDelete = () => {
    setAddQty(prev => prev.slice(0, -1));
  };


  const handleValidate = () => {
    const qty = parseInt(addQty);
    if (!product || isNaN(qty) || qty <= 0) {
        toast.error("Quantité invalide !");
        return;
    }

    const newEntry = {
        sku: product.sku,
        nom: product.nom,
        qty: qty,
        time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
        user: user || 'Anonyme'
    };

    setHistory(prev => [newEntry, ...prev]);
    
    logAction(user, "ENTREE_STOCK", `Ajout de ${qty}x ${product.nom} (${product.sku})`);

    setHistory(prev => [newEntry, ...prev]);
    setProduct(null);
    setAddQty("");
  };

  const handleHistoryClick = (item, index) => {
    setEditingItem({ ...item, index }); 
    setEditQty(item.qty.toString());
  };

  const saveEdit = () => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty <= 0) return; 

   const oldQty = history[editingItem.index].qty;
    const newHistory = [...history];
    newHistory[editingItem.index] = { ...newHistory[editingItem.index], qty: qty };
    setHistory(newHistory);
    
    logAction(user, "CORRECTION_RECEPTION", `Modification ${editingItem.sku}: ${oldQty} -> ${qty}`);
    toast.success("Quantité corrigée");
    setEditingItem(null);
  };

  const deleteItem = () => {
    if(confirm("Supprimer cette entrée ?")) {
        const newHistory = history.filter((_, i) => i !== editingItem.index);
        setHistory(newHistory);
        setEditingItem(null);
    }
  };

const downloadCSV = () => {
    if (history.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,\uFEFFReference;Nom;Quantite Ajoutee;Heure;Operateur\n";
    
    history.forEach(row => {
        csvContent += `${row.sku};"${row.nom}";${row.qty};${row.time};${row.user}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reception_${user}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

return (
    <div className="min-h-screen bg-slate-50 pb-10 select-none relative">
        <Header title="Réception" subtitle="Entrée de stock" onBack={onBack} colorClass="bg-orange-700">
            {history.length > 0 && (
                <button 
                    onClick={downloadCSV} 
                    className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                    title="Exporter la liste"
                >
                    <Download size={20} />
                </button>
            )}
        </Header>

        <div className="max-w-md mx-auto p-4 pt-6">
            
            {product ? (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-500 overflow-hidden animate-scale-in">
                    <div className="bg-orange-100 p-4 border-b border-orange-200">
                        <span className="text-orange-800 font-bold text-xs uppercase">Ajout de stock sur :</span>
                        <h2 className="text-2xl font-black text-slate-800">{product.sku}</h2>
                        <p className="text-sm text-slate-600 truncate">{product.nom}</p>
                    </div>
                    
                    <div className="p-4">
                        <div className="bg-slate-100 rounded-xl p-4 mb-4 text-center border-2 border-orange-100 relative">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantité à ajouter</span>
                            <div className="h-12 flex items-center justify-center">
                                <span className="text-5xl font-black text-slate-800 tracking-tight">
                                    {addQty || <span className="text-slate-300">0</span>}
                                </span>
                                {addQty && <span className="text-xl font-bold text-orange-500 ml-2 animate-bounce">+</span>}
                            </div>
                        </div>

                
                        <NumericKeypad 
                            onNumber={handleNumberClick}
                            onDelete={handleDelete}
                            onValidate={handleValidate}
                        />

                        <button 
                            onClick={() => { setProduct(null); setAddQty(""); }}
                            className="w-full mt-4 text-slate-400 font-bold text-sm underline"
                        >
                            Annuler / Scanner un autre
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center">
                    <Truck size={48} className="mx-auto text-orange-300 mb-4 animate-pulse"/>
                    <h3 className="text-xl font-bold text-orange-800">Prêt à recevoir</h3>
                    <p className="text-orange-600/70 text-sm mt-1">Scannez un carton entrant</p>
                </div>
            )}
            
            {history.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-3 ml-1">
                        <History size={16} className="text-slate-400"/>
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Reçus à l'instant</h3>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {history.map((h, i) => (
                            <div 
                                key={i} 
                                onClick={() => handleHistoryClick(h, i)}
                                className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-orange-50 cursor-pointer active:bg-orange-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-700 relative">
                                        <Box size={20}/>
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow border border-slate-100">
                                            <Pencil size={10} className="text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700">{h.sku}</div>
                                        <div className="text-xs text-slate-400">{h.time}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-green-600">+{h.qty}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                    
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Pencil size={18} className="text-orange-500"/>
                            Modifier l'entrée
                        </h3>
                        <button onClick={() => setEditingItem(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="mb-6 text-center">
                            <div className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-1">Article sélectionné</div>
                            <div className="text-2xl font-black text-slate-800">{editingItem.sku}</div>
                            <div className="text-slate-600 text-sm truncate px-4">{editingItem.nom}</div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">Quantité reçue</label>
                            <div className="flex items-center gap-3 justify-center">
                                <button 
                                    onClick={() => setEditQty(prev => Math.max(1, parseInt(prev||0) - 1).toString())}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl font-bold text-xl text-slate-600 active:bg-slate-200 active:scale-95 transition-all"
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={editQty}
                                    onChange={(e) => setEditQty(e.target.value)}
                                    className="w-24 p-2 py-3 text-center text-3xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none"
                                />
                                <button 
                                    onClick={() => setEditQty(prev => (parseInt(prev||0) + 1).toString())}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl font-bold text-xl text-slate-600 active:bg-slate-200 active:scale-95 transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={deleteItem}
                                className="flex-1 flex flex-col items-center justify-center gap-1 p-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
                            >
                                <Trash2 size={20} />
                                <span className="text-xs">Supprimer</span>
                            </button>
                            <button 
                                onClick={saveEdit}
                                className="flex-[2] flex items-center justify-center gap-2 p-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 active:scale-95 shadow-lg shadow-green-200 transition-all"
                            >
                                <Check size={20} />
                                Valider la correction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}