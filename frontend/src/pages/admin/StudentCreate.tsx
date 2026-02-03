import React, { useState } from 'react';
import client from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export const StudentCreate: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        schoolNumber: '',
        fieldOfStudy: '',
        subField: '',
        className: '',
    });

    const [schoolDays, setSchoolDays] = useState<number[]>([]);

    const days = [
        { value: 1, label: 'Pazartesi' },
        { value: 2, label: 'Salı' },
        { value: 3, label: 'Çarşamba' },
        { value: 4, label: 'Perşembe' },
        { value: 5, label: 'Cuma' },
    ];

    const toggleDay = (day: number) => {
        if (schoolDays.includes(day)) setSchoolDays(schoolDays.filter(d => d !== day));
        else setSchoolDays([...schoolDays, day].sort());
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/students', {
                ...formData,
                schoolDays
            });
            toast.success('Öğrenci başarıyla oluşturuldu!');
            navigate('/students');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Öğrenci oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/students" className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Öğrenci Listesine Dön
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Yeni Öğrenci Ekle</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Hesap Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Okul Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Okul No</label>
                                <input
                                    name="schoolNumber"
                                    value={formData.schoolNumber}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf</label>
                                <input
                                    name="className"
                                    value={formData.className}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alan (Bölüm)</label>
                                <input
                                    name="fieldOfStudy"
                                    value={formData.fieldOfStudy}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dal (Alt Alan)</label>
                                <input
                                    name="subField"
                                    value={formData.subField}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Okul Günleri</label>
                        <div className="flex flex-wrap gap-2">
                            {days.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${schoolDays.includes(day.value)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Öğrencinin okulda olduğu günleri seçin.</p>
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
