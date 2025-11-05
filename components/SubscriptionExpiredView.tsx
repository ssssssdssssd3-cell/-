import React from 'react';
import type { SystemSettings } from '../types';

interface SubscriptionExpiredViewProps {
  onLogout: () => void;
  systemSettings: SystemSettings;
  restaurantName: string;
}

export const SubscriptionExpiredView: React.FC<SubscriptionExpiredViewProps> = ({ onLogout, systemSettings, restaurantName }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-slate-900 tracking-wider">
          {systemSettings.appName} <span className="text-orange-500">{systemSettings.appSubtitle}</span>
        </h1>
        <div className="mt-4">
            <h2 className="text-2xl font-bold text-red-600">انتهى اشتراكك</h2>
            <p className="mt-2 text-slate-600">
                لقد انتهت صلاحية اشتراك مطعم "{restaurantName}".
            </p>
            <p className="mt-2 text-slate-600">
                يرجى التواصل مع مزود الخدمة لتجديد الاشتراك والمتابعة.
            </p>
            <div className="mt-8">
                <button 
                    onClick={onLogout}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors"
                >
                    العودة لشاشة التفعيل
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};