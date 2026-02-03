import { useState, useEffect } from 'react';
import { User, Plus, Trash2, LogIn, Settings } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : ['Mathis', 'David', 'Test'];
  });

  const [selectedUser, setSelectedUser] = useState('');
  const [isManaging, setIsManaging] = useState(false); 
  const [newUser, setNewUser] = useState('');

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser);
    }
  };

  const addUser = (e) => {
    e.preventDefault();
    if (newUser.trim() && !users.includes(newUser.trim())) {
      setUsers([...users, newUser.trim()]);
      setNewUser('');
    }
  };

  const removeUser = (userToRemove) => {
    if (confirm(`Supprimer ${userToRemove} ?`)) {
      setUsers(users.filter(u => u !== userToRemove));
      if (selectedUser === userToRemove) setSelectedUser('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Identification</h1>
          <p className="text-slate-500">Qui utilise le scanner ?</p>
        </div>

        {!isManaging ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sélectionnez votre nom
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="" disabled>-- Choisir un opérateur --</option>
                {users.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <LogIn size={24} />
              Commencer
            </button>

            <button
              onClick={() => setIsManaging(true)}
              className="w-full text-slate-400 text-sm flex items-center justify-center gap-2 mt-4 hover:text-slate-600"
            >
              <Settings size={16} />
              Gérer la liste des employés
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2">Gestion des employés</h3>
            
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {users.map(u => (
                <li key={u} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                  <span className="font-medium">{u}</span>
                  <button 
                    onClick={() => removeUser(u)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={addUser} className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Nouveau nom..."
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
              />
              <button 
                type="submit" 
                disabled={!newUser.trim()}
                className="bg-green-600 text-white p-2 rounded-lg disabled:opacity-50"
              >
                <Plus size={24} />
              </button>
            </form>

            <button
              onClick={() => setIsManaging(false)}
              className="w-full mt-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}