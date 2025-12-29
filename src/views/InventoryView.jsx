import { useEffect, useState } from 'react';
import { parseScanData } from '../utils/scanner';
import { stockData } from '../stockData';
import Header from '../components/Header';
import NumericKeypad from '../components/NumericKeypad';
import { 
  Scan, Box, CheckCircle2, AlertTriangle, History, 
  Download, Edit3, PackageCheck, ArrowLeft
} from 'lucide-react';

export default function InventoryView({ onBack }) {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [quantityInput, setQuantityInput] = useState("");
  const [message, setMessage] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const openInputForProduct = (productSku) => {
    const baseProduct = stockData.find(p => p.sku === productSku);
    if (!baseProduct) {
        setMessage({ type: 'error', text: `Produit inconnu : ${productSku}` });
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

  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) || e.key === ' ') {
            e.preventDefault();
        }
      if (scannedProduct) return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 2000) buffer = '';
      lastKeyTime = currentTime;
      if (e.key === 'Enter') buffer += " "; 
      else if (e.key.length === 1) buffer += e.key;
      
      const detectedSku = parseScanData(buffer);
      if (detectedSku) {
        openInputForProduct(detectedSku);
        buffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scannedProduct, inventory]);

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
    
    if (isNaN(countedQty)) {
        return; 
    }

    const gap = countedQty - scannedProduct.stock_theorique;
    const record = {
        ...scannedProduct,
        stock_reel: countedQty,
        ecart: gap,
        heure: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})
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
    let csvContent = "data:text/csv;charset=utf-8,Reference,Nom,Stock Theorique,Stock Reel,Ecart,Heure\n";
    inventory.forEach(row => {
        csvContent += `${row.sku},${row.nom},${row.stock_theorique},${row.stock_reel},${row.ecart},${row.heure}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaire_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };
  const progress = Math.round((inventory.length / stockData.length) * 100);

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
                <p className="text-xs text-slate-400">Terminal de saisie</p>
              </div>
            </div>
            <button onClick={downloadCSV} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg">
              <Download size={16} />
            </button>
          </div>
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {message && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 shadow-sm border ${
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
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
            <p className="text-center text-sm mt-1">
              Le clavier système n'est plus nécessaire.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}