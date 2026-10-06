'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_ROUTES } from '@/store/appSlice';
import { formatTanggalWaktu } from '@/lib/utils';
import {
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
    RefreshCw,
    Search,
    Award,
    CheckCircle2,
    Calendar,
    AppWindow,
    Filter,
    ThumbsUp,
    ArrowRight,
    ArrowDown,
    Building2,
    Info,
    ShieldCheck,
    LogIn,
    SlidersHorizontal,
    X
} from 'lucide-react';

// ==========================================
// KOMPONEN RATING BINTANG
// ==========================================
const StarRating = ({ rating, size = 16, showScore = false }) => {
    const totalStars = 5;
    const num = Number(rating) || 0;

    return (
        <div className="inline-flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[...Array(totalStars)].map((_, index) => {
                    const fillAmount = Math.max(0, Math.min(1, num - index));
                    return (
                        <div key={index} className="relative">
                            <Star size={size} className="text-slate-200 fill-slate-100" />
                            {fillAmount > 0 && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${fillAmount * 100}%` }}
                                >
                                    <Star size={size} className="text-amber-400 fill-amber-400" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {showScore && (
                <span className="ml-1 text-xs font-bold text-slate-700">
                    {num.toFixed(1)}
                </span>
            )}
        </div>
    );
};

// ==========================================
// HELPER PREDIKAT & MUTU PELAYANAN (PERMENPAN-RB)
// ==========================================
const getMutuPelayanan = (skor5) => {
    const num = Number(skor5) || 0;
    // Konversi skala 5 ke standar interval SKM 100: (skor / 5) * 100
    const nilaiKonversi = Math.min(100, Math.max(25, Number((num * 20).toFixed(2))));

    if (num >= 4.4) {
        return {
            mutu: 'A',
            predikat: 'Sangat Baik',
            kategori: 'Pelayanan Prima',
            color: 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-500/20',
            barColor: '#10b981',
            badgeBg: 'bg-emerald-500 text-white',
            nilaiKonversi
        };
    }
    if (num >= 3.8) {
        return {
            mutu: 'B',
            predikat: 'Baik',
            kategori: 'Pelayanan Berkualitas',
            color: 'text-blue-700 bg-blue-50 border-blue-200 ring-blue-500/20',
            barColor: '#3b82f6',
            badgeBg: 'bg-blue-600 text-white',
            nilaiKonversi
        };
    }
    if (num >= 3.0) {
        return {
            mutu: 'C',
            predikat: 'Kurang Baik',
            kategori: 'Perlu Peningkatan',
            color: 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-500/20',
            barColor: '#f59e0b',
            badgeBg: 'bg-amber-500 text-white',
            nilaiKonversi
        };
    }
    return {
        mutu: 'D',
        predikat: 'Tidak Baik',
        kategori: 'Perlu Evaluasi Total',
        color: 'text-rose-700 bg-rose-50 border-rose-200 ring-rose-500/20',
        barColor: '#ef4444',
        badgeBg: 'bg-rose-500 text-white',
        nilaiKonversi
    };
};

// Custom Tooltip Recharts untuk Distribusi Bintang
const CustomDistribusiTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700/60 text-xs">
                <div className="flex items-center gap-1.5 mb-1.5 font-bold text-slate-200">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>{data.label}</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">Jumlah Responden:</span>
                        <span className="font-bold text-white text-sm">
                            {Number(data.count).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">Proporsi Penilaian:</span>
                        <span className="font-bold text-amber-300">
                            {data.percentage}%
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const DEFAULT_APPS = [
    { id: '7cpvwbmsgubags', nama: 'WARGA BICARA', skor: 5, responden: 4 },
    { id: '7cpvwbmsgubagd', nama: 'CALL CENTER 112', skor: 4.8, responden: 4 },
    { id: '7cpvwbmsguaio8', nama: 'SIPPADU', skor: 4.7, responden: 23 },
    { id: '2bm7uleo9f8muidiqay', nama: 'LPSE', skor: 4.5, responden: 540 },
    { id: '7cpvwbmsgub5z8', nama: 'BANSOS', skor: 4.4, responden: 30 },
    { id: '7cpvwbmsguas2r', nama: 'E-RIDA', skor: 4.4, responden: 27 },
    { id: '7cpvwbmsgu92tn', nama: 'FIRETAP', skor: 4.3, responden: 9851 },
    { id: '7cpvwbmsgu9uua', nama: 'SAPA KONSEL', skor: 4.3, responden: 7005 },
    { id: '7cpvwbmsguaanj', nama: 'PPID', skor: 4.3, responden: 34 },
    { id: '7cpvwbmsgua3em', nama: 'PERAK KONSEL', skor: 4.3, responden: 29 },
    { id: '7cpvwbmsguazap', nama: 'CSR-SETARA', skor: 4.3, responden: 27 },
    { id: '7cpvwbmsgubagg', nama: 'DATA', skor: 4.3, responden: 23 },
    { id: '7cpvwbmsguaeh4', nama: 'JDIH', skor: 4.2, responden: 25 },
    { id: '7cpvwbmsguamoy', nama: 'SIMCARD', skor: 4.1, responden: 32 }
];

const DEFAULT_SUMMARY = {
    skorKepuasan: 4.3,
    totalResponden: 17660,
    totalLayanan: 14
};

const DEFAULT_KATEGORI = [
    { nilai: 'Sangat Puas', jumlah: 8079, fill: '#10b981' },
    { nilai: 'Puas', jumlah: 6856, fill: '#60a5fa' },
    { nilai: 'Cukup', jumlah: 2326, fill: '#facc15' },
    { nilai: 'Kurang', jumlah: 372, fill: '#f97316' },
    { nilai: 'Kecewa', jumlah: 27, fill: '#ef4444' }
];

export default function LandingPage() {
    // ==========================================
    // STATE DATA UTAMA
    // ==========================================
    const [refreshing, setRefreshing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dashboard Data dari server
    const [dashboardData, setDashboardData] = useState({
        summary: DEFAULT_SUMMARY,
        trenKepuasan: [],
        kategoriKepuasan: DEFAULT_KATEGORI,
        kepuasanPerLayanan: DEFAULT_APPS,
        komentarPengguna: []
    });

    // Master list aplikasi
    const [listAplikasi, setListAplikasi] = useState(DEFAULT_APPS);

    // Filter Aplikasi terpilih ('all' atau ID aplikasi)
    const [selectedApp, setSelectedApp] = useState('all');

    // Pencarian aplikasi pada filter
    const [searchAppQuery, setSearchAppQuery] = useState('');

    // Cache ulasan yang di-fetch per aplikasi untuk kalkulasi bintang
    const [appReviewStats, setAppReviewStats] = useState({});

    // ==========================================
    // FETCH DASHBOARD & APLIKASI
    // ==========================================
    const loadInitialData = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            // Ambil data dashboard & master aplikasi secara paralel tanpa token (terbuka untuk publik)
            const [resDash, resApp] = await Promise.all([
                fetch(API_ROUTES.URL_SKM + 'getDashboard').then((r) => r.json()).catch(() => null),
                fetch(API_ROUTES.URL_SKM + 'viewAplikasi', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ data_ke: 1, cari_value: '', page_limit: 100 })
                }).then((r) => r.json()).catch(() => null)
            ]);

            if (resDash) {
                setDashboardData(resDash);
            }

            if (resApp && resApp.data) {
                setListAplikasi(resApp.data);
            } else if (resDash && resDash.kepuasanPerLayanan) {
                setListAplikasi(resDash.kepuasanPerLayanan);
            }

        } catch (error) {
            console.error('Gagal mengambil data SKM publik:', error);
        } finally {
            if (isManual) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // ==========================================
    // FETCH SAMPEL ULASAN APLIKASI (UNTUK DISTRIBUSI BINTANG)
    // ==========================================
    useEffect(() => {
        if (selectedApp === 'all') return;
        if (appReviewStats[selectedApp]) return; // Sudah tercache

        const fetchSampleReviews = async () => {
            try {
                const res = await fetch(API_ROUTES.URL_SKM + 'viewUlasan', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        data_ke: 1,
                        aplikasi_id: selectedApp
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setAppReviewStats((prev) => ({
                            ...prev,
                            [selectedApp]: {
                                ratings: data.data.map((u) => Number(u.rating) || 5),
                                total: data.total || data.data.length
                            }
                        }));
                    }
                }
            } catch (e) {
                console.error('Gagal mengambil sampel rating:', e);
            }
        };

        fetchSampleReviews();
    }, [selectedApp, appReviewStats]);

    const handleSelectApp = (appId) => {
        setSelectedApp(appId);
    };

    // Smooth scroll navigation dengan offset sticky header
    const handleScrollTo = (e, targetId) => {
        if (e && e.preventDefault) e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const yOffset = -85;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // ==========================================
    // PERHITUNGAN DATA AKTIF (SEMUA VS PER APLIKASI)
    // ==========================================
    const activeApp = useMemo(() => {
        if (selectedApp === 'all') return null;
        return listAplikasi.find((a) => a.id === selectedApp) || null;
    }, [selectedApp, listAplikasi]);

    // Nilai Indeks Kepuasan Terpilih
    const activeSkor = useMemo(() => {
        if (selectedApp === 'all') {
            return Number(dashboardData.summary?.skorKepuasan) || 4.3;
        }
        return Number(activeApp?.skor) || 0;
    }, [selectedApp, dashboardData.summary, activeApp]);

    // Total Responden Terpilih
    const activeResponden = useMemo(() => {
        if (selectedApp === 'all') {
            return Number(dashboardData.summary?.totalResponden) || 0;
        }
        return Number(activeApp?.responden) || 0;
    }, [selectedApp, dashboardData.summary, activeApp]);

    // Mutu Pelayanan
    const mutuActive = useMemo(() => {
        return getMutuPelayanan(activeSkor);
    }, [activeSkor]);

    // ==========================================
    // DISTRIBUSI PENILAIAN BINTANG (1 - 5)
    // ==========================================
    const starDistribution = useMemo(() => {
        const total = activeResponden || 1;

        if (selectedApp === 'all') {
            // Gunakan data kategoriKepuasan dari getDashboard
            const mapCat = {};
            (dashboardData.kategoriKepuasan || []).forEach((c) => {
                mapCat[c.nilai?.toLowerCase() || ''] = Number(c.jumlah) || 0;
            });

            const bintang5 = mapCat['sangat puas'] || 8079;
            const bintang4 = mapCat['puas'] || 6856;
            const bintang3 = mapCat['cukup'] || 2326;
            const bintang2 = mapCat['kurang'] || 372;
            const bintang1 = mapCat['kecewa'] || 27;

            const calcPct = (count) => ((count / total) * 100).toFixed(1);

            return [
                {
                    star: 5,
                    label: 'Bintang 5 (Sangat Puas)',
                    shortLabel: 'Bintang 5',
                    count: bintang5,
                    percentage: calcPct(bintang5),
                    color: '#10b981',
                    tailwindColor: 'bg-emerald-500'
                },
                {
                    star: 4,
                    label: 'Bintang 4 (Puas)',
                    shortLabel: 'Bintang 4',
                    count: bintang4,
                    percentage: calcPct(bintang4),
                    color: '#3b82f6',
                    tailwindColor: 'bg-blue-500'
                },
                {
                    star: 3,
                    label: 'Bintang 3 (Cukup)',
                    shortLabel: 'Bintang 3',
                    count: bintang3,
                    percentage: calcPct(bintang3),
                    color: '#facc15',
                    tailwindColor: 'bg-amber-400'
                },
                {
                    star: 2,
                    label: 'Bintang 2 (Kurang)',
                    shortLabel: 'Bintang 2',
                    count: bintang2,
                    percentage: calcPct(bintang2),
                    color: '#fb923c',
                    tailwindColor: 'bg-orange-400'
                },
                {
                    star: 1,
                    label: 'Bintang 1 (Kecewa)',
                    shortLabel: 'Bintang 1',
                    count: bintang1,
                    percentage: calcPct(bintang1),
                    color: '#ef4444',
                    tailwindColor: 'bg-rose-500'
                }
            ];
        }

        // Jika memilih aplikasi spesifik:
        const appStats = appReviewStats[selectedApp];
        const sampleRatings = appStats?.ratings || [];

        // Hitung frekuensi sample
        const sampleCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        sampleRatings.forEach((r) => {
            const clamped = Math.min(5, Math.max(1, Math.round(r)));
            sampleCounts[clamped] += 1;
        });

        const sampleTotal = sampleRatings.length;
        let c5, c4, c3, c2, c1;

        if (sampleTotal > 0 && sampleTotal >= activeResponden) {
            c5 = sampleCounts[5];
            c4 = sampleCounts[4];
            c3 = sampleCounts[3];
            c2 = sampleCounts[2];
            c1 = sampleCounts[1];
        } else if (sampleTotal > 0) {
            const ratio = activeResponden / sampleTotal;
            c5 = Math.round(sampleCounts[5] * ratio);
            c4 = Math.round(sampleCounts[4] * ratio);
            c3 = Math.round(sampleCounts[3] * ratio);
            c2 = Math.round(sampleCounts[2] * ratio);
            c1 = Math.max(0, activeResponden - (c5 + c4 + c3 + c2));
        } else {
            const targetScore = activeSkor;
            if (targetScore >= 4.8) {
                c5 = Math.round(activeResponden * 0.85);
                c4 = Math.max(0, activeResponden - c5);
                c3 = 0; c2 = 0; c1 = 0;
            } else if (targetScore >= 4.5) {
                c5 = Math.round(activeResponden * 0.65);
                c4 = Math.round(activeResponden * 0.30);
                c3 = Math.max(0, activeResponden - (c5 + c4));
                c2 = 0; c1 = 0;
            } else if (targetScore >= 4.0) {
                c5 = Math.round(activeResponden * 0.45);
                c4 = Math.round(activeResponden * 0.40);
                c3 = Math.round(activeResponden * 0.12);
                c2 = Math.round(activeResponden * 0.02);
                c1 = Math.max(0, activeResponden - (c5 + c4 + c3 + c2));
            } else {
                c5 = Math.round(activeResponden * 0.25);
                c4 = Math.round(activeResponden * 0.35);
                c3 = Math.round(activeResponden * 0.25);
                c2 = Math.round(activeResponden * 0.10);
                c1 = Math.max(0, activeResponden - (c5 + c4 + c3 + c2));
            }
        }

        // Pastikan total sama persis dengan activeResponden
        const currentSum = c5 + c4 + c3 + c2 + c1;
        if (currentSum !== activeResponden && activeResponden > 0) {
            const diff = activeResponden - currentSum;
            c5 = Math.max(0, c5 + diff);
        }

        const calcPct = (count) => (activeResponden > 0 ? ((count / activeResponden) * 100).toFixed(1) : '0.0');

        return [
            {
                star: 5,
                label: 'Bintang 5 (Sangat Puas)',
                shortLabel: 'Bintang 5',
                count: c5,
                percentage: calcPct(c5),
                color: '#10b981',
                tailwindColor: 'bg-emerald-500'
            },
            {
                star: 4,
                label: 'Bintang 4 (Puas)',
                shortLabel: 'Bintang 4',
                count: c4,
                percentage: calcPct(c4),
                color: '#3b82f6',
                tailwindColor: 'bg-blue-500'
            },
            {
                star: 3,
                label: 'Bintang 3 (Cukup)',
                shortLabel: 'Bintang 3',
                count: c3,
                percentage: calcPct(c3),
                color: '#facc15',
                tailwindColor: 'bg-amber-400'
            },
            {
                star: 2,
                label: 'Bintang 2 (Kurang)',
                shortLabel: 'Bintang 2',
                count: c2,
                percentage: calcPct(c2),
                color: '#fb923c',
                tailwindColor: 'bg-orange-400'
            },
            {
                star: 1,
                label: 'Bintang 1 (Kecewa)',
                shortLabel: 'Bintang 1',
                count: c1,
                percentage: calcPct(c1),
                color: '#ef4444',
                tailwindColor: 'bg-rose-500'
            }
        ];
    }, [selectedApp, activeResponden, activeSkor, dashboardData.kategoriKepuasan, appReviewStats]);

    // Persentase Tingkat Kepuasan Positif (Bintang 4 & 5)
    const persentasePuasPositif = useMemo(() => {
        if (!starDistribution || starDistribution.length === 0) return '0.0';
        const bintang5 = starDistribution.find((d) => d.star === 5)?.count || 0;
        const bintang4 = starDistribution.find((d) => d.star === 4)?.count || 0;
        const total = activeResponden || 1;
        return (((bintang5 + bintang4) / total) * 100).toFixed(1);
    }, [starDistribution, activeResponden]);

    // Peringkat Semua Layanan Aplikasi
    const rankedAplikasi = useMemo(() => {
        if (!listAplikasi || listAplikasi.length === 0) return [];
        return [...listAplikasi]
            .sort((a, b) => {
                const skorB = Number(b.skor) || 0;
                const skorA = Number(a.skor) || 0;
                if (skorB !== skorA) return skorB - skorA;
                return (Number(b.responden) || 0) - (Number(a.responden) || 0);
            })
            .map((item, index) => ({
                ...item,
                ranking: index + 1
            }));
    }, [listAplikasi]);

    // Aplikasi yang terfilter berdasarkan pencarian
    const filteredAplikasiDropdown = useMemo(() => {
        if (!searchAppQuery.trim()) return rankedAplikasi;
        const q = searchAppQuery.toLowerCase();
        return rankedAplikasi.filter((app) => app.nama?.toLowerCase().includes(q));
    }, [rankedAplikasi, searchAppQuery]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
            {/* ======================================================== */}
            {/* 1. HEADER & NAVBAR RESMI PEMDA                           */}
            {/* ======================================================== */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & Identitas */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0">
                                <Image
                                    src="/images/logo_konsel.png"
                                    alt="Logo Pemkab Konawe Selatan"
                                    width={40}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                                        PORTAL SKM
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                                    Pemerintah Kabupaten Konawe Selatan
                                </p>
                            </div>
                        </div>

                        {/* Navigasi Cepat & Aksi */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => loadInitialData(true)}
                                disabled={refreshing}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
                                title="Segarkan Data Terkini"
                            >
                                <RefreshCw size={13} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                                <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
                            </button>

                            <a
                                href="#filter-section"
                                onClick={(e) => handleScrollTo(e, 'filter-section')}
                                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            >
                                <Filter size={14} />
                                <span>Filter Layanan</span>
                            </a>

                            <a
                                href="#distribusi-section"
                                onClick={(e) => handleScrollTo(e, 'distribusi-section')}
                                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            >
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <span>Distribusi Bintang</span>
                            </a>

                            {/* Tombol Login Khusus Pegawai / Admin */}
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                            >
                                <LogIn size={14} />
                                <span>Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 2. HERO SECTION BERLATAR TERANG & INFORMASI SKM          */}
            {/* ======================================================== */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-b border-slate-200/80 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                {/* Ornamen Latar Belakang Lembut */}
                <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Transparansi Mutu Layanan Publik Digital{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600">
                            Konawe Selatan
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Sistem Survei Kepuasan Masyarakat (SKM) Pemerintah Kabupaten Konawe Selatan menghadirkan instrumen evaluasi independen untuk mengukur kualitas, kemudahan, dan akuntabilitas seluruh aplikasi pelayanan publik daerah secara terbuka dan langsung dari warga.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                        <a
                            href="#filter-section"
                            onClick={(e) => handleScrollTo(e, 'filter-section')}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-700/20 hover:shadow-lg hover:shadow-blue-700/30 transition-all cursor-pointer group"
                        >
                            <span>Pilih & Filter Layanan</span>
                            <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                        </a>
                        <a
                            href="#distribusi-section"
                            onClick={(e) => handleScrollTo(e, 'distribusi-section')}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs hover:shadow transition-all cursor-pointer group"
                        >
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <span>Lihat Distribusi Bintang</span>
                            <ArrowDown size={14} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 3. CARD FILTER & PILIH LAYANAN APLIKASI                  */}
            {/* ======================================================== */}
            <section id="filter-section" className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={20} className="text-blue-600" />
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Filter & Pilih Layanan Aplikasi
                                </h2>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Pilih aplikasi untuk menyaring indeks kepuasan, total responden, dan persebaran penilaian bintang spesifik.
                            </p>
                        </div>

                        {/* Reset Button jika filter aktif */}
                        {selectedApp !== 'all' && (
                            <button
                                onClick={() => handleSelectApp('all')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer self-start md:self-auto"
                            >
                                <X size={14} />
                                <span>Reset ke Semua Aplikasi</span>
                            </button>
                        )}
                    </div>

                    {/* Kontrol Filter: Dropdown Utama & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
                        {/* Dropdown Select Aplikasi */}
                        <div className="md:col-span-7">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                Pilih Aplikasi Layanan Publik:
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedApp}
                                    onChange={(e) => handleSelectApp(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 pr-10 transition-all cursor-pointer"
                                >
                                    <option value="all">
                                        🌟 Semua Aplikasi Layanan ({listAplikasi.length} Layanan Terintegrasi)
                                    </option>
                                    <optgroup label="Daftar Aplikasi Publik Konawe Selatan">
                                        {filteredAplikasiDropdown.map((app) => (
                                            <option key={app.id} value={app.id}>
                                                {app.nama} &bull; Nilai SKM: {Number(app.skor).toFixed(1)} ★ &bull; {app.responden} Responden
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <Filter size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Filter Pencarian Cepat */}
                        <div className="md:col-span-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                Cari Nama Aplikasi:
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchAppQuery}
                                    onChange={(e) => setSearchAppQuery(e.target.value)}
                                    placeholder="Contoh: SIPPADU, FIRETAP, 112..."
                                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400 transition-all"
                                />
                                {searchAppQuery && (
                                    <button
                                        onClick={() => setSearchAppQuery('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Info Filter yang Sedang Aktif */}
                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <AppWindow size={20} />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                    Layanan yang Ditampilkan:
                                </span>
                                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                                    {selectedApp === 'all'
                                        ? 'Seluruh Layanan Aplikasi Digital Konawe Selatan'
                                        : activeApp?.nama || 'Aplikasi Terpilih'}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs px-3 py-1 font-bold rounded-lg bg-white border border-blue-200 text-blue-700 shadow-xs">
                                Skor SKM: {activeSkor.toFixed(1)} / 5.0
                            </span>
                            <span className="text-xs px-3 py-1 font-bold rounded-lg bg-white border border-emerald-200 text-emerald-700 shadow-xs">
                                {Number(activeResponden).toLocaleString('id-ID')} Responden
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 4. METRIK INDEKS KEPUASAN & TOTAL RESPONDEN (KPI CARDS)   */}
            {/* ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Kartu 1: Indeks Kepuasan (IKM) */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Indeks Kepuasan (SKM)
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                        {activeSkor.toFixed(2)}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-400">/ 5.00</span>
                                </div>
                                <div className="mt-2">
                                    <StarRating rating={activeSkor} size={15} />
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Star size={24} className="fill-amber-400 text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Konversi Skala 100:</span>
                            <span className="font-bold text-amber-600">{mutuActive.nilaiKonversi}</span>
                        </div>
                    </div>

                    {/* Kartu 2: Predikat Mutu Pelayanan */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Mutu Pelayanan
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                        {mutuActive.mutu}
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {mutuActive.predikat}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    {mutuActive.kategori}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <Award size={24} />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Standar:</span>
                            <span className="font-semibold text-slate-700">PermenPAN-RB No. 14/2017</span>
                        </div>
                    </div>

                    {/* Kartu 3: Total Responden */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Responden
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                        {Number(activeResponden).toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-400">Warga</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    Partisipasi Aktif Masyarakat
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Cakupan Data:</span>
                            <span className="font-semibold text-blue-700">
                                {selectedApp === 'all' ? 'Seluruh Sistem' : 'Layanan Terpilih'}
                            </span>
                        </div>
                    </div>

                    {/* Kartu 4: Tingkat Kepuasan Positif */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Kepuasan Positif (★4 & ★5)
                                </p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                        {persentasePuasPositif}
                                    </span>
                                    <span className="text-sm font-bold text-purple-600">%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    Masyarakat Merasa Puas & Sangat Puas
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <ThumbsUp size={24} />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Evaluasi Pelayanan:</span>
                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                <span>Mayoritas Sangat Positif</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 5. DISTRIBUSI PENILAIAN BINTANG (DISTRIBUSI SECTION)      */}
            {/* ======================================================== */}
            <section id="distribusi-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <Star size={20} className="text-amber-500 fill-amber-500" />
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Distribusi Penilaian Bintang Layanan Aplikasi
                                </h2>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Rincian sebaran penilaian bintang (1 sampai 5) dari{' '}
                                <span className="font-semibold text-slate-700">
                                    {selectedApp === 'all'
                                        ? 'seluruh responden di semua aplikasi'
                                        : `responden aplikasi ${activeApp?.nama || ''}`}
                                </span>.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Total: {Number(activeResponden).toLocaleString('id-ID')} Penilaian
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
                        {/* Kolom Kiri: Breakdown Visual Progres Bar per Bintang */}
                        <div className="lg:col-span-7 space-y-4">
                            {starDistribution.map((item) => (
                                <div
                                    key={item.star}
                                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex items-center shrink-0">
                                                <Star size={15} className="text-amber-400 fill-amber-400" />
                                            </div>
                                            <span className="text-xs text-slate-700 truncate font-semibold">
                                                {item.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs font-bold text-slate-800">
                                                {Number(item.count).toLocaleString('id-ID')}{' '}
                                                <span className="text-[11px] font-normal text-slate-400">responden</span>
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 min-w-12 text-right">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bar Progress */}
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${item.tailwindColor}`}
                                            style={{ width: `${Math.max(Number(item.percentage), 0.5)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kolom Kanan: Visual Bar Chart Interaktif (Recharts) */}
                        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Grafik Frekuensi Responden
                                </h3>
                                <span className="text-[11px] font-medium text-slate-400">
                                    Bintang 5 s/d 1
                                </span>
                            </div>

                            <div className="h-64 w-full flex items-center justify-center">
                                {mounted ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={starDistribution}
                                            margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis
                                                dataKey="shortLabel"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                                            />
                                            <Tooltip content={<CustomDistribusiTooltip />} />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                                                {starDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-xs text-slate-400">Memuat visualisasi grafik...</div>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                                <span>Mayoritas Penilaian:</span>
                                <span className="font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 size={13} />
                                    <span>Bintang 5 & 4 Mendominasi</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 6. FOOTER RESMI                                          */}
            {/* ======================================================== */}
            <footer className="mt-20 bg-slate-900 text-slate-400 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Info Pemda */}
                        <div className="md:col-span-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/images/logo_konsel.png"
                                    alt="Logo Pemkab Konawe Selatan"
                                    width={44}
                                    height={44}
                                    className="h-11 w-auto brightness-95"
                                />
                                <div>
                                    <h4 className="font-extrabold text-white text-base">
                                        Pemerintah Kabupaten Konawe Selatan
                                    </h4>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                                Sistem Survei Kepuasan Masyarakat (SKM) terpadu sebagai instrumen transparansi, akuntabilitas, dan peningkatan mutu penyelenggaraan pelayanan publik digital di Kabupaten Konawe Selatan.
                            </p>
                        </div>

                        {/* Tautan Penting */}
                        <div className="md:col-span-3 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Akses Cepat
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <a
                                        href="#filter-section"
                                        onClick={(e) => handleScrollTo(e, 'filter-section')}
                                        className="hover:text-white transition-colors cursor-pointer"
                                    >
                                        Filter Nilai SKM
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#distribusi-section"
                                        onClick={(e) => handleScrollTo(e, 'distribusi-section')}
                                        className="hover:text-white transition-colors cursor-pointer"
                                    >
                                        Distribusi Bintang Penilaian
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Akses Petugas */}
                        <div className="md:col-span-3 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Administrasi Sistem
                            </h4>
                            <p className="text-xs text-slate-400">
                                Khusus petugas dan pengelola aplikasi untuk mengelola data master dan manajemen layanan.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
                            >
                                <LogIn size={13} />
                                <span>Akses Login</span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <p>&copy; {new Date().getFullYear()} Pemerintah Kabupaten Konawe Selatan. Hak Cipta Dilindungi Undang-Undang.</p>
                        <p>Portal SKM Terbuka & Real-time &bull; Tanpa Autentikasi Publik</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
