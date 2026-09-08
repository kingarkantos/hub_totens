import React, { useState } from 'react';
import { X, Key, Shield, Clock, Check, AlertCircle, Sparkles } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabase';
import { sound } from '../lib/audio';

interface SettingsModalProps {
  currentPassword: string;
  onClose: () => void;
  onPasswordUpdated: (newPass: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentPassword,
  onClose,
  onPasswordUpdated,
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [geminiKey, setGeminiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [idleSeconds, setIdleSeconds] = useState(90);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (oldPass !== currentPassword) {
      sound.playError();
      setErrorMsg('A senha atual digitada está incorreta.');
      return;
    }

    if (!newPass.trim() || newPass.length < 4) {
      sound.playError();
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      sound.playError();
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setSaving(true);
    try {
      // Update password in Supabase
      const { error: passErr } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({ key: 'admin_password', value: newPass.trim() });

      if (passErr) throw passErr;

      // Update idle timeout in Supabase
      await supabase
        .from(TABLES.SETTINGS)
        .upsert({ key: 'idle_timeout_seconds', value: idleSeconds.toString() });

      // Update gemini API key in Supabase
      if (geminiKey.trim()) {
        await supabase
          .from(TABLES.SETTINGS)
          .upsert({ key: 'gemini_api_key', value: geminiKey.trim() });
      }

      sound.playSuccess();
      setSuccessMsg('Configurações e nova senha salvas com sucesso!');
      onPasswordUpdated(newPass.trim());
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      sound.playError();
      setErrorMsg('Erro ao salvar no banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Configurações do Hub</h3>
              <p className="text-xs text-slate-500">Gerencie a senha de acesso e parâmetros do totem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-600" />
              <span>Senha Atual do Hub *</span>
            </label>
            <input
              type="password"
              required
              placeholder="Digite a senha atual"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nova Senha de Acesso *
            </label>
            <input
              type="password"
              required
              placeholder="Digite a nova senha"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Confirmar Nova Senha *
            </label>
            <input
              type="password"
              required
              placeholder="Repita a nova senha"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-sm font-mono"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>Tempo de Inatividade do Totem (Segundos)</span>
            </label>
            <select
              value={idleSeconds}
              onChange={(e) => setIdleSeconds(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-red-500 focus:bg-white"
            >
              <option value={45}>45 segundos</option>
              <option value={60}>60 segundos (1 minuto)</option>
              <option value={90}>90 segundos (Padrão)</option>
              <option value={120}>120 segundos (2 minutos)</option>
              <option value={180}>180 segundos (3 minutos)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Tempo sem toque na tela antes de retornar suavemente para a Splash Screen.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Google Gemini API Key (IA para Jogos)</span>
            </label>
            <input
              type="password"
              placeholder="AQ.Ab8RN6..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Usada para gerar automaticamente perguntas de quiz, prêmios de roleta e conteúdos temáticos.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
