'use client'

import React, { useState, useEffect } from 'react';
import { API_ROUTES } from '@/store/appSlice';
import { formatTanggal } from '@/lib/utils';
import { Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Users, Briefcase, TrendingUp, Smile, MessageSquare } from 'lucide-react';

const renderRating = (rating) => {
    const totalStars = 5;
    const numericRating = Number(rating) || 0;

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={15}
                    className={
                        index < numericRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                    }
                />
            ))}
        </div>
    );
};


export default function Page() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        summary: { skorKepuasan: 0, totalResponden: 0, totalLayanan: 0 },
        trenKepuasan: [],
        kategoriKepuasan: [],
        kepuasanPerLayanan: [],
        komentarPengguna: []
    });

    const getDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.URL_SKM + 'getDashboard', {
                method: "GET",
                headers: {
                    "authorization": "kikensbatara " + token
                }
            });
            const res_data = await res.json();
            console.log("=================");
            console.log("Data dashboard:", res_data);
            console.log("=================");
            setDashboardData(res_data);
        } catch (err) {
            console.error("Gagal memuat data dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    // Destructure data agar bisa langsung dipakai di JSX existing
    const { summary, trenKepuasan, kategoriKepuasan, kepuasanPerLayanan, komentarPengguna } = dashboardData;

    if (loading) {
        return <div className="p-6 text-center text-gray-500 font-medium">Memuat data dashboard...</div>;
    }


    return (
        <div className="space-y-6">
            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6 border border-gray-200">
                    <div className="bg-blue-100 p-4 rounded-full"><Star className="text-blue-600" size={32} /></div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Skor Kepuasan</h3>
                        <p className="text-3xl font-bold text-gray-800">{Number(summary.skorKepuasan).toFixed(1)} <span className="text-lg font-medium">/ 5</span></p>
                        {/* <p className="text-3xl font-bold text-gray-800">4.5 <span className="text-lg font-medium">/ 5</span></p> */}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6 border border-gray-200">
                    <div className="bg-green-100 p-4 rounded-full"><Users className="text-green-600" size={32} /></div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Responden</h3>
                        <p className="text-3xl font-bold text-gray-800">{Number(summary.totalResponden).toLocaleString('id-ID')}</p>
                        {/* <p className="text-3xl font-bold text-gray-800">17.102</p> */}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6 border border-gray-200">
                    <div className="bg-indigo-100 p-4 rounded-full"><Briefcase className="text-indigo-600" size={32} /></div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Aplikasi</h3>
                        <p className="text-3xl font-bold text-gray-800">{summary.totalLayanan}</p>
                    </div>
                </div>
            </div>

            {/* Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tren Tingkat Kepuasan */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <TrendingUp size={20} /> Tren Tingkat Kepuasan
                    </h3>
                    <div className="mt-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trenKepuasan || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="skor" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Skor Rata-rata" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Kategori Kepuasan */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Smile size={20} /> Kategori Kepuasan
                    </h3>
                    <div className="mt-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kategoriKepuasan || []} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nilai" type="category" tick={{ fontSize: 12 }} width={85} />
                                <Tooltip />
                                <Bar dataKey="jumlah" barSize={20} name="Jumlah Responden">
                                    {kategoriKepuasan?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Skor per Layanan & Komentar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skor per Layanan */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 pb-3 border-b border-gray-200">Skor per Aplikasi</h3>
                    <div className="space-y-5 mt-4 max-h-[300px] overflow-y-auto pr-2">
                        {(kepuasanPerLayanan || []).map((data, idx) => {
                            const nilaiSkor = Number(data.skor) || 0;
                            return (
                                <div key={data.layanan || idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-medium text-gray-700">{data.nama}</p>
                                        <p className="text-sm font-bold text-blue-600">{nilaiSkor.toFixed(1)}</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((nilaiSkor / 5) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium mt-1 text-right">{data.responden || 0} Responden</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Komentar Terbaru */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 pb-3 border-b border-gray-200 flex items-center gap-2">
                        <MessageSquare size={20} /> Komentar Terbaru
                    </h3>
                    <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
                        {(komentarPengguna || []).map((komen) => (
                            <div key={komen.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{komen.nama || 'Anonim'}</p>
                                        <p className="text-xs text-gray-500">{komen.layanan || 'Umum'}</p>
                                    </div>
                                    {renderRating(Number(komen.rating) || 0)}
                                </div>
                                <p className="text-sm text-gray-600 mt-2 block break-words">{komen.komentar}</p>
                                <p className="text-xs text-gray-400 mt-2 text-right">
                                    {komen.waktu ? formatTanggal(komen.waktu) : '-'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
