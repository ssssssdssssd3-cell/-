import React, { useState } from 'react';
import type { SystemSettings } from '../types';
import { ShieldCheckIcon, KeyIcon } from './IconComponents';

type ActivationResult = 'SUCCESS' | 'INVALID_CODE' | 'ALREADY_USED';

interface InitialActivationViewProps {
  onActivate: (code: string) => ActivationResult;
  systemSettings: SystemSettings;
  onSuperAdminClick: () => void;
}

export const InitialActivationView: React.FC<InitialActivationViewProps> = ({ 
  onActivate,
  systemSettings,
  onSuperAdminClick
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = onActivate(activationCode.trim());
    if (result !== 'SUCCESS') {
        if (result === 'INVALID_CODE') {
            setError('كود التفعيل غير صالح. يرجى التحقق منه والمحاولة مرة أخرى.');
        } else if (result === 'ALREADY_USED') {
            setError('هذا الكود تم استخدامه مسبقاً لتفعيل مطعم آخر.');
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            تفعيل البرنامج
          </h1>
          <p className="mt-2 text-slate-500">
            مرحباً بك في {systemSettings.appName}. يرجى إدخال كود التفعيل الذي حصلت عليه.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="activationCode" className="sr-only">كود التفعيل</label>
            <input 
                id="activationCode" 
                name="activationCode" 
                type="text" 
                required 
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
                placeholder="كود التفعيل" 
                value={activationCode} 
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                autoFocus
            />
          </div>
          
          {error && <div className="text-red-500 text-sm text-center pt-2">{error}</div>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6">
              تفعيل
            </button>
          </div>
        </form>
      </div>
       <div className="fixed bottom-6 right-6">
        <button
          onClick={onSuperAdminClick}
          className="flex items-center gap-2 py-2 px-4 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-transform hover:scale-105 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          aria-label="الدخول كمالك للنظام"
        >
          <KeyIcon className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">مالك النظام</span>
        </button>
      </div>
    </div>
  );
};