import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Student } from '../../types';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const { data } = await client.get<Student[]>('/students');
            setStudents(data);
        } catch (e) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading) return <div className="text-center p-10">Yükleniyor...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800">Öğrenci Listesi</h3>
                <Link to="/students/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Öğrenci Ekle
                </Link>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-medium">
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Öğrenci Bilgisi</th>
                        <th className="px-6 py-3">Alan / Sınıf</th>
                        <th className="px-6 py-3 text-center">Belge Durumu</th>
                        <th className="px-6 py-3">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-500 text-sm">{student.schoolNumber}</td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{student.user.fullName}</div>
                                <div className="text-xs text-slate-500">{student.user.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                    {student.fieldOfStudy}
                                </span>
                                <span className="ml-2 text-slate-400">/ {student.className}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={async () => {
                                        try {
                                            await client.patch(`/students/${student.id}/toggle-doc`);
                                            toast.success('Durum güncellendi');
                                            // Optimistic update or refresh
                                            setStudents(students.map(s =>
                                                s.id === student.id
                                                    ? { ...s, hasInsuranceDocument: !s.hasInsuranceDocument }
                                                    : s
                                            ));
                                        } catch (e) {
                                            toast.error('Güncelleme başarısız');
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${student.hasInsuranceDocument
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                        }`}
                                >
                                    {student.hasInsuranceDocument ? (
                                        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Belgeler Tamam</span>
                                    ) : (
                                        <span className="flex items-center"><XCircle className="w-3 h-3 mr-1" /> Belgeler Eksik</span>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
                                                try {
                                                    await client.delete(`/students/${student.id}`);
                                                    toast.success('Öğrenci silindi');
                                                    setStudents(students.filter(s => s.id !== student.id));
                                                } catch (e) {
                                                    toast.error('Silme başarısız');
                                                }
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const score = prompt('Staj Başarı Puanı (0-100):', student.internshipScore?.toString() || '');
                                            if (score !== null) {
                                                const val = parseInt(score);
                                                if (isNaN(val) || val < 0 || val > 100) {
                                                    return toast.error('Geçerli bir puan giriniz (0-100)');
                                                }

                                                client.patch(`/students/${student.id}/score`, val, {
                                                    headers: { 'Content-Type': 'application/json' }
                                                }).then(() => {
                                                    toast.success('Puan kaydedildi');
                                                    setStudents(students.map(s =>
                                                        s.id === student.id ? { ...s, internshipScore: val } : s
                                                    ));
                                                }).catch(() => toast.error('Puan kaydedilemedi'));
                                            }
                                        }}
                                        className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors ml-2"
                                        title="Not Ver"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold">{student.internshipScore ?? '-'}</span>
                                        </div>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
