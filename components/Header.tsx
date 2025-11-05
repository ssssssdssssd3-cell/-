import React, { useState, useEffect } from 'react';
import type { User, SystemSettings } from '../types';

interface HeaderProps {
    currentView: 'pos' | 'admin' | 'kds';
    onSetView: (view: 'pos' | 'admin' | 'kds') => void;
    user: User;
    onLogout: () => void;
    restaurantName?: string;
    systemSettings: SystemSettings;
    lastManualBackupTimestamp: number | null;
    onManualBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onSetView, user, onLogout, restaurantName, systemSettings, lastManualBackupTimestamp, onManualBackup }) => {
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    const checkBackupStatus = () => {
        if (!lastManualBackupTimestamp) {
            setShowBackupReminder(true); // If never backed up, show reminder
            return;
        }
        const sixHours = 6 * 60 * 60 * 1000;
        const isOld = Date.now() - lastManualBackupTimestamp > sixHours;
        setShowBackupReminder(isOld);
    };

    checkBackupStatus();
    const interval = setInterval(checkBackupStatus, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [lastManualBackupTimestamp]);
  
  const getRoleArabic = (role: User['role']) => {
    switch(role) {
      case 'admin': return 'مدير';
      case 'owner': return 'مالك';
      case 'cashier': return 'كاشير';
      case 'driver': return 'سائق';
      case 'superadmin': return 'مالك النظام';
      default: return role;
    }
  }
  
  const navButtonStyle = "font-semibold py-2 px-4 rounded-md transition-colors duration-200";
  const activeNavButtonStyle = "bg-orange-500 text-white";
  const inactiveNavButtonStyle = "bg-slate-200 hover:bg-slate-300 text-slate-800";
  
  return (
    <>
      <header className="bg-white shadow-md p-4 flex justify-between items-center h-16 no-print">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-wider">
            {systemSettings.appName} <span className="text-orange-500">{systemSettings.appSubtitle}</span>
          </h1>
          {restaurantName && (
            <div className="hidden sm:flex items-center gap-2 border-r border-slate-300 pr-4">
              <span className="text-sm font-semibold text-slate-700">{restaurantName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                  onClick={() => onSetView('pos')}
                  className={`${navButtonStyle} ${currentView === 'pos' ? activeNavButtonStyle : inactiveNavButtonStyle}`}
              >
                  نقطة البيع
              </button>
              <button
                  onClick={() => onSetView('kds')}
                  className={`${navButtonStyle} ${currentView === 'kds' ? activeNavButtonStyle : inactiveNavButtonStyle}`}
              >
                  شاشة المطبخ
              </button>
              {user.permissions.canAccessAdmin && (
                  <button
                      onClick={() => onSetView('admin')}
                      className={`${navButtonStyle} ${currentView === 'admin' ? activeNavButtonStyle : inactiveNavButtonStyle}`}
                  >
                      لوحة التحكم
                  </button>
              )}
          </div>

          <div className="text-sm text-slate-600 hidden md:block border-l border-slate-300 pl-4">
            أهلاً, <span className="font-bold">{user.username}</span> ({getRoleArabic(user.role)})
          </div>

          <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
              خروج
          </button>
        </div>
      </header>
      {showBackupReminder && (
          <div className="bg-yellow-100 border-b-2 border-yellow-300 text-yellow-800 px-4 py-2 flex justify-between items-center text-sm no-print">
              <p>
                  <span className="font-bold">تذكير:</span> لم تقم بإنشاء نسخة احتياطية (ملف) منذ أكثر من 6 ساعات. نوصي بإنشاء واحدة الآن.
              </p>
              <button
                  onClick={onManualBackup}
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-1 px-3 rounded-md transition-colors"
              >
                  إنشاء نسخة احتياطية الآن
              </button>
          </div>
      )}
    </>
  );
};