import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Building2, TrendingUp, Lightbulb, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import client from '../api/client';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} bg-opacity-10 mr-4`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
    </div>
);

interface Suggestion {
    type: 'warning' | 'info' | 'success';
    icon: any;
    title: string;
    message: string;
    action?: string;
    actionLink?: string;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [stats, setStats] = useState({
        students: 0,
        companies: 0,
        placements: 0,
        inspectionDays: 0
    });

    useEffect(() => {
        if (user?.role === 'Teacher' || user?.role === 'Admin') {
            fetchTeacherData();
        }
    }, [user]);

    const fetchTeacherData = async () => {
        try {
            const [studentsRes, companiesRes, placementsRes, scheduleRes] = await Promise.all([
                client.get('/students'),
                client.get('/companies'),
                client.get('/placements'),
                client.get('/inspection/schedule').catch(() => ({ data: { inspectionDays: [] } }))
            ]);

            const students = studentsRes.data;
            const companies = companiesRes.data;
            const placements = placementsRes.data;
            const schedule = scheduleRes.data;

            setStats({
                students: students.length,
                companies: companies.length,
                placements: placements.length,
                inspectionDays: schedule.inspectionDays?.length || 0
            });

            // Generate smart suggestions
            const newSuggestions: Suggestion[] = [];

            // Check inspection days
            if (!schedule.inspectionDays || schedule.inspectionDays.length === 0) {
                newSuggestions.push({
                    type: 'warning',
                    icon: Clock,
                    title: 'Denetim Günlerinizi Belirleyin',
                    message: 'Henüz denetim günü belirlemediniz. İşletmeleri düzenli kontrol etmek için haftanın hangi günlerini ayıracağınızı belirleyin.',
                    action: 'Denetim Programı',
                    actionLink: '/inspection'
                });
            }

            // Check ungraded students
            const ungradedStudents = students.filter((s: any) => !s.internshipScore);
            if (ungradedStudents.length > 0) {
                newSuggestions.push({
                    type: 'info',
                    icon: AlertCircle,
                    title: `${ungradedStudents.length} Öğrenci Henüz Notlandırılmadı`,
                    message: 'Bazı öğrencilerin staj notları girilmemiş. Değerlendirme sayfasından notları girebilirsiniz.',
                    action: 'Değerlendirme',
                    actionLink: '/evaluation'
                });
            }

            // Check companies without ratings
            const unratedCompanies = companies.filter((c: any) => !c.ratingCount || c.ratingCount === 0);
            if (unratedCompanies.length > 0) {
                newSuggestions.push({
                    type: 'info',
                    icon: Building2,
                    title: `${unratedCompanies.length} İşletme Henüz Puanlanmadı`,
                    message: 'Bazı işletmeler öğrenciler tarafından henüz değerlendirilmemiş. Öğrencileri işletmelerini puanlamaya teşvik edin.',
                    action: 'İşletmeler',
                    actionLink: '/companies'
                });
            }

            // Check attendance
            const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const tomorrow = (today + 1) % 7;

            if (schedule.inspectionDays?.includes(today)) {
                newSuggestions.push({
                    type: 'success',
                    icon: CheckCircle,
                    title: 'Bugün Denetim Gününüz!',
                    message: 'Bugün belirlediğiniz denetim günlerinden biri. Sorumlu olduğunuz işletmeleri ziyaret etmeyi unutmayın.',
                    action: 'Denetim Programı',
                    actionLink: '/inspection'
                });
            } else if (schedule.inspectionDays?.includes(tomorrow)) {
                const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                newSuggestions.push({
                    type: 'warning',
                    icon: AlertCircle,
                    title: 'Yarın Denetim Gününüz!',
                    message: `Yarın ${dayNames[tomorrow]} günü işletme denetiminiz var. Ziyaret edeceğiniz işletmeleri ve öğrencileri kontrol edin.`,
                    action: 'Denetim Programı',
                    actionLink: '/inspection'
                });
            }

            // Check for internships ending soon (within 7 days)
            const today_date = new Date();
            const endingSoonPlacements = placements.filter((p: any) => {
                const endDate = new Date(p.endDate);
                const daysUntilEnd = Math.ceil((endDate.getTime() - today_date.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilEnd > 0 && daysUntilEnd <= 7;
            });

            if (endingSoonPlacements.length > 0) {
                newSuggestions.push({
                    type: 'info',
                    icon: Clock,
                    title: `${endingSoonPlacements.length} Öğrencinin Stajı Bu Hafta Bitiyor`,
                    message: 'Bazı öğrencilerin staj bitiş tarihi yaklaşıyor. Final değerlendirmelerini ve belgelerini kontrol edin.',
                    action: 'Atamalar',
                    actionLink: '/placements'
                });
            }

            // Check for students without placement
            const studentsWithoutPlacement = students.filter((s: any) => {
                return !placements.some((p: any) => p.studentId === s.id);
            });

            if (studentsWithoutPlacement.length > 0) {
                newSuggestions.push({
                    type: 'warning',
                    icon: AlertCircle,
                    title: `${studentsWithoutPlacement.length} Öğrenci Henüz Atanmadı`,
                    message: 'Bazı öğrenciler henüz bir işletmeye atanmamış. Atama sayfasından öğrencileri işletmelere yerleştirebilirsiniz.',
                    action: 'Yeni Atama',
                    actionLink: '/placements/new'
                });
            }

            // General tips
            if (newSuggestions.length === 0) {
                newSuggestions.push({
                    type: 'success',
                    icon: CheckCircle,
                    title: 'Her Şey Yolunda!',
                    message: 'Tüm görevleriniz güncel görünüyor. Devamsızlık kontrollerini ve öğrenci değerlendirmelerini düzenli takip etmeye devam edin.',
                });
            }

            setSuggestions(newSuggestions);
        } catch (error) {
            console.error('Error fetching teacher data:', error);
        }
    };

    const getSuggestionColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            default: return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-amber-600';
            case 'info': return 'text-blue-600';
            case 'success': return 'text-emerald-600';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-600 rounded-xl p-8 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Merhaba, {user?.fullName}</h2>
                    <p className="text-indigo-100">Staj yönetim paneline hoş geldiniz.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Smart Assistant for Teachers */}
            {(user?.role === 'Teacher' || user?.role === 'Admin') && suggestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
                        Akıllı Asistan
                    </h3>
                    <div className="space-y-3">
                        {suggestions.map((suggestion, idx) => (
                            <div key={idx} className={`border rounded-lg p-4 ${getSuggestionColor(suggestion.type)}`}>
                                <div className="flex items-start">
                                    <suggestion.icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${getIconColor(suggestion.type)}`} />
                                    <div className="flex-1">
                                        <h4 className="font-bold mb-1">{suggestion.title}</h4>
                                        <p className="text-sm opacity-90 mb-2">{suggestion.message}</p>
                                        {suggestion.action && suggestion.actionLink && (
                                            <a
                                                href={suggestion.actionLink}
                                                className={`inline-flex items-center text-sm font-medium underline hover:no-underline ${getIconColor(suggestion.type)}`}
                                            >
                                                {suggestion.action} →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {user?.role === 'Student' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                        Teslim Edilmesi Gereken Belgeler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            "İşletmelerde Beceri Eğitimi Sözleşmesi",
                            "İşletme Kabul Yazısı",
                            "Veli İzin Belgesi",
                            "T.C. Kimlik Fotokopisi",
                            "Öğrenci Belgesi",
                            "SGK İşe Giriş Bildirgesi (okul/MEB)",
                            "Staj Dosyası (Beceri Eğitimi Defteri)",
                            "Vesikalık Fotoğraf"
                        ].map((doc, i) => (
                            <div key={i} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="min-w-[20px] h-5 flex items-center justify-center bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mr-2 mt-0.5">
                                    {i + 1}
                                </div>
                                <span className="text-sm text-slate-700">{doc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(user?.role === 'Teacher' || user?.role === 'Admin') ? (
                    <>
                        <StatCard title="Toplam Öğrenci" value={stats.students} icon={Users} color="bg-blue-500 text-blue-500" />
                        <StatCard title="Aktif İşletmeler" value={stats.companies} icon={Building2} color="bg-emerald-500 text-emerald-500" />
                        <StatCard title="Aktif Atamalar" value={stats.placements} icon={BookOpen} color="bg-violet-500 text-violet-500" />
                        <StatCard title="Denetim Günleri" value={stats.inspectionDays} icon={Clock} color="bg-orange-500 text-orange-500" />
                    </>
                ) : (
                    <>
                        <StatCard title="Toplam Öğrenci" value="12" icon={Users} color="bg-blue-500 text-blue-500" />
                        <StatCard title="Aktif İşletmeler" value="5" icon={Building2} color="bg-emerald-500 text-emerald-500" />
                        <StatCard title="Aktif Atamalar" value="8" icon={BookOpen} color="bg-violet-500 text-violet-500" />
                        <StatCard title="Başarı Oranı" value="%94" icon={TrendingUp} color="bg-orange-500 text-orange-500" />
                    </>
                )}
            </div>

            {/* Recent Activity or Quick Actions could go here */}
        </div>
    );
};
