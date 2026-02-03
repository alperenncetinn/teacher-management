import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Student } from '../../types';
import { Award, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const Evaluation: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        client.get<Student[]>('/students').then(res => setStudents(res.data));
    }, []);

    const handleScoreUpdate = async (studentId: number, score: number) => {
        if (score < 0 || score > 100) {
            toast.error('Puan 0-100 arasında olmalıdır');
            return;
        }

        try {
            await client.patch(`/students/${studentId}/score`, score, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Not kaydedildi');
            setStudents(students.map(s => s.id === studentId ? { ...s, internshipScore: score } : s));
        } catch (error) {
            toast.error('Kaydedilemedi');
        }
    };

    const filteredStudents = students.filter(s =>
        s.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.schoolNumber.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Award className="w-8 h-8 mr-3 text-indigo-600" />
                    Staj Değerlendirme
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Öğrenci ara..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => (
                    <div key={student.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={`absolute top-0 left-0 w-1 h-full ${(student.internshipScore || 0) >= 50 ? 'bg-green-500' : 'bg-orange-500'
                            }`}></div>

                        <div className="pl-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">{student.user.fullName}</h3>
                                    <p className="text-xs text-slate-500">{student.schoolNumber}</p>
                                    <p className="text-xs text-slate-500 mt-1">{student.fieldOfStudy} / {student.className}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-3xl font-black transition-colors ${(student.internshipScore || 0) > 0 ? 'text-indigo-100' : 'text-slate-100'
                                        }`}>
                                        {student.internshipScore ?? '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Başarı Puanı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="0-100"
                                        defaultValue={student.internshipScore}
                                        onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val !== student.internshipScore) {
                                                handleScoreUpdate(student.id, val);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = parseInt(e.currentTarget.value);
                                                if (!isNaN(val)) {
                                                    handleScoreUpdate(student.id, val);
                                                    e.currentTarget.blur();
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
