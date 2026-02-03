import React, { useState } from 'react';
import client from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export const CompanyCreate: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        quota: 1,
        acceptedFields: '', // Comma separated string for input
    });

    const [operatingDays, setOperatingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri

    const days = [
        { value: 1, label: 'Pazartesi' },
        { value: 2, label: 'Salı' },
        { value: 3, label: 'Çarşamba' },
        { value: 4, label: 'Perşembe' },
        { value: 5, label: 'Cuma' },
        { value: 6, label: 'Cumartesi' },
        { value: 0, label: 'Pazar' },
    ];

    const toggleDay = (day: number) => {
        if (operatingDays.includes(day)) setOperatingDays(operatingDays.filter(d => d !== day));
        else setOperatingDays([...operatingDays, day].sort());
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Parse accepted fields
            const acceptedFieldsArray = formData.acceptedFields.split(',').map(s => s.trim()).filter(Boolean);

            await client.post('/companies', {
                name: formData.name,
                address: formData.address,
                quota: Number(formData.quota),
                acceptedFields: acceptedFieldsArray,
                operatingDays
            });
            toast.success('İşletme başarıyla oluşturuldu!');
            navigate('/companies');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'İşletme oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/companies" className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> İşletme Listesine Dön
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Yeni İşletme Ekle</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">İşletme Adı</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kontenjan</label>
                            <input
                                name="quota"
                                type="number"
                                min="1"
                                value={formData.quota}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kabul Edilen Alanlar (Virgülle ayırın)</label>
                            <input
                                name="acceptedFields"
                                value={formData.acceptedFields}
                                onChange={handleChange}
                                placeholder="Örn: Bilişim, Elektrik, Muhasebe"
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Çalışma Günleri</label>
                        <div className="flex flex-wrap gap-2">
                            {days.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${operatingDays.includes(day.value)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg shadow-blue-900/20 transition-all"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
