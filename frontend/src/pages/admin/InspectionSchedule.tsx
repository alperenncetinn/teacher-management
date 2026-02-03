import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Calendar, Building2, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface InspectionSchedule {
    inspectionDays: number[];
    assignedPlacements: any[];
}

const DAYS = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
];

export const InspectionSchedule: React.FC = () => {
    const [schedule, setSchedule] = useState<InspectionSchedule | null>(null);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const fetchSchedule = async () => {
        try {
            const { data } = await client.get<InspectionSchedule>('/inspection/schedule');
            setSchedule(data);
            setSelectedDays(data.inspectionDays || []);
        } catch (e) {
            toast.error('Program yüklenemedi');
        }
    };

    const handleDayToggle = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSave = async () => {
        try {
            await client.patch('/inspection/schedule', {
                inspectionDays: selectedDays
            });
            toast.success('Denetim günleriniz kaydedildi');
            fetchSchedule();
        } catch (e) {
            toast.error('Kaydetme başarısız');
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    if (!schedule) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Denetim Programım</h2>
                <p className="text-slate-600">Hangi günler işletmeleri denetlemeye gideceğinizi belirleyin</p>
            </div>

            {/* Day Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">Denetim Günlerim</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {DAYS.map(day => (
                        <button
                            key={day.value}
                            onClick={() => handleDayToggle(day.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedDays.includes(day.value)
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                </button>
            </div>

            {/* Assigned Companies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Sorumlu Olduğum İşletmeler</h3>

                {schedule.assignedPlacements.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Henüz atanmış işletme yok</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedule.assignedPlacements.map((placement, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start mb-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">{placement.company?.name}</h4>
                                        <p className="text-xs text-slate-500">{placement.company?.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded p-2">
                                    <User className="w-4 h-4 mr-2 text-slate-400" />
                                    <span>{placement.student?.user?.fullName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Bilgilendirme</h4>
                <p className="text-sm text-blue-700">
                    Seçtiğiniz günlerde yukarıda listelenen işletmeleri ziyaret edip öğrencilerin staj durumlarını kontrol edebilirsiniz.
                    Denetim günlerinizi değiştirmek için günlere tıklayıp "Kaydet" butonuna basın.
                </p>
            </div>
        </div>
    );
};
