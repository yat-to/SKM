"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import { API_ROUTES } from '@/store/appSlice';
import toast from 'react-hot-toast';
import { getMasterMenu, postMasterMenu } from '@/lib/fetching'

const PermissionGroup = ({ data, onChange }) => {
    const config = [
        { label: 'Read', field: 'readx', color: '#0FA668', title: 'Read' },
        { label: 'Add', field: 'addx', color: '#3695E4', title: 'Add' },
        { label: 'Update', field: 'updatex', color: '#A67D0F', title: 'Edit' },
        { label: 'Delete', field: 'deletex', color: '#DB4839', title: 'Delete' }
    ];

    return (
        <div className="flex justify-center items-center gap-3">
            {config.map((item) => (
                <label key={item.field} title={item.title} className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={data[item.field] == 1}
                        onChange={() => onChange(item.field)}
                        style={{ accentColor: item.color }}
                        className="w-4 h-4 cursor-pointer transition-transform group-active:scale-90"
                    />
                    <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-gray-600">{item.label}</span>
                </label>
            ))}
        </div>
    );
};

export default function Page() {
    const [page_first, setPageFirst] = useState(1);
    const [page_last, setPageLast] = useState(0);

    const [listData, setListData] = useState([]);
    const [listMenu, setListMenu] = useState([]);

    const [cari_value, setCariValue] = useState("");

    const page_limit = 10;

    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);

    const [form, setForm] = useState({
        id: '',
        uraian: '',
        keterangan: ''
    });

    const openAddModal = async () => {
        setForm({
            id: '',
            uraian: '',
            keterangan: '',
        });
        const menu = await getMasterMenu();
        setListMenu(menu);
        setModalAddOpen(true);
    };

    const openEditModal = async (data) => {
        setForm({
            id: data.id,
            uraian: data.uraian,
        });
        const menuPermission = await postMasterMenu(data.id);
        setListMenu(menuPermission);
        setModalEditOpen(true);
    };

    const handleCheck = (menuIndex, subIndex, subSubIndex, field) => {
        const newList = [...listMenu];
        if (subSubIndex !== null) {
            newList[menuIndex].subItem[subIndex].subItem[subSubIndex][field] = !newList[menuIndex].subItem[subIndex].subItem[subSubIndex][field];
        } else if (subIndex !== null) {
            newList[menuIndex].subItem[subIndex][field] = !newList[menuIndex].subItem[subIndex][field];
        } else {
            newList[menuIndex][field] = !newList[menuIndex][field];
        }
        setListMenu(newList);
    };

    const openDeleteModal = (data) => {
        setForm({
            id: data.id,
            akunId: data.akunId,
            kelompokId: data.kelompokId,
            jenisId: data.jenisId,
            objekId: data.objekId,
            rincianId: data.rincianId,
            subId: data.subId,
            kode: data.kode,
            uraian: data.uraian,
            keterangan: data.keterangan
        });
        setDeleteOpen(true);
    };

    // =============================== ENDPOINT ===============================
    const getView = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + 'view', {
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
        setListData(res_data.data || []);
        setPageLast(res_data.jml_data);
    };

    useEffect(() => {
        getView();
    }, [page_first]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoadingBtn(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + 'addData', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    form: form,
                    list_menu: listMenu
                })
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
            const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + 'editData', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": "kikensbatara " + token
                },
                body: JSON.stringify({
                    form: form,
                    list_menu: listMenu 
                })
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
            const res = await fetch(API_ROUTES.URL_DM_KLP_USERS + 'removeData', {
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
                <div><h1 className="text-2xl font-bold text-gray-800">Kelompok Users</h1></div>
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200 w-16">NO</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-r border-gray-200">URAIAN</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-200 w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {listData.map((data, index) => (
                                <tr key={data.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 text-center border-b border-r border-gray-200">
                                        <span className="text-sm text-gray-800">
                                            {indexing(index + 1)}.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-r border-gray-200">
                                        <span className="text-sm text-gray-800">{data.uraian}</span>
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

            {/* {modalAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b bg-blue-300 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h3 className="font-bold text-lg">Tambah Data</h3>
                            </div>
                            <button onClick={() => setModalAddOpen(false)} className="text-white hover:opacity-70"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAdd} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uraian</label>
                                <input
                                    type="text"
                                    required
                                    value={form.uraian}
                                    onChange={(e) => setForm({ ...form, uraian: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-10 bg-blue-300 text-white text-[11px] uppercase tracking-wider">
                                            <tr>
                                                <th colSpan="3" className="p-3 border-r border-gray-100 text-center w-24">KODE</th>
                                                <th className="p-3 border-r border-gray-100 w-[45%] text-center">Menu</th>
                                                <th className="p-3 text-center w-[40%]">Akses</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {listMenu.length > 0 ? listMenu.map((data, idx) => (
                                                <React.Fragment key={data.id || idx}>
                                                    <tr className="bg-blue-200 text-gray-9 font-bold border-b border-gray-100">
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">{data.urutan}</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">-</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">-</td>
                                                        <td className="p-2.5 border-r border-gray-100">{data.title}</td>
                                                        <td className="p-2.5 text-center">
                                                            {!data.type && <PermissionGroup data={data} onChange={(f) => handleCheck(idx, null, null, f)} />}
                                                        </td>
                                                    </tr>

                                                    {data.subItem && data.subItem.map((data1, idx1) => (
                                                        <React.Fragment key={data1.id || idx1}>
                                                            <tr className="bg-blue-100 text-gray-700 border-b border-gray-100 transition-colors">
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">{data.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">-</td>
                                                                <td className="p-2 border-r border-gray-100 pl-6 text-gray-600">
                                                                    <span className="text-gray-300 mr-2">└</span>{data1.title}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    {!data1.type && <PermissionGroup data={data1} onChange={(f) => handleCheck(idx, idx1, null, f)} />}
                                                                </td>
                                                            </tr>

                                                            {data1.subItem && data1.subItem.map((data2, idx2) => (
                                                                <tr key={data2.id || idx2} className="bg-blue-50 text-gray-500 italic border-b border-gray-100 transition-colors">
                                                                    <td className="p-2 text-center border-r border-gray-100">{data.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data2.urutan}</td>
                                                                    <td className="p-2 border-r border-gray-100 pl-12 text-[13px]">
                                                                        <span className="text-gray-300 mr-2">└─</span>{data2.title}
                                                                    </td>
                                                                    <td className="p-2 text-center text-normal">
                                                                        {!data2.type && <PermissionGroup data={data2} onChange={(f) => handleCheck(idx, idx1, idx2, f)} />}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </React.Fragment>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="p-10 text-center text-gray-400 italic bg-gray-50">
                                                        Sedang memuat data menu...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </form>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setModalAddOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={loadingBtn} className="flex-1 px-4 py-2 bg-blue-300 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50">
                                {loadingBtn ? 'Proses...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            {modalAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                        <div className="px-6 py-4 border-b bg-blue-300 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Tambah Data</h3>
                            <button onClick={() => setModalAddOpen(false)} className="text-white hover:opacity-70"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uraian</label>
                                <input type="text" required value={form.uraian} onChange={(e) => setForm({ ...form, uraian: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-10 bg-blue-300 text-white text-[11px] uppercase tracking-wider">
                                            <tr>
                                                <th colSpan="3" className="p-3 border-r border-gray-100 text-center w-24">KODE</th>
                                                <th className="p-3 border-r border-gray-100 w-[45%] text-center">Menu</th>
                                                <th className="p-3 text-center w-[40%]">Akses</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {listMenu.length > 0 ? listMenu.map((data, idx) => (
                                                <React.Fragment key={data.id || idx}>
                                                    <tr className="bg-blue-200 text-gray-9 font-bold border-b border-gray-100">
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">{data.urutan}</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">-</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8">-</td>
                                                        <td className="p-2.5 border-r border-gray-100">{data.title}</td>
                                                        <td className="p-2.5 text-center">
                                                            {!data.type && <PermissionGroup data={data} onChange={(f) => handleCheck(idx, null, null, f)} />}
                                                        </td>
                                                    </tr>

                                                    {data.subItem && data.subItem.map((data1, idx1) => (
                                                        <React.Fragment key={data1.id || idx1}>
                                                            <tr className="bg-blue-100 text-gray-700 border-b border-gray-100 transition-colors">
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">{data.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">-</td>
                                                                <td className="p-2 border-r border-gray-100 pl-6 text-gray-600">
                                                                    <span className="text-gray-300 mr-2">└</span>{data1.title}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    {!data1.type && <PermissionGroup data={data1} onChange={(f) => handleCheck(idx, idx1, null, f)} />}
                                                                </td>
                                                            </tr>

                                                            {data1.subItem && data1.subItem.map((data2, idx2) => (
                                                                <tr key={data2.id || idx2} className="bg-blue-50 text-gray-500 italic border-b border-gray-100 transition-colors">
                                                                    <td className="p-2 text-center border-r border-gray-100">{data.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data2.urutan}</td>
                                                                    <td className="p-2 border-r border-gray-100 pl-12 text-[13px]">
                                                                        <span className="text-gray-300 mr-2">└─</span>{data2.title}
                                                                    </td>
                                                                    <td className="p-2 text-center text-normal">
                                                                        {!data2.type && <PermissionGroup data={data2} onChange={(f) => handleCheck(idx, idx1, idx2, f)} />}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </React.Fragment>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="p-10 text-center text-gray-400 italic bg-gray-50">
                                                        Sedang memuat data menu...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalAddOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={loadingBtn} className="flex-1 px-4 py-2 bg-blue-300 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50">
                                    {loadingBtn ? 'Proses...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b bg-amber-400 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Edit Data</h3>
                            <button onClick={() => setModalEditOpen(false)} className="text-white hover:opacity-70"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEdit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uraian</label>
                                <input type="text" required value={form.uraian} onChange={(e) => setForm({ ...form, uraian: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-10 bg-amber-300 text-white text-[11px] uppercase tracking-wider">
                                            <tr>
                                                <th colSpan="3" className="p-3 border-r border-gray-100 text-center w-24">KODE</th>
                                                <th className="p-3 border-r border-gray-100 w-[45%] text-center">Menu</th>
                                                <th className="p-3 text-center w-[40%]">Akses</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {listMenu.length > 0 ? listMenu.map((data, idx) => (
                                                <React.Fragment key={data.id || idx}>
                                                    <tr className="bg-amber-200 text-gray-9 font-bold border-b border-gray-100">
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8 text-gray-400">{data.urutan}</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8 text-gray-400">-</td>
                                                        <td className="p-2.5 text-center border-r border-gray-100 w-8 text-gray-400">-</td>
                                                        <td className="p-2.5 border-r border-gray-100 text-gray-400">{data.title}</td>
                                                        <td className="p-2.5 text-center">
                                                            {!data.type && <PermissionGroup data={data} onChange={(f) => handleCheck(idx, null, null, f)} />}
                                                        </td>
                                                    </tr>

                                                    {data.subItem && data.subItem.map((data1, idx1) => (
                                                        <React.Fragment key={data1.id || idx1}>
                                                            <tr className="bg-amber-100 text-gray-700 border-b border-gray-100 transition-colors">
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">{data.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                <td className="p-2 text-center border-r border-gray-100 text-gray-400">-</td>
                                                                <td className="p-2 border-r border-gray-100 pl-6 text-gray-600">
                                                                    <span className="text-gray-300 mr-2">└</span>{data1.title}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    {!data1.type && <PermissionGroup data={data1} onChange={(f) => handleCheck(idx, idx1, null, f)} />}
                                                                </td>
                                                            </tr>

                                                            {data1.subItem && data1.subItem.map((data2, idx2) => (
                                                                <tr key={data2.id || idx2} className="bg-amber-50 text-gray-500 italic border-b border-gray-100 transition-colors">
                                                                    <td className="p-2 text-center border-r border-gray-100">{data.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data1.urutan}</td>
                                                                    <td className="p-2 text-center border-r border-gray-100">{data2.urutan}</td>
                                                                    <td className="p-2 border-r border-gray-100 pl-12 text-[13px]">
                                                                        <span className="text-gray-300 mr-2">└─</span>{data2.title}
                                                                    </td>
                                                                    <td className="p-2 text-center text-normal">
                                                                        {!data2.type && <PermissionGroup data={data2} onChange={(f) => handleCheck(idx, idx1, idx2, f)} />}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </React.Fragment>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="p-10 text-center text-gray-400 italic bg-gray-50">
                                                        Sedang memuat data menu...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalEditOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={loadingBtn} className="flex-1 px-4 py-2 bg-amber-400 text-white rounded-lg text-sm font-semibold shadow-md disabled:opacity-50">
                                    {loadingBtn ? 'Proses...' : 'Update Data'}
                                </button>
                            </div>
                        </form>
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