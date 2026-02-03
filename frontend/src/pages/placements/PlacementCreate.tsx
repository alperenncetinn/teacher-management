import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import type { Company, Student } from '../../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlacementCreate: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const navigate = useNavigate();

    // Form State
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const days = [
        { value: 1, label: 'Pazartesi' },
        { value: 2, label: 'Salı' },
        { value: 3, label: 'Çarşamba' },
        { value: 4, label: 'Perşembe' },
        { value: 5, label: 'Cuma' },
    ];

    useEffect(() => {
        const loadData = async () => {
            const [sRes, cRes] = await Promise.all([
                client.get<Student[]>('/students'),
                client.get<Company[]>('/companies')
            ]);
            setStudents(sRes.data);
            setCompanies(cRes.data);
        };
        loadData();
    }, []);

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) setSelectedDays(selectedDays.filter(d => d !== day));
        else setSelectedDays([...selectedDays, day].sort());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/placements', {
                studentId: parseInt(selectedStudent),
                companyId: parseInt(selectedCompany),
                startDate,
                endDate,
                internDays: selectedDays
            });
            toast.success('Atama başarıyla oluşturuldu!');
            navigate('/placements');
        } catch (err: any) {
            // Show validation error from backend (SafeToAutoRun checks etc)
            const msg = err.response?.data?.message || 'Atama oluşturulamadı';
            toast.error(msg);
        }
    };

    // Find selected student/company for previews/validation hints in UI
    const studentData = students.find(s => s.id.toString() === selectedStudent);
    const companyData = companies.find(c => c.id.toString() === selectedCompany);

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/placements" className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Listeye Dön
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Yeni Staj Ataması</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Öğrenci Seçin</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                required
                            >
                                <option value="">-- Öğrenci Seçin --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.schoolNumber} - {s.user.fullName}
                                    </option>
                                ))}
                            </select>
                            {studentData && (
                                <div className="mt-2 text-xs text-slate-500 p-2 bg-slate-50 rounded border border-slate-100">
                                    <p>Alan: <span className="font-medium text-slate-700">{studentData.fieldOfStudy}</span></p>
                                    <p>Okul Günleri: {studentData.schoolDays.join(', ')}</p>
                                    <p className={studentData.hasInsuranceDocument ? "text-emerald-600" : "text-amber-600"}>
                                        İSG Belgesi: {studentData.hasInsuranceDocument ? "Yüklü" : "Eksik"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Company Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">İşletme Seçin</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedCompany}
                                onChange={e => setSelectedCompany(e.target.value)}
                                required
                            >
                                <option value="">-- İşletme Seçin --</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} (Kota: {c.quota})
                                    </option>
                                ))}
                            </select>
                            {companyData && (
                                <div className="mt-2 text-xs text-slate-500 p-2 bg-slate-50 rounded border border-slate-100">
                                    <p>Alanlar: <span className="font-medium text-slate-700">{companyData.acceptedFields.join(', ')}</span></p>
                                    <p>Çalışma Günleri: {companyData.operatingDays.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Başlangıç Tarihi</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bitiş Tarihi</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Staj Günleri (Haftalık Plan)</label>
                        <div className="flex flex-wrap gap-3">
                            {days.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedDays.includes(day.value)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                        {studentData && companyData && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-amber-600">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>
                                    Uyarı: Seçilen günlerin Okul Günleri ({studentData.schoolDays.join(', ')}) ile çakışmadığından
                                    ve İşletme Çalışma Günleri ({companyData.operatingDays.join(', ')}) dahilinde olduğundan emin olun.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
                        >
                            Öğrenci Ata
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
