import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Student } from '../../types';
import { Calendar, UserX, AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface AttendanceRecord {
    id: number;
    studentId: number;
    date: string;
    isPresent: boolean;
    note: string;
}

export const AttendanceControl: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Record Form
    const [newDate, setNewDate] = useState('');
    const [newNote, setNewNote] = useState('');

    const fetchStudents = async () => {
        try {
            const { data } = await client.get<Student[]>('/students');
            setStudents(data);
        } catch (e) {
            toast.error('Öğrenciler yüklenemedi');
        }
    };

    const fetchRecords = async (studentId: number) => {
        try {
            const { data } = await client.get<AttendanceRecord[]>(`/attendance/${studentId}`);
            setRecords(data);
        } catch (e) {
            toast.error('Devamsızlık kayıtları yüklenemedi');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        fetchRecords(student.id);
    };

    const handleAddAbsence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        try {
            await client.post('/attendance', {
                studentId: selectedStudent.id,
                date: newDate,
                isPresent: false, // Defaulting to Absence entry
                note: newNote
            });
            toast.success('Devamsızlık eklendi');
            setShowAddModal(false);
            setNewDate('');
            setNewNote('');
            fetchRecords(selectedStudent.id);
        } catch (e: any) {
            toast.error(e.response?.data || 'Ekleme başarısız');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await client.delete(`/attendance/${id}`);
            toast.success('Silindi');
            if (selectedStudent) fetchRecords(selectedStudent.id);
        } catch (e) {
            toast.error('Silinemedi');
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Student List Sidebar */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Öğrenciler</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {students.map(student => (
                        <button
                            key={student.id}
                            onClick={() => handleStudentSelect(student)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedStudent?.id === student.id
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                                }`}
                        >
                            <div className="font-medium">{student.user.fullName}</div>
                            <div className="text-xs opacity-70">{student.schoolNumber}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Attendance Details */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {selectedStudent ? (
                    <>
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <UserX className="w-5 h-5 mr-2 text-red-500" />
                                    Devamsızlık Kayıtları: {selectedStudent.user.fullName}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Toplam Devamsızlık: <span className="font-bold text-red-600">{records.filter(r => !r.isPresent).length} Gün</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow-lg shadow-red-900/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Devamsızlık Ekle
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Rules Info */}
                            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                                <h4 className="font-bold mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Devamsızlık Kuralları</h4>
                                <ul className="list-disc list-inside space-y-1 ml-1 opacity-90">
                                    <li>Sınır: Staj süresinin %10’u</li>
                                    <li>Örnek: 40 gün staj → Maksimum 4 gün</li>
                                    <li>Geç gelme, erken çıkma, imzasız günler devamsızlık sayılır.</li>
                                    <li>Raporlu günler sayılmaz.</li>
                                </ul>
                            </div>

                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-medium">
                                        <th className="py-3 px-2">Tarih</th>
                                        <th className="py-3 px-2">Durum</th>
                                        <th className="py-3 px-2">Not</th>
                                        <th className="py-3 px-2 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {records.map(record => (
                                        <tr key={record.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-2 text-slate-700">
                                                {new Date(record.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="py-3 px-2">
                                                {!record.isPresent ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                                        Yok
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                                        Var
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-slate-500 text-sm italic">
                                                {record.note || '-'}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="text-slate-400 hover:text-red-500 text-sm"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                                                Henüz devamsızlık kaydı girilmemiş.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Calendar className="w-16 h-16 mb-4 opacity-20" />
                        <p>İşlem yapmak için soldan bir öğrenci seçin.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Devamsızlık Ekle</h3>
                        <form onSubmit={handleAddAbsence} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                                <input
                                    type="date"
                                    required
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Not (Opsiyonel)</label>
                                <textarea
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 h-24"
                                    placeholder="Örn: Sabah gelmedi..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
