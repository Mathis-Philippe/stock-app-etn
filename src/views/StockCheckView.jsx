import { useState, useEffect } from 'react';
import { parseScanData } from '../utils/scanner';
import { stockData } from '../stockData';
import Header from '../components/Header';
import { Search, MapPin, Box } from 'lucide-react';

export default function StockCheckView({ onBack }) {
  const [scannedProduct, setScannedProduct] = useState(null);

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
        const product = stockData.find(p => p.sku === detectedSku);
        if (product) setScannedProduct(product);
        else alert(`Produit inconnu : ${detectedSku}`);
        buffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Header title="Vérification Rapide" subtitle="Mode consultation uniquement" onBack={onBack} colorClass="bg-emerald-800" />
      
      <div className="max-w-md mx-auto p-4 pt-8">
          {scannedProduct ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100 animate-scale-in">
                  <div className="bg-emerald-600 p-6 text-white text-center">
                      <p className="text-emerald-100 text-xs uppercase tracking-widest mb-2">Résultat du scan</p>
                      <h2 className="text-3xl font-black">{scannedProduct.sku}</h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Désignation</p>
                          <p className="text-xl font-bold text-slate-800 leading-tight">{scannedProduct.nom}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                              <MapPin className="mx-auto text-slate-400 mb-2" size={20}/>
                              <p className="text-xs text-slate-500 uppercase font-bold">Emplacement</p>
                              <p className="text-2xl font-black text-slate-800">{scannedProduct.emplacement}</p>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                              <Box className="mx-auto text-emerald-400 mb-2" size={20}/>
                              <p className="text-xs text-emerald-600 uppercase font-bold">En Stock</p>
                              <p className="text-2xl font-black text-emerald-600">{scannedProduct.stock_theorique}</p>
                          </div>
                      </div>

                      <button 
                        onClick={() => setScannedProduct(null)} 
                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                      >
                        Scanner un autre produit
                      </button>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Search size={80} className="mb-6 text-slate-300"/>
                  <h3 className="text-2xl font-bold text-slate-400">En attente de scan...</h3>
                  <p className="text-slate-400 text-center mt-2 max-w-xs">
                      Passez la douchette sur un code barre pour voir sa fiche technique.
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}