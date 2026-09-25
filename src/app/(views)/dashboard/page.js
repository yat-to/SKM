'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { API_ROUTES } from '@/store/appSlice';
import { formatTanggal } from '@/lib/utils';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Star,
    Users,
    TrendingUp,
    Smile,
    MessageSquare,
    RefreshCw,
    Search,
    Award,
    Sparkles,
    Layers,
    CheckCircle2,
    Calendar,
    AppWindow,
    Filter,
    ThumbsUp
} from 'lucide-react';

// Komponen bintang rating
const StarRating = ({ rating, size = 14 }) => {
    const totalStars = 5;
    const numericRating = Math.round(Number(rating) || 0);

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    className={
                        index < numericRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                    }
                />
            ))}
        </div>
    );
};

// Custom Tooltip Recharts untuk Tren Kepuasan
const CustomTrenTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
                <p className="font-semibold text-slate-300 mb-1">Bulan {label}</p>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-blue-400/30"></span>
                    <span className="text-slate-200">Skor Rata-rata:</span>
                    <span className="font-bold text-blue-300 text-sm">{Number(payload[0].value).toFixed(2)}</span>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Tooltip Recharts untuk Kategori
const CustomKategoriTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
                <p className="font-bold text-slate-200 mb-1">{data.nilai}</p>
                <div className="flex items-center gap-2">
                    <span className="text-slate-300">Jumlah:</span>
                    <span className="font-bold text-amber-300">
                        {Number(data.jumlah).toLocaleString('id-ID')} Responden
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// Helper menentukan badge mutu SKM
const getMutuPelayanan = (skor) => {
    const num = Number(skor) || 0;
    if (num >= 4.5) return { label: 'Sangat Baik (A)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (num >= 4.0) return { label: 'Baik (B)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (num >= 3.0) return { label: 'Kurang Baik (C)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Tidak Baik (D)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
};

// Skeleton Placeholder untuk Smooth Loading State
const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-28 bg-slate-200/80 rounded-2xl"></div>

        {/* 4 KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-slate-200/70 rounded-2xl p-6"></div>
            ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200/70 rounded-2xl"></div>
            <div className="h-96 bg-slate-200/70 rounded-2xl"></div>
        </div>

        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200/70 rounded-2xl"></div>
            <div className="h-96 bg-slate-200/70 rounded-2xl"></div>
        </div>
    </div>
);

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [searchLayanan, setSearchLayanan] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    const [dashboardData, setDashboardData] = useState({
        summary: { skorKepuasan: 0, totalResponden: 0, totalLayanan: 0 },
        trenKepuasan: [],
        kategoriKepuasan: [],
        kepuasanPerLayanan: [],
        komentarPengguna: []
    });

    const getDashboardData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.URL_SKM + 'getDashboard', {
                method: "GET",
                headers: {
                    "authorization": "kikensbatara " + token
                }
            });
            const res_data = await res.json();
            setDashboardData(res_data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Gagal memuat data dashboard", err);
        } finally {
            setLoading(false);
            if (isManualRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const { summary, trenKepuasan, kategoriKepuasan, kepuasanPerLayanan, komentarPengguna } = dashboardData;

    // Filter daftar layanan berdasarkan search query
    const filteredLayanan = useMemo(() => {
        if (!kepuasanPerLayanan) return [];
        return kepuasanPerLayanan.filter((item) =>
            item.nama?.toLowerCase().includes(searchLayanan.toLowerCase())
        );
    }, [kepuasanPerLayanan, searchLayanan]);

    // Filter komentar berdasarkan rating
    const filteredKomentar = useMemo(() => {
        if (!komentarPengguna) return [];
        if (ratingFilter === 'positive') {
            return komentarPengguna.filter((k) => Number(k.rating) >= 4);
        }
        if (ratingFilter === 'critical') {
            return komentarPengguna.filter((k) => Number(k.rating) < 4);
        }
        return komentarPengguna;
    }, [komentarPengguna, ratingFilter]);

    // Hitung total responden dari kategori untuk persentase
    const totalRespondenKategori = useMemo(() => {
        if (!kategoriKepuasan || kategoriKepuasan.length === 0) return 1;
        return kategoriKepuasan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0) || 1;
    }, [kategoriKepuasan]);

    // Hitung persentase kepuasan positif (Sangat Puas + Puas)
    const persentasePuas = useMemo(() => {
        if (!kategoriKepuasan || kategoriKepuasan.length === 0) return '0.0';
        const total = kategoriKepuasan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
        if (total === 0) return '0.0';
        const puasCount = kategoriKepuasan
            .filter((item) => {
                const val = (item.nilai || '').toLowerCase();
                return val.includes('sangat puas') || val.includes('puas');
            })
            .reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
        return ((puasCount / total) * 100).toFixed(1);
    }, [kategoriKepuasan]);

    const mutuStatus = getMutuPelayanan(summary?.skorKepuasan);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header Banner Modern */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white p-6 sm:p-8 shadow-xl">
                {/* Decorative background glow */}
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/3 -bottom-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Monitoring Real-time SKM</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Dashboard Kepuasan Masyarakat
                        </h1>
                        <p className="text-sm text-blue-100/80 max-w-2xl">
                            Pemerintah Kabupaten Konawe Selatan &bull; Ringkasan performa mutu pelayanan publik dan evaluasi persepsi masyarakat.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center">
                        <button
                            onClick={() => getDashboardData(true)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                            title="Perbarui Data"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
                        </button>
                    </div>
                </div>

                {lastUpdated && (
                    <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-blue-200/70">
                        <Calendar size={13} />
                        <span>Terakhir diperbarui: {formatTanggal(lastUpdated, true)}</span>
                    </div>
                )}
            </div>

            {/* Kartu Ringkasan Metrik (KPI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Kartu 1: Skor Kepuasan */}
                <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Indeks Kepuasan (IKM)
                            </span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {Number(summary.skorKepuasan).toFixed(1)}
                                </span>
                                <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                            <Star size={24} className="fill-amber-400 text-amber-400" />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <StarRating rating={summary.skorKepuasan} size={15} />
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${mutuStatus.color}`}>
                            {mutuStatus.label}
                        </span>
                    </div>
                </div>

                {/* Kartu 2: Tingkat Kepuasan Positif */}
                <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Tingkat Kepuasan
                            </span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {persentasePuas}
                                </span>
                                <span className="text-sm font-bold text-purple-600">%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                            <ThumbsUp size={24} />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-purple-700 font-medium truncate">
                            <Sparkles size={14} className="shrink-0 text-purple-500" /> Respon Positif
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-100 text-[11px]">
                            Puas & Sangat Puas
                        </span>
                    </div>
                </div>

                {/* Kartu 3: Total Responden */}
                <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Total Responden
                            </span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {Number(summary.totalResponden).toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs font-medium text-slate-400">Warga</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 size={14} /> Partisipasi Publik
                        </span>
                        <span className="text-slate-400">Terverifikasi</span>
                    </div>
                </div>

                {/* Kartu 4: Total Layanan / Aplikasi */}
                <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Layanan & Aplikasi
                            </span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {summary.totalLayanan}
                                </span>
                                <span className="text-xs font-medium text-slate-400">Unit Layanan</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                            <Layers size={24} />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <AppWindow size={14} /> Terintegrasi SKM
                        </span>
                        <span className="text-slate-400">Konsel</span>
                    </div>
                </div>
            </div>

            {/* Bagian Visualisasi Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grafik 1: Tren Kepuasan Bulanan */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-600" />
                                <span>Tren Tingkat Kepuasan Bulanan</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Fluktuasi rata-rata skor kepuasan responden per bulan (Skala 1 - 5)
                            </p>
                        </div>
                        <span className="self-start sm:self-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                            Skala Skor: 1.0 - 5.0
                        </span>
                    </div>

                    <div className="h-72 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={trenKepuasan || []}
                                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="bulan"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 5]}
                                    ticks={[0, 1, 2, 3, 4, 5]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTrenTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="skor"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSkor)"
                                    dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafik 2: Kategori Kepuasan (Horizontal Bars) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col">
                    <div className="pb-4 mb-2 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Smile size={18} className="text-emerald-600" />
                            <span>Distribusi Kepuasan</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Jumlah responden berdasarkan kategori penilaian
                        </p>
                    </div>

                    <div className="h-60 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={kategoriKepuasan || []}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="nilai"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                                    width={90}
                                />
                                <Tooltip content={<CustomKategoriTooltip />} />
                                <Bar
                                    dataKey="jumlah"
                                    barSize={16}
                                    radius={[0, 8, 8, 0]}
                                >
                                    {(kategoriKepuasan || []).map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill || '#3b82f6'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Breakdown persentase mini */}
                    <div className="mt-auto pt-3 border-t border-slate-100 space-y-1.5">
                        {(kategoriKepuasan || []).slice(0, 3).map((item, idx) => {
                            const pct = ((Number(item.jumlah) / totalRespondenKategori) * 100).toFixed(1);
                            return (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: item.fill || '#3b82f6' }}
                                        />
                                        <span className="text-slate-600 font-medium">{item.nilai}</span>
                                    </div>
                                    <span className="font-semibold text-slate-700">
                                        {Number(item.jumlah).toLocaleString('id-ID')} ({pct}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bagian Skor per Layanan & Komentar Responden */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking Kepuasan per Aplikasi */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Award size={18} className="text-amber-500" />
                                <span>Peringkat Kepuasan per Aplikasi</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Nilai performa layanan dan jumlah partisipasi responden
                            </p>
                        </div>

                        {/* Search Input Filter */}
                        <div className="relative w-full sm:w-60">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchLayanan}
                                onChange={(e) => setSearchLayanan(e.target.value)}
                                placeholder="Cari aplikasi..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 mt-4 max-h-[380px] overflow-y-auto pr-1">
                        {filteredLayanan.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Tidak ada aplikasi yang cocok dengan kata kunci &quot;{searchLayanan}&quot;
                            </div>
                        ) : (
                            filteredLayanan.map((item, idx) => {
                                const nilaiSkor = Number(item.skor) || 0;
                                const persentase = Math.min((nilaiSkor / 5) * 100, 100);

                                // Dynamic color based on score
                                let barColor = 'bg-blue-500';
                                let textColor = 'text-blue-600 bg-blue-50 border-blue-100';
                                if (nilaiSkor >= 4.5) {
                                    barColor = 'bg-emerald-500';
                                    textColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                                } else if (nilaiSkor < 4.0) {
                                    barColor = 'bg-amber-500';
                                    textColor = 'text-amber-700 bg-amber-50 border-amber-200';
                                }

                                return (
                                    <div
                                        key={item.id || idx}
                                        className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                                    idx === 0
                                                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                                                        : idx === 1
                                                        ? 'bg-slate-200 text-slate-700'
                                                        : idx === 2
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                                <h3 className="text-sm font-semibold text-slate-800 truncate">
                                                    {item.nama}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-slate-400">
                                                    {item.responden || 0} responden
                                                </span>
                                                <span className={`text-xs px-2.5 py-0.5 font-bold rounded-lg border ${textColor}`}>
                                                    ★ {nilaiSkor.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Nilai */}
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                                                style={{ width: `${persentase}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Umpan Balik & Komentar Terbaru */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare size={18} className="text-indigo-600" />
                                <span>Aspirasi & Komentar</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Umpan balik langsung masyarakat
                            </p>
                        </div>
                    </div>

                    {/* Filter Tab Rating */}
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl my-3 text-xs font-medium text-slate-600">
                        <button
                            onClick={() => setRatingFilter('all')}
                            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                                ratingFilter === 'all'
                                    ? 'bg-white text-slate-800 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setRatingFilter('positive')}
                            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                                ratingFilter === 'positive'
                                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            Puas (★4-5)
                        </button>
                        <button
                            onClick={() => setRatingFilter('critical')}
                            className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                                ratingFilter === 'critical'
                                    ? 'bg-white text-rose-700 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            Kritik (&lt;★4)
                        </button>
                    </div>

                    <div className="space-y-3.5 mt-1 max-h-[340px] overflow-y-auto pr-1 flex-1">
                        {filteredKomentar.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                Belum ada komentar pada kategori ini.
                            </div>
                        ) : (
                            filteredKomentar.map((komen) => {
                                const initial = (komen.nama || 'A').charAt(0).toUpperCase();
                                return (
                                    <div
                                        key={komen.id}
                                        className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">
                                                        {komen.nama || 'Warga Konsel'}
                                                    </p>
                                                    <span className="inline-block text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mt-0.5">
                                                        {komen.layanan || 'Layanan Umum'}
                                                    </span>
                                                </div>
                                            </div>
                                            <StarRating rating={Number(komen.rating) || 0} size={13} />
                                        </div>

                                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/70 italic">
                                            &ldquo;{komen.komentar}&rdquo;
                                        </p>

                                        <p className="text-[11px] text-slate-400 mt-2 text-right">
                                            {komen.waktu ? formatTanggal(komen.waktu) : '-'}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

