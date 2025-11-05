import React, { useState } from 'react';
import type { UserWithPassword } from '../types';
import { EmployeeForm } from './EmployeeForm';
import { ConfirmationDialog } from './ConfirmationDialog';

interface EmployeesViewProps {
    users: UserWithPassword[];
    onAddUser: (user: Omit<UserWithPassword, 'id'>) => void;
    onUpdateUser: (user: UserWithPassword) => void;
    onDeleteUser: (userId: number) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithPassword | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: UserWithPassword) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = (user: Omit<UserWithPassword, 'id'> | UserWithPassword) => {
        if ('id' in user) {
            onUpdateUser(user);
        } else {
            onAddUser(user);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (userId: number) => {
        setUserToDelete(userId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete !== null) {
            onDeleteUser(userToDelete);
        }
        setIsConfirmOpen(false);
        setUserToDelete(null);
    };
    
    const getRoleDisplay = (role: UserWithPassword['role']) => {
        switch (role) {
            case 'owner': return 'مالك';
            case 'admin': return 'مدير';
            case 'cashier': return 'كاشير';
            case 'driver': return 'سائق';
            default: return role;
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    إضافة موظف جديد
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-right text-slate-700">
                    <thead className="text-xs text-slate-600 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">اسم المستخدم</th>
                            <th scope="col" className="py-3 px-6">الصلاحية</th>
                            <th scope="col" className="py-3 px-6">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{user.username}</td>
                                <td className="py-4 px-6">{getRoleDisplay(user.role)}</td>
                                <td className="py-4 px-6 flex gap-4">
                                    <button onClick={() => handleOpenEditModal(user)} className="font-medium text-blue-500 hover:underline">تعديل</button>
                                    {users.length > 1 && ( // Prevent deleting the last user
                                        <button onClick={() => handleDeleteRequest(user.id)} className="font-medium text-red-500 hover:underline">حذف</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <EmployeeForm user={editingUser} onSave={handleSaveUser} onCancel={handleCloseModal} />}
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
};