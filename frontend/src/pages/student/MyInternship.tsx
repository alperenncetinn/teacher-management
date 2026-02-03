import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import type { Placement } from '../../types';
import { Briefcase, Calendar, MapPin, Loader, User as UserIcon } from 'lucide-react';

export const MyInternship: React.FC = () => {
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlacement = async () => {
            try {
                // Returns array, but student usually has one active placement for MVP
                const { data } = await client.get<Placement[]>('/placements');
                if (data.length > 0) {
                    setPlacement(data[0]);
                }
            } catch (e) {
                console.error("Failed to fetch internship");
            } finally {
                setLoading(false);
            }
        };
        fetchPlacement();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Yükleniyor...</span>
        </div>
    );

    if (!placement) return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Henüz bir staj atamanız yok.</h3>
            <p className="text-slate-500">Koordinatör öğretmeniniz tarafından atama yapıldığında burada görüntülenecektir.</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Staj Bilgilerim</h1>
                    <p className="text-blue-100 opacity-90">Aktif staj detaylarınız aşağıdadır.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Info */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                        İşletme Bilgileri
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">İşletme Adı</p>
                            <p className="text-xl font-semibold text-slate-900">{placement.company?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Adres</p>
                            <div className="flex items-start text-slate-700">
                                <MapPin className="w-4 h-4 mr-1 mt-1 shrink-0 text-slate-400" />
                                {placement.company?.address}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dates & Schedule */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Takvim
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Başlangıç - Bitiş</p>
                            <p className="font-medium text-slate-900">
                                {new Date(placement.startDate).toLocaleDateString('tr-TR')} - {new Date(placement.endDate).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Staj Günleri</p>
                            <div className="flex flex-wrap gap-2">
                                {placement.internDays.sort().map(day => {
                                    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                                    return (
                                        <span key={day} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                                            {dayNames[day]}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Koordinatör Öğretmen
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Öğretmen Adı</p>
                                <p className="font-medium text-slate-900">{placement.teacher?.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">İletişim (E-posta)</p>
                                <p className="font-medium text-slate-900 break-all">{placement.teacher?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grade / Score View */}
            {placement.student?.internshipScore !== undefined && placement.student?.internshipScore !== null && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center relative overflow-hidden mb-6">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Staj Başarı Puanı</h3>
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-orange-600 mb-2">
                        {placement.student.internshipScore}
                    </div>
                    <p className="text-sm text-slate-500">100 üzerinden değerlendirilmiştir.</p>
                    <div className="mt-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-6 h-6 ${star <= Math.round(placement.student!.internshipScore! / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ))}
                    </div>
                </div>
            )}

            {/* Attendance Rules - Student View */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Devamsızlık Bilgilendirmesi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h4 className="font-bold text-red-800 mb-2">Devamsızlık Sınırı</h4>
                            <p className="text-red-700 text-sm">
                                Staj süresinin <span className="font-bold">%10’unu geçemez</span>.
                                <br />(Örnek: 40 gün staj → En fazla 4 gün)
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h4 className="font-bold text-red-800 mb-2">Aşılırsa</h4>
                            <p className="text-red-700 text-sm font-semibold">Staj geçersiz sayılır, tekrar yapılır.</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-slate-600">
                        <div>
                            <p className="font-bold text-slate-800 mb-1">Devamsızlık Sayılan Haller:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Gelinmeyen gün</li>
                                <li>Geç gelme / Erken çıkma</li>
                                <li>İmzasız günler</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 mb-1">Devamsızlık Sayılmayan Haller:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Sağlık raporu (belgeli)</li>
                                <li>Okul tarafından verilen resmi izin</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Evaluation Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    İşletmeyi Değerlendir
                </h3>

                {placement.studentRating ? (
                    <div className="bg-indigo-50 rounded-lg p-6 max-w-lg mx-auto text-center">
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className={`w-8 h-8 ${star <= placement.studentRating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-slate-300'}`} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-slate-700 italic mb-2">"{placement.studentComment || 'Yorum yok'}"</p>
                        <p className="text-xs text-slate-400">Değerlendirmeniz kaydedildi.</p>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto text-center">
                        <p className="text-slate-600 mb-4">Staj yaptığınız işletmeyi değerlendirin</p>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => {
                                        const comment = prompt('İşletme hakkında yorumunuz (İsteğe bağlı):');
                                        client.post(`/placements/${placement.id}/rate`, {
                                            rating: star,
                                            comment: comment || ''
                                        }).then(() => {
                                            alert('Değerlendirmeniz için teşekkürler!');
                                            setPlacement({ ...placement, studentRating: star, studentComment: comment || '' });
                                        }).catch(() => alert('Hata oluştu.'));
                                    }}
                                    className="transform transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <svg className="w-10 h-10 text-slate-300 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">Puanlamak için bir yıldıza tıklayın.</p>
                    </div>
                )}
            </div>

            {/* Additional sections like Attendance can go here later */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-2">Önemli Hatırlatma</h4>
                <p className="text-sm text-blue-700">
                    Staj defterinizi doldurmayı ve devamsızlık yapmamaya özen gösterin. Herhangi bir sorun durumunda koordinatör öğretmeniniz ile iletişime geçiniz.
                </p>
            </div>
        </div >
    );
};
