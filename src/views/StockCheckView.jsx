import { useState } from 'react';
import { useScanListener } from '../hooks/useScannerListener';
import { stockData } from '../stockData';
import Header from '../components/Header';
import { Search, MapPin, Box, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { logAction } from '../utils/audit';

export default function StockCheckView({ onBack, user }) { 
  const [scannedProduct, setScannedProduct] = useState(null);

  useScanListener((detectedSku) => {
      const product = stockData.find(p => p.sku === detectedSku);
      
      if (product) {
          setScannedProduct(product);
          
          toast.success("Produit trouvé !");
          
          logAction(user, "CONSULTATION", `Vérification de ${product.sku} (${product.nom})`);
      } else {
          if(navigator.vibrate) navigator.vibrate(200);
          toast.error("Ce code n'est pas reconnu. Essayez de scanner à nouveau.");
      }
  });


  const stockValue = scannedProduct ? (scannedProduct.stock_theorique || scannedProduct.qty) : 0;
  const isLowStock = stockValue < 5;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Header title="Vérification Rapide" subtitle="Mode consultation uniquement" onBack={onBack} colorClass="bg-emerald-800" />
      
      <div className="max-w-md mx-auto p-4 pt-8">
          {scannedProduct ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100 animate-scale-in">
                  
                  <div className="bg-emerald-600 p-6 text-white text-center relative overflow-hidden">
                      <p className="text-emerald-100 text-xs uppercase tracking-widest mb-2 relative z-10">Résultat du scan</p>
                      <h2 className="text-3xl font-black relative z-10">{scannedProduct.sku}</h2>
                      
                      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Box size={100} />
                      </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Désignation</p>
                          <p className="text-xl font-bold text-slate-800 leading-tight">{scannedProduct.nom}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100 flex flex-col items-center justify-center">
                              <MapPin className="text-slate-400 mb-2" size={24}/>
                              <p className="text-xs text-slate-500 uppercase font-bold">Emplacement</p>
                              <p className="text-lg font-black text-slate-800">{scannedProduct.emplacement || "N/A"}</p>
                          </div>
                          
                          <div className={`p-4 rounded-xl text-center border flex flex-col items-center justify-center transition-colors duration-300 ${
                              isLowStock 
                              ? 'bg-red-50 border-red-200' 
                              : 'bg-emerald-50 border-emerald-100' 
                          }`}>
                              {isLowStock ? (
                                  <AlertTriangle className="text-red-500 mb-2 animate-pulse" size={24}/>
                              ) : (
                                  <Box className="text-emerald-400 mb-2" size={24}/>
                              )}
                              
                              <p className={`text-xs uppercase font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {isLowStock ? 'Stock Critique' : 'En Stock'}
                              </p>
                              
                              <p className={`text-3xl font-black ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {stockValue}
                              </p>
                          </div>
                      </div>

                      {isLowStock && (
                          <div className="bg-red-100 text-red-800 text-xs font-bold p-3 rounded-lg text-center flex items-center justify-center gap-2">
                              <AlertTriangle size={14} />
                              Attention : Réapprovisionnement nécessaire
                          </div>
                      )}

                      <button 
                        onClick={() => setScannedProduct(null)} 
                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors active:scale-95"
                      >
                        Scanner un autre produit
                      </button>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <div className="relative">
                    <Search size={80} className="mb-6 text-slate-300"/>
                    <div className="absolute top-0 right-0 animate-ping h-4 w-4 rounded-full bg-emerald-400 opacity-75"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-400">En attente de scan...</h3>
                  <p className="text-slate-400 text-center mt-2 max-w-xs">
                      Passez la douchette sur un code barre pour consulter la fiche.
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}