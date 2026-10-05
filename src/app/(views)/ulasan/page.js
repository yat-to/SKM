"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Star, Filter, X } from 'lucide-react';
import { API_ROUTES } from '@/store/appSlice';
import toast from 'react-hot-toast';
import { formatTanggal } from '@/lib/utils';

export default function Page() {
    const router = useRouter();

    const [page_first, setPageFirst] = useState(1);
    const [page_last, setPageLast] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);

    // List master aplikasi untuk filter dropdown
    const [listAplikasi, setListAplikasi] = useState([]);
    const [selectedApp, setSelectedApp] = useState("all");

    const page_limit = 10;

    // Modal state bawaan
    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const initialForm = {
        id: '',
        title: '',
        icon: '',
        color: '',
        route: '',
        type: '',
        urutan: 0
    };
    const [form, setForm] = useState(initialForm);

    const openAddModal = () => {
        setForm(initialForm);
        setModalAddOpen(true);
    };

    // =============================== ENDPOINT ===============================
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    // Ambil daftar aplikasi dari master
    const getAplikasiList = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'viewAplikasi', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    data_ke: 1,
                    cari_value: "",
                    page_limit: 100
                })
            });
            const res_data = await res.json();
            setListAplikasi(res_data.data || []);
        } catch (error) {
            console.error("Gagal memuat master aplikasi:", error);
        }
    };

    // Ambil ulasan dari server berdasarkan nomor halaman dan filter aplikasi
    const getView = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'viewUlasan', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    data_ke: page_first,
                    aplikasi_id: selectedApp !== "all" ? selectedApp : ""
                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
                    localStorage.removeItem('token');
                    router.replace('/login');
                } else {
                    toast.error("Gagal memuat data.");
                }
                return;
            }

            const res_data = await res.json();
            setListData(res_data.data || []);
            setPageLast(res_data.jml_data || 1);
            setTotalData(res_data.total || 0);
        } catch (error) {
            toast.error("Terjadi masalah koneksi ke server.");
            console.error("Fetch error in getView:", error);
        } finally {
            setLoading(false);
        }
    }, [page_first, selectedApp, router]);

    useEffect(() => {
        getAplikasiList();
    }, []);

    useEffect(() => {
        getView();
    }, [getView]);

    // Handle saat user mengganti opsi dropdown aplikasi
    const handleFilterChange = (appId) => {
        setSelectedApp(appId);
        setPageFirst(1);
    };

    // Nama aplikasi yang sedang dipilih untuk display text
    const selectedAppName = useMemo(() => {
        if (selectedApp === 'all') return 'Semua Aplikasi';
        return listAplikasi.find((a) => a.id === selectedApp)?.nama || selectedApp;
    }, [selectedApp, listAplikasi]);

    // =============================== PAGINASI ===============================
    const btn_prev = () => {
        if (page_first > 1) {
            setPageFirst((prev) => prev - 1);
        }
    };

    const btn_next = () => {
        if (page_first < page_last) {
            setPageFirst((prev) => prev + 1);
        }
    };

    const indexing = (index) => {
        return ((page_first - 1) * page_limit) + index;
    };
    // =============================== PAGINASI ===============================

    return (
        <div className="space-y-6 pb-10">
            {/* Header dengan Dropdown Filter Aplikasi */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ulasan & Komen</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Dropdown Filter Aplikasi Saja */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                        <Filter size={16} className="text-gray-400" />
                        <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Aplikasi:</label>
                        <select
                            value={selectedApp}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer pr-1"
                        >
                            <option value="all">Semua Aplikasi</option>
                            {listAplikasi.map((app) => (
                                <option key={app.id} value={app.id}>
                                    {app.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => openAddModal()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
                        disabled
                    >
                        <Plus size={18} />
                        <span>Tambah Data</span>
                    </button>
                </div>
            </div>

            {/* List Tabel Ulasan Asli */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-spacing-0">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-12">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-44">Nama Pengguna</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-48">Aplikasi</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-36">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">Komentar</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-200 w-40">Tanggal Survey</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : listData.length > 0 ? (
                                listData.map((data, index) => (
                                    <tr key={data.id || index} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">
                                                {indexing(index + 1)}.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">{data.nama || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">{data.app || data.aplikasi_id || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/60 shadow-2xs">
                                                <Star size={15} className="fill-amber-400 text-amber-400 shrink-0" />
                                                <span className="text-xs font-bold text-amber-700">
                                                    {Number(data.rating) > 0 ? Number(data.rating).toFixed(1) : '0'}
                                                </span>
                                                <span className="text-[10px] text-amber-500 font-medium">/ 5</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">{data.komentar || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200">
                                            <span className="text-sm text-gray-800">{formatTanggal(data.createdAt)}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-20 text-gray-500 italic">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span>
                                                Tidak ada data ulasan yang ditemukan{selectedApp !== 'all' ? ` untuk aplikasi ${selectedAppName}` : ''}.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginasi Asli Server-side */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <span className="text-xs text-gray-500 hidden sm:block">
                        Halaman {page_first} dari {page_last} {totalData > 0 ? `(Total ${totalData.toLocaleString('id-ID')} ulasan)` : ''}
                    </span>
                    <div className="flex items-center gap-2 mx-auto sm:mx-0">
                        <button
                            onClick={btn_prev}
                            disabled={page_first <= 1}
                            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            title="Halaman Sebelumnya"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-9 h-9 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200">
                            {page_first}
                        </button>
                        <button
                            onClick={btn_next}
                            disabled={page_first >= page_last}
                            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            title="Halaman Berikutnya"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Bawaan */}
            {modalAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b bg-blue-300 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Tambah Data</h3>
                            <button onClick={() => setModalAddOpen(false)} className="text-white hover:opacity-70"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                        <div className="px-3 py-2 bg-gray-200 flex justify-end gap-2">
                            <button type="button" onClick={() => setModalAddOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 bg-red-500 rounded-lg text-sm text-white font-semibold cursor-pointer">Batal</button>
                            <button type="button" disabled={loadingBtn} className="px-4 py-2 bg-blue-300 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50 cursor-pointer">
                                {loadingBtn ? 'Proses...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}