import { useState} from 'react';
import { useScanListener } from '../hooks/useScannerListener';
import { stockData } from '../stockData';
import Header from '../components/Header';
import NumericKeypad from '../components/NumericKeypad';
import { Truck, PlusCircle, Save, History, Box, ArrowRight } from 'lucide-react';

export default function StockInView({ onBack }) {
  const [product, setProduct] = useState(null);
  const [addQty, setAddQty] = useState("");
  const [history, setHistory] = useState([]); 


  useScanListener((detectedSku) => {
      const found = stockData.find(p => p.sku === detectedSku);
      if (found) {
          setProduct(found);
          setAddQty("");
      } else {
          if(navigator.vibrate) navigator.vibrate(200);
          alert("Produit inconnu !");
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
    if (!product || isNaN(qty) || qty <= 0) return;

    const newEntry = {
        sku: product.sku,
        nom: product.nom,
        qty: qty,
        time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})
    };

    setHistory(prev => [newEntry, ...prev]);
    setProduct(null);
    setAddQty("");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 select-none">
        <Header title="Réception" subtitle="Entrée de stock" onBack={onBack} colorClass="bg-orange-700" />

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
                            <div key={i} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                        <Box size={20}/>
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
    </div>
  );
}