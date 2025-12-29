import { Delete, Check } from 'lucide-react';

export default function NumericKeypad({ onNumber, onDelete, onValidate }) {
  const btnClass = "h-14 w-full bg-white border border-slate-200 shadow-sm rounded-xl text-xl font-bold text-slate-700 active:bg-slate-100 active:scale-95 transition-all touch-manipulation";

  return (
    <div className="grid grid-cols-3 gap-3 mt-4 select-none">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button 
            key={num} 
            type="button"
            onClick={() => onNumber(num.toString())} 
            className={btnClass}
        >
          {num}
        </button>
      ))}
      
      <button 
        type="button" 
        onClick={onDelete} 
        className={`${btnClass} flex items-center justify-center text-red-500 bg-red-50 border-red-100`}
      >
        <Delete size={24} />
      </button>

      <button 
        type="button" 
        onClick={() => onNumber("0")} 
        className={btnClass}
      >
        0
      </button>

      <button 
        type="button" 
        onClick={onValidate} 
        className={`${btnClass} flex items-center justify-center text-white bg-green-600 hover:bg-green-700 border-green-600 shadow-md`}
      >
        <Check size={28} strokeWidth={3} />
      </button>
    </div>
  );
}