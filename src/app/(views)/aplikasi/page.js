"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Star,
    Users,
    Edit,
    Trash2,
    X,
    Search,
    AppWindow,
    Layers
} from 'lucide-react';
import { API_ROUTES } from '@/store/appSlice';
import toast from 'react-hot-toast';

export default function Page() {
    const router = useRouter();

    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cari_value, setCariValue] = useState("");

    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const initialForm = {
        id: '',
        nama: '',
        keterangan: '',
        kategori: '',
        route: '',
        skor: 0,
        responden: 0
    };
    const [form, setForm] = useState(initialForm);

    const selectData = (data) => {
        setForm({ ...initialForm, ...data });
    };

    const openAddModal = () => {
        setForm(initialForm);
        setModalAddOpen(true);
    };

    const openEditModal = (data) => {
        selectData(data);
        setModalEditOpen(true);
    };

    const openDeleteModal = (data) => {
        selectData(data);
        setDeleteOpen(true);
    };

    // =============================== ENDPOINT ===============================
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    // Mengambil seluruh data aplikasi sekaligus tanpa paginasi (page_limit: 1000)
    const getView = useCallback(async () => {
        setLoading(true);
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
                    page_limit: 1000 // Tampilkan semua aplikasi sekaligus
                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
                    localStorage.removeItem('token');
                    router.replace('/login');
                } else {
                    toast.error("Gagal memuat data aplikasi.");
                }
                return;
            }

            const res_data = await res.json();
            setListData(res_data.data || []);
        } catch (error) {
            toast.error("Terjadi masalah koneksi ke server.");
            console.error("Fetch error in getView:", error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        getView();
    }, [getView]);

    // Filter pencarian aplikasi secara real-time pada client-side
    const filteredList = useMemo(() => {
        if (!cari_value.trim()) return listData;
        const query = cari_value.toLowerCase();
        return listData.filter((item) =>
            item.nama?.toLowerCase().includes(query) ||
            item.keterangan?.toLowerCase().includes(query) ||
            item.kategori?.toString().toLowerCase().includes(query)
        );
    }, [listData, cari_value]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoadingBtn(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'addAplikasi', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setModalAddOpen(false);
                getView();
                toast.success('Sukses Tambah Data');
            } else {
                toast.error('Gagal menambah data');
            }
        } catch (err) {
            toast.error(err.message || 'Terjadi kesalahan');
        } finally {
            setLoadingBtn(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setLoadingBtn(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'editAplikasi', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setModalEditOpen(false);
                getView();
                toast.success('Sukses Edit Data');
            } else {
                toast.error('Gagal memperbarui data');
            }
        } catch (err) {
            toast.error(err.message || 'Terjadi kesalahan');
        } finally {
            setLoadingBtn(false);
        }
    };

    const handleDelete = async () => {
        setLoadingBtn(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'removeAplikasi', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    id: form.id
                })
            });

            if (res.ok) {
                setDeleteOpen(false);
                getView();
                toast.success('Sukses Hapus Data');
            } else {
                toast.error('Gagal menghapus data');
            }
        } catch (err) {
            toast.error(err.message || 'Terjadi kesalahan');
        } finally {
            setLoadingBtn(false);
        }
    };

    // Helper warna indikator nilai skor SKM
    const getScoreTheme = (skor) => {
        const num = Number(skor) || 0;
        if (num >= 4.5) {
            return {
                accent: 'from-emerald-500 to-teal-500',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                star: 'text-emerald-500 fill-emerald-500'
            };
        }
        if (num >= 4.0) {
            return {
                accent: 'from-blue-500 to-indigo-600',
                badge: 'bg-blue-50 text-blue-700 border-blue-200',
                star: 'text-blue-500 fill-blue-500'
            };
        }
        return {
            accent: 'from-amber-400 to-orange-500',
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            star: 'text-amber-500 fill-amber-500'
        };
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Bagian Atas Modern */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <AppWindow size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                                Daftar Aplikasi & Layanan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Seluruh unit aplikasi yang terintegrasi pada Survei Kepuasan Masyarakat (SKM)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Layers size={14} className="text-blue-600" />
                        <span>{filteredList.length} Aplikasi</span>
                    </span>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Tambah Aplikasi</span>
                    </button>
                </div>
            </div>

            {/* Bar Pencarian */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={cari_value}
                    onChange={(e) => setCariValue(e.target.value)}
                    placeholder="Cari berdasarkan nama aplikasi, kategori, atau deskripsi..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                />
                {cari_value && (
                    <button
                        onClick={() => setCariValue("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* List Card Grid (Tanpa Paginasi - Tampil Semua) */}
            {loading ? (
                /* Skeleton Placeholder Loading */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-64 bg-slate-200/70 rounded-2xl p-6"></div>
                    ))}
                </div>
            ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredList.map((app, index) => {
                        const theme = getScoreTheme(app.skor);
                        const nilaiSkor = Number(app.skor) || 0;
                        const initialChar = (app.nama || 'A').charAt(0).toUpperCase();

                        return (
                            <div
                                key={app.id || index}
                                className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative"
                            >
                                {/* Top colored accent bar */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${theme.accent}`} />

                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Header Kartu: Inisial & Nama */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                                                {initialChar}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors leading-snug line-clamp-1" title={app.nama}>
                                                    {app.nama}
                                                </h3>
                                                <span className="inline-block text-[11px] font-medium text-slate-400 mt-0.5">
                                                    {app.kategori ? `Sektor: ${app.kategori}` : 'Layanan Digital Konsel'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deskripsi Aplikasi */}
                                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-1 flex-1">
                                        {app.keterangan ? app.keterangan : <span className="italic text-slate-400">Tidak ada keterangan detail mengenai aplikasi ini.</span>}
                                    </p>

                                    {/* Metrik Skor & Responden */}
                                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                                        {/* Skor IKM */}
                                        <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${theme.badge}`}>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className={theme.star} />
                                                <span className="text-sm font-extrabold">
                                                    {nilaiSkor > 0 ? nilaiSkor.toFixed(1) : '0.0'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-semibold opacity-75 mt-0.5">
                                                Skor SKM
                                            </span>
                                        </div>

                                        {/* Total Responden */}
                                        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 flex flex-col items-center justify-center text-slate-700">
                                            <div className="flex items-center gap-1 text-slate-800">
                                                <Users size={14} className="text-blue-600" />
                                                <span className="text-sm font-extrabold">
                                                    {Number(app.responden || 0).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                Responden
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Aksi di Bagian Bawah Kartu */}
                                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        ID: {app.id?.substring(0, 8)}...
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => openEditModal(app)}
                                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                            title="Edit Data"
                                        >
                                            <Edit size={15} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(app)}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus Data"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* State Kosong / Tidak Ada Hasil */
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AppWindow size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Tidak ada aplikasi yang ditemukan</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {cari_value
                            ? `Tidak ada aplikasi yang sesuai dengan pencarian "${cari_value}". Coba gunakan kata kunci lain.`
                            : "Belum ada data aplikasi yang terdaftar di sistem."}
                    </p>
                    {cari_value && (
                        <button
                            onClick={() => setCariValue("")}
                            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                            Reset Pencarian
                        </button>
                    )}
                </div>
            )}

            {/* Modal Tambah Data Modern */}
            {modalAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                            <h3 className="font-bold text-base">Tambah Aplikasi Baru</h3>
                            <button onClick={() => setModalAddOpen(false)} className="text-white hover:opacity-75 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Nama Aplikasi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nama}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                    placeholder="Contoh: FIRETAP, SAPA KONSEL"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-800 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Deskripsi / Keterangan
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                    placeholder="Jelaskan fungsi dan manfaat aplikasi ini..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-800 transition-all resize-y"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalAddOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingBtn}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {loadingBtn ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Data Modern */}
            {modalEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 flex justify-between items-center text-white">
                            <h3 className="font-bold text-base">Edit Aplikasi</h3>
                            <button onClick={() => setModalEditOpen(false)} className="text-white hover:opacity-75 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Nama Aplikasi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.nama}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-slate-800 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Deskripsi / Keterangan
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-slate-800 transition-all resize-y"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalEditOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingBtn}
                                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {loadingBtn ? 'Menyimpan...' : 'Perbarui Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Modern */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-3">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-base">Hapus Aplikasi?</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Anda akan menghapus data aplikasi <span className="font-bold text-slate-800">&quot;{form.nama}&quot;</span>. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={() => setDeleteOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loadingBtn}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-200 disabled:opacity-50 cursor-pointer"
                            >
                                {loadingBtn ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
