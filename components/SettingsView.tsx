import React from 'react';
import type { SystemSettings } from '../types';
import { StandardReceiptIcon, CompactReceiptIcon } from './IconComponents';

interface SettingsViewProps {
    settings: SystemSettings;
    onUpdateSettings: (newSettings: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {

    const handleTemplateChange = (template: 'standard' | 'compact') => {
        onUpdateSettings({ ...settings, receiptTemplate: template });
    };

    const handleAutoPrintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateSettings({ ...settings, autoPrintReceipt: e.target.checked });
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">إعدادات النظام</h3>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 max-w-3xl mx-auto space-y-8">
                
                {/* Receipt Template Settings */}
                <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">نموذج طباعة الفاتورة</h4>
                    <p className="text-sm text-slate-500 mb-4">اختر شكل الفاتورة المطبوعة. النموذج المدمج مناسب لطابعات الفواتير الحرارية.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleTemplateChange('standard')}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                                settings.receiptTemplate === 'standard' ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                            }`}
                        >
                            <StandardReceiptIcon className="h-40 w-auto mx-auto mb-3 rounded border bg-white shadow-sm"/>
                            <h5 className="font-semibold text-slate-800">قياسي (Standard)</h5>
                            <p className="text-xs text-slate-500">مناسب للطابعات العادية A4/A5.</p>
                        </button>

                         <button
                            onClick={() => handleTemplateChange('compact')}
                            className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                                settings.receiptTemplate === 'compact' ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                            }`}
                        >
                            <CompactReceiptIcon className="h-40 w-auto mx-auto mb-3 rounded border bg-white shadow-sm"/>
                             <h5 className="font-semibold text-slate-800">مدمج (Compact)</h5>
                            <p className="text-xs text-slate-500">مناسب لطابعات الفواتير الحرارية.</p>
                        </button>
                    </div>
                </div>

                {/* Auto Print Settings */}
                <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">الطباعة التلقائية</h4>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-md">
                       <div>
                         <label htmlFor="auto-print" className="font-medium text-slate-800">
                            طباعة الفاتورة تلقائياً بعد كل عملية بيع
                         </label>
                         <p className="text-xs text-slate-500 mt-1">عند تفعيل هذا الخيار، ستظهر نافذة الطباعة مباشرة بعد تأكيد الطلب.</p>
                       </div>
                        <label htmlFor="auto-print" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="auto-print" 
                                    className="sr-only" 
                                    checked={settings.autoPrintReceipt}
                                    onChange={handleAutoPrintChange}
                                />
                                <div className="block bg-slate-300 w-12 h-7 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.autoPrintReceipt ? 'transform translate-x-full bg-orange-500' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
};