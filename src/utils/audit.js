const LOG_KEY = 'app_audit_log';

export const logAction = (user, action, details) => {
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleString('fr-FR'),
    user: user || 'Anonyme',
    action: action, 
    details: details 
  };

  const existingLogs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  
  const updatedLogs = [newLog, ...existingLogs].slice(0, 1000);
  
  localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
  
  return newLog;
};

export const getLogs = () => {
  return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
};