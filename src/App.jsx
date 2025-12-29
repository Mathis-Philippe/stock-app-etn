import { useState } from 'react';


import MainMenu from './views/MainMenu';
import InventoryView from './views/InventoryView';
import StockCheckView from './views/StockCheckView';
import StockInView from './views/StockInView';
import PickingView from './views/PickingView';

function App() {
  const [currentView, setCurrentView] = useState('menu');


  switch (currentView) {
    case 'inventory':
      return <InventoryView onBack={() => setCurrentView('menu')} />;
    case 'check':
      return <StockCheckView onBack={() => setCurrentView('menu')} />;
    case 'stock_in':
      return <StockInView onBack={() => setCurrentView('menu')} />;
    case 'picking':
      return <PickingView onBack={() => setCurrentView('menu')} />;
    default:
      return <MainMenu onNavigate={setCurrentView} />;
  }
}

export default App;