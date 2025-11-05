import React, { useState } from 'react';
import type { SystemSettings } from '../types';
import { ShieldCheckIcon } from './IconComponents';

interface LicenseActivationViewProps {
  onActivate: (restaurantName: string, subscriptionEndDate: string | null) => void;
  systemSettings: SystemSettings;
}

export const LicenseActivationView: React.FC<LicenseActivationViewProps> = ({ 
  onActivate,
  systemSettings 
}) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const key = licenseKey.trim().toUpperCase();
    let durationDays: number | null = null;

    if (key === 'TRIAL30') {
        durationDays = 30;
    } else if (key === 'PRO365') {
        durationDays = 365;
    } else if (key === 'LIFETIME') {
        durationDays = null; // Represents lifetime
    } else {
        setError('مفتاح الترخيص غير صالح.');
        return;
    }

    if (!restaurantName.trim()) {
        setError('الرجاء إدخال اسم المطعم.');
        return;
    }

    let subscriptionEndDate: string | null = null;
    if (durationDays !== null) {
        const date = new Date();
        date.setDate(date.getDate() + durationDays);
        subscriptionEndDate = date.toISOString();
    }
    
    onActivate(restaurantName.trim(), subscriptionEndDate);
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
            مرحباً بك في {systemSettings.appName}. يرجى إدخال البيانات التالية لتفعيل نسختك.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="restaurantName" className="sr-only">اسم المطعم</label>
              <input id="restaurantName" name="restaurantName" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="اسم المطعم" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="licenseKey" className="sr-only">مفتاح الترخيص</label>
              <input id="licenseKey" name="licenseKey" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="مفتاح الترخيص" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm text-center pt-4">{error}</div>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6">
              تفعيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};