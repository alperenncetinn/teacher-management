import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Placement } from '../../types';
import { Calendar, Plus, Building2, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VisitReport {
    id: number;
    teacherId: number;
    teacher: any;
    studentId: number;
    student: any;
    companyId: number;
    company: any;
    visitDate: string;
    note: string;
}

export const VisitPlanning: React.FC = () => {
    const [visits, setVisits] = useState<VisitReport[]>([]);
    const [placements, setPlacements] = useState<Placement[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlacement, setSelectedPlacement] = useState<number>(0);
    const [visitDate, setVisitDate] = useState('');
    const [note, setNote] = useState('');

    const fetchVisits = async () => {
        try {
            const { data } = await client.get<VisitReport[]>('/visitreports');
            setVisits(data);
        } catch (e) {
            toast.error('Denetim planları yüklenemedi');
        }
    };

    const fetchPlacements = async () => {
        try {
            const { data } = await client.get<Placement[]>('/placements');
            setPlacements(data);
        } catch (e) {
            toast.error('Atamalar yüklenemedi');
        }
    };

    const handleCreate = async () => {
        if (!selectedPlacement || !visitDate) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        const placement = placements.find(p => p.id === selectedPlacement);
        if (!placement) return;

        try {
            await client.post('/visitreports', {
                studentId: placement.studentId,
                companyId: placement.companyId,
                visitDate: new Date(visitDate).toISOString(),
                note
            });

            toast.success('Denetim planlandı');
            setShowModal(false);
            setSelectedPlacement(0);
            setVisitDate('');
            setNote('');
            fetchVisits();
        } catch (e) {
            toast.error('Planlama başarısız');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu denetimi silmek istediğinize emin misiniz?')) return;

        try {
            await client.delete(`/visitreports/${id}`);
            toast.success('Denetim silindi');
            fetchVisits();
        } catch (e) {
            toast.error('Silme başarısız');
        }
    };

    useEffect(() => {
        fetchVisits();
        fetchPlacements();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Denetim Planlaması</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Denetim Planla
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visits.map(visit => (
                    <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <button
                                onClick={() => handleDelete(visit.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Tarih</p>
                                <p className="font-bold text-slate-800">
                                    {new Date(visit.visitDate).toLocaleDateString('tr-TR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Öğrenci</p>
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-slate-400" />
                                    <p className="text-slate-700">{visit.student?.user?.fullName}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">İşletme</p>
                                <div className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                                    <p className="text-slate-700">{visit.company?.name}</p>
                                </div>
                            </div>

                            {visit.note && (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Not</p>
                                    <p className="text-sm text-slate-600 italic">"{visit.note}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {visits.length === 0 && (
                <div className="bg-slate-50 rounded-xl p-10 text-center text-slate-500">
                    Henüz planlanmış denetim yok. Yeni denetim ekleyin!
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Yeni Denetim Planla</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Atama Seç</label>
                                <select
                                    value={selectedPlacement}
                                    onChange={(e) => setSelectedPlacement(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={0}>Seçiniz...</option>
                                    {placements.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.student?.user?.fullName} - {p.company?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Denetim Tarihi</label>
                                <input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Not (İsteğe Bağlı)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Denetim hakkında notlar..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    Planla
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300"
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
