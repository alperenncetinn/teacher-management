import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    LogOut,
    FileText,
    Clipboard,
    Award,
    ClipboardCheck
} from 'lucide-react';
import clsx from 'clsx';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Kontrol Paneli', href: '/', icon: LayoutDashboard, roles: ['Admin', 'Teacher', 'Student', 'CompanyUser'] },
        { name: 'Öğretmenler', href: '/teachers', icon: Users, roles: ['Admin'] },
        { name: 'Öğrenciler', href: '/students', icon: Users, roles: ['Admin', 'Teacher'] },
        { name: 'İşletmeler', href: '/companies', icon: Building2, roles: ['Admin', 'Teacher'] },
        { name: 'Atamalar', href: '/placements', icon: Briefcase, roles: ['Admin', 'Teacher'] },
        { name: 'Devamsızlık', href: '/attendance', icon: Clipboard, roles: ['Admin', 'Teacher'] },
        { name: 'Değerlendirme', href: '/evaluation', icon: Award, roles: ['Admin', 'Teacher'] },
        { name: 'Denetim Programı', href: '/inspection', icon: ClipboardCheck, roles: ['Teacher'] },
        { name: 'Stajım', href: '/my-internship', icon: FileText, roles: ['Student'] },
    ];

    const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        StajYonetim
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Staj Yönetim Paneli</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={clsx(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {user?.fullName.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.fullName}</p>
                            <p className="text-xs text-slate-400">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-200 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center px-8">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
                    </h2>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
