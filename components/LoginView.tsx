import React, { useState } from 'react';
import type { SystemSettings } from '../types';

interface LoginViewProps {
  onLogin: (username: string, password: string) => void;
  error: string | null;
  systemSettings: SystemSettings;
  restaurantName?: string;
  onSwitchRestaurant: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, 
  error, 
  systemSettings,
  restaurantName,
  onSwitchRestaurant
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
 
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 tracking-wider">
            {systemSettings.appName} <span className="text-orange-500">{systemSettings.appSubtitle}</span>
          </h1>
          <p className="mt-2 text-slate-500">
            {`تسجيل الدخول لـ: ${restaurantName}`}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLoginSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">اسم المستخدم</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                autoComplete="username" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
                placeholder="اسم المستخدم" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">كلمة المرور</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
                placeholder="كلمة المرور" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              تسجيل الدخول
            </button>
          </div>
        </form>
         <div className="text-center pt-4">
            <button
              onClick={onSwitchRestaurant}
              className="text-sm font-medium text-slate-500 hover:text-orange-600 hover:underline"
            >
              هل هذا ليس مطعمك؟ تغيير المطعم
            </button>
          </div>
      </div>
    </div>
  );
};