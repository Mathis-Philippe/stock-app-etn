export const parseScanData = (buffer) => {
  if (!buffer) return null;
  const regex = /R.*?rence:([\s\S]*?)D.*?signation/i;
  
  const match = buffer.match(regex);
  
  if (match && match[1]) {
    return match[1].trim(); 
  }
  
  return null;
};