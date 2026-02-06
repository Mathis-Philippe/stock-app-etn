import { useState, useMemo } from 'react';
import { useScanListener } from '../hooks/useScannerListener';
import { stockData } from '../stockData';
import NumericKeypad from '../components/NumericKeypad';
import { 
  Scan, CheckCircle2, AlertTriangle, History, 
  Download, ArrowLeft, Eye, X, MapPin, PackageX
} from 'lucide-react';

export default function InventoryView({ onBack, user }) {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [quantityInput, setQuantityInput] = useState("");
  const [message, setMessage] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showUnscanned, setShowUnscanned] = useState(false);

  const unscannedProducts = useMemo(() => {
    return stockData
      .filter(item => !inventory.some(inv => inv.sku === item.sku))
      .sort((a, b) => a.emplacement.localeCompare(b.emplacement));
  }, [inventory]);

  const progressPercentage = Math.round((inventory.length / stockData.length) * 100);
  
  
  const openInputForProduct = (productSku) => {
    const baseProduct = stockData.find(p => p.sku === productSku);
    if (!baseProduct) {
        setMessage({ type: 'error', text: "Code inconnu. Vérifiez l'étiquette et recommencez." });
        return;
    }
    const alreadyCountedItem = inventory.find(item => item.sku === productSku);

    if (alreadyCountedItem) {
        setScannedProduct(baseProduct);
        setQuantityInput(alreadyCountedItem.stock_reel.toString());
        setIsEditingMode(true); 
    } else {
        setScannedProduct(baseProduct);
        setQuantityInput("");
        setIsEditingMode(false);
        setMessage(null);
    }
  };

  useScanListener((detectedSku) => {
        if (scannedProduct) return;
        openInputForProduct(detectedSku);
    });

  const handleNumberClick = (num) => {
    if (quantityInput.length < 5) { 
        setQuantityInput(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setQuantityInput(prev => prev.slice(0, -1));
  };

  const handleValidate = () => {
    if (!scannedProduct) return;
    const countedQty = parseInt(quantityInput);
    
    if (isNaN(countedQty)) return; 

    const gap = countedQty - scannedProduct.stock_theorique;
    const record = {
        ...scannedProduct,
        stock_reel: countedQty,
        ecart: gap,
        heure: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
        operateur: user || 'Anonyme'
    };

    if (isEditingMode) {
        setInventory(prev => prev.map(item => item.sku === scannedProduct.sku ? record : item));
        setMessage({ type: 'success', text: `Stock mis à jour : ${countedQty}` });
    } else {
        setInventory(prev => [record, ...prev]);
        setMessage({ type: 'success', text: `Validé : ${scannedProduct.sku}` });
    }
    setScannedProduct(null);
    setQuantityInput("");
    setIsEditingMode(false);
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFReference;Nom;Stock Theorique;Stock Reel;Ecart;Heure;Operateur\n";
    inventory.forEach(row => {
        csvContent += `${row.sku};"${row.nom}";${row.stock_theorique};${row.stock_reel};${row.ecart};${row.heure};${row.operateur}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaire_${user}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none">
      
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                 <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-lg font-bold leading-tight">Inventaire</h1>
                <p className="text-xs text-slate-400">
                    {inventory.length} / {stockData.length} scannés
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowUnscanned(true)} 
                    className="relative bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-blue-300 hover:bg-slate-700 transition-colors"
                >
                    <Eye size={20} />
                </button>
                <button onClick={downloadCSV} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg hover:bg-slate-700">
                    <Download size={20} />
                </button>
            </div>
          </div>
          
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {message && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 shadow-sm border animate-slide-up ${
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {message.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        {scannedProduct ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-scale-in">
            <div className={`p-4 text-white flex justify-between items-start ${isEditingMode ? 'bg-orange-500' : 'bg-blue-600'}`}>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">
                  {isEditingMode ? 'Modification' : 'Saisie'}
                </p>
                <h2 className="text-2xl font-black truncate">{scannedProduct.sku}</h2>
                <p className="text-white/90 text-sm truncate">{scannedProduct.nom}</p>
              </div>
              <button onClick={() => setScannedProduct(null)} className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                 <History size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex justify-between mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Emplacement</span>
                    <p className="font-bold text-slate-800">{scannedProduct.emplacement}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Théorique</span>
                    <p className="font-bold text-slate-800">{scannedProduct.stock_theorique}</p>
                  </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-4 mb-2 text-center border-2 border-blue-100">
                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantité Réelle</span>
                <div className="h-12 flex items-center justify-center">
                    <span className="text-5xl font-black text-slate-800 tracking-tight">
                        {quantityInput || <span className="text-slate-300">0</span>}
                    </span>
                    <span className="w-1 h-8 bg-blue-500 ml-1 animate-pulse"></span>
                </div>
              </div>

              <NumericKeypad 
                onNumber={handleNumberClick}
                onDelete={handleDelete}
                onValidate={handleValidate}
              />
              
              <button 
                onClick={() => setScannedProduct(null)} 
                className="w-full mt-4 py-3 text-slate-400 font-bold text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 text-slate-400">
            <Scan size={48} className="text-blue-500 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700">Prêt à scanner</h3>
            <p className="text-center text-sm mt-1">Le clavier système n'est plus nécessaire.</p>
          </div>
        )}
      </main>

      {showUnscanned && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowUnscanned(false)}
          />

          <div className="relative bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
            
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <PackageX size={20} className="text-slate-500"/>
                        Produits restants
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Triés par emplacement pour optimiser le trajet
                    </p>
                </div>
                <button 
                    onClick={() => setShowUnscanned(false)}
                    className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={20} className="text-slate-600"/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                {unscannedProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle2 size={40} className="text-green-600"/>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-2">Inventaire terminé !</h4>
                        <p className="text-slate-500">Tous les produits ont été scannés. Vous pouvez télécharger le rapport.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {unscannedProducts.map((item) => (
                            <div 
                                key={item.sku} 
                                className="group bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3"
                            >
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                    <MapPin size={14} className="text-slate-400 mb-0.5"/>
                                    <span className="text-xs font-black text-slate-700">{item.emplacement.split('-')[1] || item.emplacement}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {item.emplacement}
                                        </span>
                                        <h4 className="font-bold text-slate-800 truncate text-sm">{item.sku}</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.nom}</p>
                                </div>

                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-500">Progression</span>
                    <span className="text-blue-600">{Math.round((inventory.length / stockData.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(inventory.length / stockData.length) * 100}%` }}
                    />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}