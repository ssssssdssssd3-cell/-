import React, { useState } from 'react';
import type { Restaurant, SystemSettings } from '../types';
import { SubscriptionModal } from './SubscriptionModal';

interface SuperAdminViewProps {
  restaurants: Restaurant[];
  onAddRestaurant: (restaurant: Omit<Restaurant, 'subscriptionEndDate'>) => void;
  onUpdateSubscription: (restaurantId: string, newEndDate: string) => void;
  onLogout: () => void;
  systemSettings: SystemSettings;
}

const RestaurantForm: React.FC<{
  onSave: (data: { name: string; id: string }) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && id) {
      onSave({ name, id });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4 text-slate-900">إضافة مطعم جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">اسم المطعم</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">كود المطعم (فريد, بالإنجليزية)</label>
            <input type="text" value={id} onChange={e => setId(e.target.value)} className="w-full input-style" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors">إلغاء</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ restaurants, onAddRestaurant, onUpdateSubscription, onLogout, systemSettings }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleOpenSubModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsSubModalOpen(true);
  };
  
  const handleSaveSubscription = (newDate: string) => {
    if (selectedRestaurant) {
      onUpdateSubscription(selectedRestaurant.id, newDate);
    }
    setIsSubModalOpen(false);
    setSelectedRestaurant(null);
  };

  const getSubscriptionStatus = (endDate: string | null) => {
    if (!endDate) return { text: 'غير مشترك', style: 'bg-slate-100 text-slate-800' };
    const today = new Date();
    const subDate = new Date(endDate);
    today.setHours(0,0,0,0);
    
    if (subDate < today) return { text: 'منتهي الصلاحية', style: 'bg-red-100 text-red-800' };
    return { text: 'نشط', style: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="min-h-screen bg-slate-100">
       <header className="bg-white shadow-md p-4 flex justify-between items-center h-16">
        <h1 className="text-2xl font-bold text-slate-900 tracking-wider">
          {systemSettings.appName} <span className="text-orange-500">{systemSettings.appSubtitle}</span>
          <span className="ml-4 text-sm font-normal text-slate-500">| لوحة تحكم مالك النظام</span>
        </h1>
        <button
            onClick={onLogout}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
        >
            تسجيل الخروج
        </button>
      </header>
      
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">إدارة المطاعم والاشتراكات</h2>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                إضافة مطعم جديد
            </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">اسم المطعم</th>
                            <th scope="col" className="py-3 px-6">كود المطعم</th>
                            <th scope="col" className="py-3 px-6">حالة الاشتراك</th>
                            <th scope="col" className="py-3 px-6">تاريخ انتهاء الصلاحية</th>
                            <th scope="col" className="py-3 px-6">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(r => {
                          const status = getSubscriptionStatus(r.subscriptionEndDate);
                          return (
                            <tr key={r.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900">{r.name}</td>
                                <td className="py-4 px-6 font-mono">{r.id}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.style}`}>
                                        {status.text}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {r.subscriptionEndDate ? new Date(r.subscriptionEndDate).toLocaleDateString('ar-EG') : 'N/A'}
                                </td>
                                <td className="py-4 px-6">
                                  <button onClick={() => handleOpenSubModal(r)} className="font-medium text-blue-500 hover:underline">
                                    إدارة الاشتراك
                                  </button>
                                </td>
                            </tr>
                          )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {isAddModalOpen && <RestaurantForm onSave={onAddRestaurant} onCancel={() => setIsAddModalOpen(false)} />}
      {isSubModalOpen && selectedRestaurant && (
        <SubscriptionModal 
            isOpen={isSubModalOpen}
            onClose={() => setIsSubModalOpen(false)}
            onSave={handleSaveSubscription}
            restaurant={selectedRestaurant}
        />
      )}
    </div>
  );
};