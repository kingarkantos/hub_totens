import React from 'react';
import { Delete, Check, X, Space } from 'lucide-react';
import { sound } from '../lib/audio';

interface TouchVirtualKeyboardProps {
  isOpen: boolean;
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  maxLength?: number;
  placeholder?: string;
  title?: string;
}

export const TouchVirtualKeyboard: React.FC<TouchVirtualKeyboardProps> = ({
  isOpen,
  value,
  onChange,
  onConfirm,
  onClose,
  maxLength = 16,
  placeholder = 'SEU NOME / APELIDO',
  title = 'Gravar Recorde no Ranking',
}) => {
  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    sound.playClick();
    if (value.length < maxLength) {
      onChange(value + char);
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    sound.playClick();
    onChange('');
  };

  const handleConfirm = () => {
    sound.playSuccess();
    onConfirm();
  };

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl mx-auto bg-slate-900 border-t-2 border-white/20 rounded-t-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Header with Title and Close */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⌨️</span>
            <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider">{title}</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name Display Input Field */}
        <div className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-950 border-2 border-amber-400/80 shadow-inner mb-4">
          <div className="flex-1 text-center font-mono font-black text-xl sm:text-2xl text-amber-300 tracking-wider">
            {value ? (
              <span>{value}<span className="animate-pulse text-amber-400">|</span></span>
            ) : (
              <span className="text-slate-500 font-normal text-sm sm:text-base">{placeholder}</span>
            )}
          </div>
          {value.length > 0 && (
            <button
              onClick={handleClear}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 active:scale-95"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Keyboard Layout */}
        <div className="w-full flex flex-col gap-2 select-none touch-none">
          {/* Numbers Row */}
          <div className="flex justify-center gap-1.5 sm:gap-2 w-full">
            {numberRow.map((n) => (
              <button
                key={n}
                onClick={() => handleKeyPress(n)}
                className="flex-1 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 active:scale-90 active:bg-amber-500 active:text-slate-950 rounded-xl font-mono font-black text-base sm:text-lg text-white border border-white/10 shadow transition-transform"
              >
                {n}
              </button>
            ))}
          </div>

          {/* Row 1 */}
          <div className="flex justify-center gap-1.5 sm:gap-2 w-full">
            {row1.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="flex-1 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 active:scale-90 active:bg-amber-500 active:text-slate-950 rounded-xl font-black text-base sm:text-lg text-white border border-white/10 shadow transition-transform"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex justify-center gap-1.5 sm:gap-2 w-full px-2 sm:px-4">
            {row2.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="flex-1 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 active:scale-90 active:bg-amber-500 active:text-slate-950 rounded-xl font-black text-base sm:text-lg text-white border border-white/10 shadow transition-transform"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 3 (Letters + Backspace) */}
          <div className="flex justify-center gap-1.5 sm:gap-2 w-full">
            {row3.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="flex-1 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 active:scale-90 active:bg-amber-500 active:text-slate-950 rounded-xl font-black text-base sm:text-lg text-white border border-white/10 shadow transition-transform"
              >
                {char}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="px-4 py-3 sm:py-3.5 bg-rose-900/80 hover:bg-rose-800 active:scale-90 rounded-xl font-black text-sm text-white border border-rose-500/40 shadow flex items-center justify-center transition-transform"
              title="Apagar caractere"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Control Row */}
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={() => handleKeyPress(' ')}
              className="flex-1 py-3.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 rounded-xl font-bold text-xs sm:text-sm text-slate-300 border border-white/10 shadow flex items-center justify-center gap-2"
            >
              <Space className="w-4 h-4" />
              <span>ESPAÇO</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={!value.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 rounded-xl font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wider shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CONFIRMAR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
