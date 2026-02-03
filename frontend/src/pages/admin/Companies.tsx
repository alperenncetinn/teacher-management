import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Company } from '../../types';
import { Link } from 'react-router-dom';
import { Building2, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const Companies: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async () => {
        try {
            const { data } = await client.get<Company[]>('/companies');
            setCompanies(data);
        } catch (e) {
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">İşletmeler</h2>
                <Link to="/companies/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" /> İşletme Ekle
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                    <div key={company.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    Kontenjan: {company.quota}
                                </span>
                                {company.ratingCount && company.ratingCount > 0 ? (
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                        <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        <span className="text-xs font-bold text-yellow-700">
                                            {company.averageRating?.toFixed(1) || '0.0'}
                                        </span>
                                        <span className="text-xs text-slate-500">({company.ratingCount})</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        Henüz puan yok
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1">{company.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {company.address}
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Kabul Edilen Alanlar</p>
                                <div className="flex flex-wrap gap-2">
                                    {company.acceptedFields.map(field => (
                                        <span key={field} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
