"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import { API_ROUTES } from '@/store/appSlice';
import toast from 'react-hot-toast';
import Icon from '@/app/components/Icon';

export default function Page() {
    const [page_first, setPageFirst] = useState(1);
    const [page_last, setPageLast] = useState(0);

    const [listData, setListData] = useState([]);
    const [listMenu, setListMenu] = useState([]);
    const [expandedItems, setExpandedItems] = useState([]);

    const [cari_value, setCariValue] = useState("");

    const page_limit = 10;

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
        type: 0,
        jenis: 1,
        parrent: null,
        urutan: 0
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
    const getView = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.URL_DM_MENU + 'view', {
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
        const res_data = await res.json();
        // console.log(res_data);
        setListData(res_data)
    };

    useEffect(() => {
        getView();
    }, [page_first]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoadingBtn(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ROUTES.URL_DM_MENU + 'addData', {
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
            const res = await fetch(API_ROUTES.URL_DM_MENU + 'editData', {
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
            const res = await fetch(API_ROUTES.URL_DM_MENU + 'removeData', {
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

    const toggleExpand = (id) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const renameType = (type) => {
        return type === 1 ? 'Menu' : 'Action/Button';
    };

    const ActionButtons = ({ onAdd, onEdit, onDelete, canDelete = true }) => (
        <div className="flex justify-center items-center">
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="flex-1 w-10 h-7 flex justify-center items-center p-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded shadow-sm"
                >
                    <Plus size={14} />
                </button>
            )}
            <button
                onClick={onEdit}
                className="flex-1 w-10 h-7 flex justify-center items-center p-2 bg-orange-400 text-white hover:bg-orange-700 transition-all rounded shadow-sm"
            >
                <Edit size={14} />
            </button>
            <button
                onClick={onDelete}
                disabled={!canDelete}
                className="flex-1 w-10 h-7 flex justify-center items-center p-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded shadow-sm"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );

    const openAddSubModal = (parentId) => {
        setForm({ ...initialForm, parrent: parentId }); // Masukkan ID induk
        setModalAddOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-800">List Menu</h1></div>
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-16">#</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">ICON</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">MENU</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">ROUTE</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">TYPE</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-200 w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {listData.map((data, index) => (
                                <React.Fragment key={data.id}>
                                    <tr className="bg-blue-50 transition-colors group">
                                        <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                            <button
                                                onClick={() => toggleExpand(data.id)}
                                                disabled={!data.subItem || data.subItem.length === 0}
                                                className={`p-1 w-10 h-7 flex items-center justify-center rounded text-white transition-transform
                                                    ${(!data.subItem || data.subItem.length === 0)
                                                        ? 'bg-blue-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                    }
                                                `}
                                            >
                                                <ChevronRight size={14} className={`transition-transform duration-200 ${expandedItems.includes(data.id) ? 'rotate-90' : 'rotate-0'}`} />
                                            </button>
                                        </td>
                                        {/* <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-600" style={{ color: data.color }}></span>
                                        </td> */}
                                        <td className="px-6 py-4 border-b border-r border-gray-200 text-center">
                                            <Icon iconName={data.icon} color={data.color} />
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className="text-sm text-gray-600">{data.urutan}. {data.title}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className='text-sm text-gray-600'>{data.route}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-r border-gray-200">
                                            <span className='text-sm text-gray-600'>{renameType(data.type)}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200">
                                            <ActionButtons
                                                onAdd={() => openAddSubModal(data.id)}
                                                onEdit={() => openEditModal(data)}
                                                onDelete={() => openDeleteModal(data)}
                                                canDelete={!data.subItem || data.subItem.length === 0}
                                            />
                                        </td>
                                    </tr>

                                    {/* LEVEL 2 (SUB ITEM) */}
                                    {expandedItems.includes(data.id) && data.subItem?.map((data1) => (
                                        <React.Fragment key={data1.id}>
                                            <tr className="bg-blue-50/50 transition-colors group">
                                                <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                                    <button
                                                        onClick={() => toggleExpand(data1.id)}
                                                        disabled={!data1.subItem || data1.subItem.length === 0}
                                                        className={`p-1 w-10 h-6 flex items-center justify-center rounded text-white transition-transform
                                                        ${(!data.subItem || data.subItem.length === 0)
                                                                ? 'bg-blue-400 cursor-not-allowed'
                                                                : 'bg-blue-600 hover:bg-blue-700'
                                                            }`}
                                                    >
                                                        <ChevronRight size={14} className={`transition-transform duration-200 ${expandedItems.includes(data1.id) ? 'rotate-90' : ''}`} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center border-b border-r border-gray-200"></td>
                                                <td className="px-6 py-4 border-b border-r border-gray-200">
                                                    <span className="text-sm text-gray-600">{data1.title}</span>
                                                </td>
                                                <td className="px-6 py-4 border-b border-r border-gray-200">
                                                    <span className="text-sm text-gray-600">{data1.route}</span>
                                                </td>
                                                <td className="px-6 py-4 border-b border-r border-gray-200">
                                                    <span className="text-sm text-gray-600">{renameType(data1.type)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                                    <ActionButtons
                                                        onAdd={() => openAddSubModal(data1.id)}
                                                        onEdit={() => openEditModal(data1)}
                                                        onDelete={() => openDeleteModal(data1)}
                                                        canDelete={!data1.subItem || data1.subItem.length === 0}
                                                    />
                                                </td>
                                            </tr>

                                            {/* LEVEL 3 (SUB SUB ITEM) */}
                                            {expandedItems.includes(data1.id) && data1.subItem?.map((data2) => (
                                                <tr key={data2.id} className="bg-white transition-colors group">
                                                    <td className="px-6 py-4 text-center border-b border-r border-gray-200"></td>
                                                    <td className="px-6 py-4 border-b border-r border-gray-200">
                                                        <span className="text-sm text-gray-600"></span>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-r border-gray-200">
                                                        <span className="text-sm text-gray-600">{data2.title}</span>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-r border-gray-200">
                                                        <span className="text-sm text-gray-600">
                                                            {data2.route}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-r border-gray-200">
                                                        <span className="text-sm text-gray-600">
                                                            Action
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <ActionButtons
                                                            onEdit={() => openEditModal(data2)}
                                                            onDelete={() => openDeleteModal(data2)}
                                                            canDelete={true}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Menu</label>
                                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Icon
                                        <a href="https://fonts.google.com/icons?selected=Material+Icons" target="_blank" rel="noopener noreferrer">(Referensi)</a>

                                    </label>
                                    <input type="text" required value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color</label>
                                    <input type="text" required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route</label>
                                    <input type="text" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                    <select
                                        required
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                    >
                                        <option value="">-- Pilih Type --</option>
                                        <option value={1}>Single Menu</option>
                                        <option value={2}>Multy Menu</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Urut</label>
                                <input type="number" required value={form.urutan} onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Menu</label>
                                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Icon
                                        <a href="https://fonts.google.com/icons?selected=Material+Icons" target="_blank" rel="noopener noreferrer">(Referensi)</a>

                                    </label>
                                    <input type="text" required value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color</label>
                                    <input type="text" required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route</label>
                                    <input type="text" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                    <select
                                        required
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                                    >
                                        <option value="">-- Pilih Type --</option>
                                        <option value={1}>Single Menu</option>
                                        <option value={2}>Multy Menu</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Urut</label>
                                <input type="number" required value={form.urutan} onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
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
                                Anda akan menghapus data <span className="font-bold text-gray-800">{form.uraian}</span>. Tindakan ini tidak dapat dibatalkan.
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