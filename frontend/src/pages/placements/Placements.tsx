import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Placement, Company } from '../../types';
import { Briefcase, Calendar, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const Placements: React.FC = () => {
    const [placements, setPlacements] = useState<Placement[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);

    const fetchPlacements = async () => {
        try {
            const { data } = await client.get<Placement[]>('/placements');
            setPlacements(data);
        } catch (e) {
            toast.error('Failed to load placements');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const { data } = await client.get<Company[]>('/companies');
            setCompanies(data);
        } catch (e) {
            toast.error('Failed to load companies');
        }
    };

    const handleEdit = (placement: Placement) => {
        setEditingPlacement(placement);
        setSelectedCompanyId(placement.companyId);
    };

    const handleUpdate = async () => {
        if (!editingPlacement || !selectedCompanyId) return;

        try {
            const { data } = await client.patch(`/placements/${editingPlacement.id}`, {
                companyId: selectedCompanyId
            });

            setPlacements(placements.map(p => p.id === data.id ? data : p));
            toast.success('Atama güncellendi');
            setEditingPlacement(null);
        } catch (e) {
            toast.error('Güncelleme başarısız');
        }
    };

    useEffect(() => {
        fetchPlacements();
        fetchCompanies();
    }, []);

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Atamalar</h2>
                <Link to="/placements/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-colors">
                    Öğrenci Ata
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {placements.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">Atama bulunamadı. Yeni atama oluşturun!</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Öğrenci</th>
                                <th className="px-6 py-3">İşletme</th>
                                <th className="px-6 py-3">Tarih Aralığı</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {placements.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{p.student?.user?.fullName || 'Student'}</p>
                                                <p className="text-xs text-slate-500">{p.student?.schoolNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-700 font-medium">
                                            <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                                            {p.company?.name || 'Company'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-slate-600">
                                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                            {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                        >
                                            Düzenle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {editingPlacement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Atamayı Düzenle</h3>
                            <button onClick={() => setEditingPlacement(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Öğrenci</label>
                                <p className="text-slate-900 font-medium">{editingPlacement.student?.user?.fullName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Yeni İşletme</label>
                                <select
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value={0}>İşletme seçin</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Güncelle
                                </button>
                                <button
                                    onClick={() => setEditingPlacement(null)}
                                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
