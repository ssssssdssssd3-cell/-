import React from 'react';
import type { User, UserPermissions } from '../types';

interface PermissionsViewProps {
    users: User[];
    onUpdateUserPermissions: (userId: number, permissions: UserPermissions) => void;
}

const permissionLabels: Record<keyof UserPermissions, string> = {
    canAccessAdmin: 'الوصول للوحة التحكم',
    canManageMenu: 'إدارة قائمة الأصناف',
    canManageInventory: 'إدارة المخزون',
    canManageUsers: 'إدارة الموظفين والصلاحيات',
    canViewReports: 'الاطلاع على التقارير',
    canEditPrices: 'تعديل أسعار البيع',
};

export const PermissionsView: React.FC<PermissionsViewProps> = ({ users, onUpdateUserPermissions }) => {

    const handlePermissionChange = (
        userId: number,
        permissionKey: keyof UserPermissions,
        value: boolean
    ) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedPermissions = {
                ...user.permissions,
                [permissionKey]: value,
            };
            onUpdateUserPermissions(userId, updatedPermissions);
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">إدارة الصلاحيات</h3>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-right text-slate-700">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="py-3 px-6">المستخدم</th>
                                {Object.values(permissionLabels).map(label => (
                                    <th key={label} scope="col" className="py-3 px-6 text-center">{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">
                                        {user.username}
                                        <span className="text-xs text-slate-500 block">({user.role})</span>
                                    </td>
                                    {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map(key => (
                                        <td key={key} className="py-4 px-6 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                                checked={user.permissions[key]}
                                                onChange={(e) => handlePermissionChange(user.id, key, e.target.checked)}
                                                // Disable changing permissions for admin/owner roles to prevent lockout
                                                disabled={user.role === 'admin' || user.role === 'owner'}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {users.some(u => u.role === 'admin' || u.role === 'owner') && 
                    <p className="text-xs text-slate-500 mt-4 p-2 bg-slate-100 rounded">
                        ملاحظة: لا يمكن تعديل صلاحيات مستخدمي "المالك" و "المدير" لضمان بقاء التحكم الكامل بالنظام.
                    </p>
                }
            </div>
        </div>
    );
};