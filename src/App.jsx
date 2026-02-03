import { useState } from 'react';


import MainMenu from './views/MainMenu';
import InventoryView from './views/InventoryView';
import StockCheckView from './views/StockCheckView';
import StockInView from './views/StockInView';
import PickingView from './views/PickingView';
import LoginView from './views/LoginView';

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} />;
  }


  switch (currentView) {
    case 'inventory':
      return <InventoryView user={currentUser} onBack={() => setCurrentView('menu')} />;
    case 'check':
      return <StockCheckView user={currentUser} onBack={() => setCurrentView('menu')} />;
    case 'stock_in':
      return <StockInView user={currentUser} onBack={() => setCurrentView('menu')} />;
    case 'picking':
      return <PickingView user={currentUser} onBack={() => setCurrentView('menu')} />;
    default:
      return ( 
        <MainMenu
          user={currentUser}
          onNavigate={setCurrentView} 
          onLogout={() => setCurrentUser(null)}
        />
      );
  }
}

export default App;