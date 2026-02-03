import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { User } from '../../types';
import { UserPlus, User as UserIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Teachers: React.FC = () => {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        try {
            const { data } = await client.get<User[]>('/teachers');
            setTeachers(data);
        } catch (e) {
            toast.error('Öğretmenler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800">Öğretmen Listesi</h3>
                <Link to="/teachers/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Öğretmen Ekle
                </Link>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-medium">
                        <th className="px-6 py-3">Öğretmen Bilgisi</th>
                        <th className="px-6 py-3">E-posta</th>
                        <th className="px-6 py-3">Rol</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-900">{teacher.fullName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{teacher.email}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Öğretmen
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
