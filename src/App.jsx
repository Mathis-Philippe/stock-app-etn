import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; 

import MainMenu from './views/MainMenu';
import InventoryView from './views/InventoryView';
import StockCheckView from './views/StockCheckView';
import StockInView from './views/StockInView';
import PickingView from './views/PickingView';
import LoginView from './views/LoginView';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('app_currentView') || 'menu';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem('app_currentUser') || null;
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('app_currentUser', currentUser);
    } else {
      sessionStorage.removeItem('app_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    sessionStorage.setItem('app_currentView', currentView);
  }, [currentView]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('menu');
    sessionStorage.removeItem('app_currentUser');
    sessionStorage.removeItem('app_currentView');

  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {!currentUser ? (
        <LoginView onLogin={(user) => setCurrentUser(user)} />
      ) : (
        <>
          {currentView === 'inventory' && (
            <InventoryView user={currentUser} onBack={() => setCurrentView('menu')} />
          )}
          
          {currentView === 'check' && (
            <StockCheckView user={currentUser} onBack={() => setCurrentView('menu')} />
          )}
          
          {currentView === 'stock_in' && (
            <StockInView user={currentUser} onBack={() => setCurrentView('menu')} />
          )}
          
          {currentView === 'picking' && (
            <PickingView user={currentUser} onBack={() => setCurrentView('menu')} />
          )}
          
          {currentView === 'menu' && (
            <MainMenu
              user={currentUser}
              onNavigate={setCurrentView} 
              onLogout={handleLogout}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;