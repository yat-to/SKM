"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Star, Users, ChevronLeft, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import { API_ROUTES } from '@/store/appSlice';
import toast from 'react-hot-toast';

export default function Page() {
    const router = useRouter();
    const [page_first, setPageFirst] = useState(1);
    const [page_last, setPageLast] = useState(0);

    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true); // Tambahkan state loading

    const [cari_value, setCariValue] = useState("");

    const page_limit = 10;

    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const initialForm = {
        id: '',
        nama: '',
        keterangan: '',
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
            // Jika tidak ada token, alihkan ke halaman login.
            // Menggunakan `replace` agar pengguna tidak bisa kembali ke halaman ini dengan tombol "back" browser.
            router.replace('/login'); // Ganti '/login' dengan path halaman login Anda jika berbeda
        }
    }, []);

    const getView = async () => {
        setLoading(true); // Set loading ke true sebelum fetch
        const token = localStorage.getItem('token');
        // Pemeriksaan token tambahan untuk mencegah pemanggilan API yang tidak perlu
        if (!token) return;

        try {
            const res = await fetch(API_ROUTES.URL_SKM + 'viewAplikasi', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    data_ke: page_first,
                    cari_value: cari_value,
                    page_limit: page_limit
                })
            });

            if (!res.ok) {
                // Jika token tidak valid/kadaluarsa, API akan mengembalikan status 401
                if (res.status === 401) {
                    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
                    localStorage.removeItem('token');
                    router.replace('/login'); // Ganti '/login' dengan path halaman login Anda
                } else {
                    toast.error("Gagal memuat data.");
                }
                return;
            }

            const res_data = await res.json();
            setListData(res_data.data || []);
            setPageLast(res_data.jml_data || 1);
        } catch (error) {
            toast.error("Terjadi masalah koneksi ke server.");
            console.error("Fetch error in getView:", error);
        } finally {
            setLoading(false); // Set loading ke false setelah fetch selesai (berhasil atau gagal)
        }
    };

    useEffect(() => {
        getView();
    }, [page_first, cari_value]);

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
                getView();
                toast.success('Sukses Tambah Data');
            }
        } catch (err) {
            toast.alert(err);
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
                getView();
                toast.success('Sukses Edit Data');
            }
        } catch (err) {
            toast.alert(err);
        }
        finally { setLoadingBtn(false); }
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
            }
        } catch (err) {
            toast.alert(err);
        } finally {
            setLoadingBtn(false);
        }
    };
    // =============================== ENDPOINT ===============================

    // =============================== PAGINASI ===============================
    const btn_prev = () => {
        if (page_first > 1) {
            setPageFirst(page_first - 1);
        }
    };

    const btn_next = () => {
        if (page_first < page_last) {
            setPageFirst(page_first + 1);
        }
    };

    const indexing = (index) => {
        return ((page_first - 1) * page_limit) + index;
    };
    // =============================== PAGINASI ===============================

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-800">Aplikasi</h1></div>
                <button onClick={() => openAddModal()} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95">
                    <Plus size={18} />
                    <span>Tambah Data</span>
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-spacing-0">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-12">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-48">Uraian</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">Deskripsi</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-32">Skor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-36">Responden</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-200 w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memuat data aplikasi...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : listData.length > 0 ? (
                                listData.map((data, index) => (
                                    <tr key={data.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">
                                                {indexing(index + 1)}.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">{data.nama}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-800">{data.keterangan || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/60 shadow-2xs">
                                                <Star size={15} className="fill-amber-400 text-amber-400 shrink-0" />
                                                <span className="text-xs font-bold text-amber-700">
                                                    {Number(data.skor) > 0 ? Number(data.skor).toFixed(1) : '0'}
                                                </span>
                                                <span className="text-[10px] text-amber-500 font-medium">/ 5</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 shadow-2xs">
                                                <Users size={16} className="text-blue-600 shrink-0" />
                                                <span className="text-xs font-semibold text-blue-700">
                                                    {data.responden || 0}
                                                </span>
                                                <span className="text-[11px] text-blue-500">Orang</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-b border-gray-200">
                                            <div className="flex justify-center items-center">
                                                <button
                                                    onClick={() => openEditModal(data)}
                                                    className="flex-1 w-10 h-7 flex justify-center items-center p-2 bg-orange-400 text-white hover:bg-orange-700 transition-all rounded shadow-sm"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(data)}
                                                    className="flex-1 w-10 h-7 flex justify-center items-center p-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded shadow-sm"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-20 text-gray-500 italic">
                                        Tidak ada data aplikasi yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <span className="text-xs text-gray-500 hidden sm:block">Halaman {page_first} dari {page_last}</span>
                    <div className="flex items-center gap-2 mx-auto sm:mx-0">
                        <button onClick={btn_prev} disabled={page_first <= 1} className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-9 h-9 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200">
                            {page_first}
                        </button>
                        <button onClick={btn_next} disabled={page_first >= page_last} className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

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
                                <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deskripsi</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all resize-y"
                                />
                            </div>
                            <div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori/Sektor</label>
                                    <select
                                        required
                                        value={form.kategori}
                                        onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                    >
                                        <option value="">-- Pilih Kategori/Sektor --</option>
                                        <option value={1}>Perizinan</option>
                                        <option value={2}>Kesehatan</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="px-3 py-2 bg-gray-200 flex justify-end gap-2">
                            <button type="button" onClick={() => setModalAddOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 bg-red-500 rounded-lg text-sm text-white font-semibold">Batal</button>
                            <button type="submit" onClick={handleAdd} disabled={loadingBtn} className="px-4 py-2 bg-blue-300 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50">
                                {loadingBtn ? 'Proses...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b bg-orange-400 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Edit Data</h3>
                            <button onClick={() => setModalEditOpen(false)} className="text-white hover:opacity-70"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama</label>
                                <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deskripsi</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all resize-y"
                                />
                            </div>
                            <div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori/Sektor</label>
                                    <select
                                        required
                                        value={form.kategori}
                                        onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                    >
                                        <option value="">-- Pilih Kategori/Sektor --</option>
                                        <option value={1}>Perizinan</option>
                                        <option value={2}>Kesehatan</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="px-3 py-2 bg-gray-200 flex justify-end gap-2">
                            <button type="button" onClick={() => setModalEditOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-600 bg-red-500 rounded-lg text-sm text-white font-semibold">Batal</button>
                            <button type="submit" onClick={handleEdit} disabled={loadingBtn} className="px-4 py-2 bg-orange-400 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50">
                                {loadingBtn ? 'Proses...' : 'Edit Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Hapus Data?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Anda akan menghapus data <span className="font-bold text-gray-800">{form.nama}</span>. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loadingBtn}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-200"
                            >
                                {loadingBtn ? '...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}