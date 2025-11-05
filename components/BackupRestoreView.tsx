import React, { useState, useRef, useEffect } from 'react';
import type { BackupData, StoredBackup } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './IconComponents';
import { getAllBackups } from '../indexedDB';

interface BackupRestoreViewProps {
    onRestore: (data: BackupData) => void;
    onManualBackup: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ onRestore, onManualBackup }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [dataToRestore, setDataToRestore] = useState<BackupData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [autoBackups, setAutoBackups] = useState<StoredBackup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllBackups()
            .then(backups => {
                setAutoBackups(backups);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load auto backups:", err);
                setIsLoading(false);
            });
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const parsedData = JSON.parse(text);
                    if (parsedData.users && parsedData.menuItems && parsedData.orders) {
                        setDataToRestore(parsedData);
                        setIsConfirmOpen(true);
                    } else {
                        alert("ملف النسخة الاحتياطية غير صالح أو تالف.");
                    }
                } catch (error) {
                    alert("حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صحيح.");
                    console.error("Backup restore error:", error);
                }
            };
            reader.readAsText(file);
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirmRestore = () => {
        if (dataToRestore) {
            onRestore(dataToRestore);
        }
        setIsConfirmOpen(false);
        setDataToRestore(null);
    };

    const handleAutoRestoreRequest = (backup: StoredBackup) => {
        setDataToRestore(backup.data);
        setIsConfirmOpen(true);
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">النسخ الاحتياطي والاستعادة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 text-center">
                    <ArrowDownTrayIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">تصدير البيانات (نسخة احتياطية يدوية)</h4>
                    <p className="text-slate-600 mb-4">
                        قم بإنشاء نسخة احتياطية من جميع بيانات البرنامج وحفظها كملف على جهازك.
                    </p>
                    <button 
                        onClick={onManualBackup}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        تنزيل النسخة الاحتياطية
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 text-center">
                    <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">استيراد البيانات (استعادة يدوية)</h4>
                    <p className="text-slate-600 mb-4">
                        استعد بياناتك من ملف نسخة احتياطية. سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        اختيار ملف للاستعادة
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mt-6">
                <h4 className="text-xl font-semibold text-slate-900 mb-2">النسخ الاحتياطية التلقائية</h4>
                <p className="text-slate-600 mb-4">
                    يقوم النظام بإنشاء نسخة احتياطية تلقائياً كل ساعتين. يتم الاحتفاظ بالنسخ لمدة يومين.
                </p>
                <div className="max-h-60 overflow-y-auto pr-2 -mr-2 border rounded-md p-2 bg-slate-50">
                    {isLoading ? (
                        <p className="text-center text-slate-500 py-4">جاري تحميل النسخ الاحتياطية...</p>
                    ) : autoBackups.length > 0 ? (
                        <ul className="space-y-2">
                            {autoBackups.map(backup => (
                                <li key={backup.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-slate-200">
                                    <span className="text-slate-700 font-medium">
                                        نسخة بتاريخ: {new Date(backup.id).toLocaleString('ar-SA')}
                                    </span>
                                    <button
                                        onClick={() => handleAutoRestoreRequest(backup)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
                                    >
                                        استعادة
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-4">لا توجد نسخ احتياطية تلقائية بعد.</p>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmRestore}
                title="تأكيد الاستعادة"
                message="تحذير: سيؤدي هذا الإجراء إلى حذف جميع البيانات الحالية واستبدالها بالبيانات الموجودة في النسخة الاحتياطية. هل أنت متأكد من المتابعة؟"
            />
        </div>
    );
};