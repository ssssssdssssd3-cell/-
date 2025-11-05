import React, { useState } from 'react';
import type { SystemSettings } from '../types';
import { KeyIcon } from './IconComponents';

interface ActivationViewProps {
  onActivate: (username: string, password: string) => void;
  onCancel: () => void;
  restaurantName: string;
  systemSettings: SystemSettings;
}

export const ActivationView: React.FC<ActivationViewProps> = ({ 
  onActivate,
  onCancel,
  restaurantName,
  systemSettings 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onActivate(username, password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <KeyIcon className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            إنشاء حساب المدير
          </h1>
          <p className="mt-2 text-slate-500">
            أهلاً بك في {systemSettings.appName}! قم بإنشاء حساب المدير الرئيسي لمطعم <span className="font-bold">{restaurantName}</span>.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">اسم مستخدم المدير</label>
              <input id="username" name="username" type="text" autoComplete="username" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="اسم مستخدم المدير" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">كلمة المرور</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              إنشاء حساب المدير
            </button>
            <button type="button" onClick={onCancel} className="group relative w-full flex justify-center py-2 px-4 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-transparent hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              العودة لشاشة التفعيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};