"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Settings, Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from "@/store/appSlice"
import { useRouter } from 'next/navigation';
import { getInitials } from "@/lib/utils";

export default function Navbar({ onMenuClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout())
        router.replace("/login")
    };

    const [userData, setUserData] = useState({
        nama: "",
        unit_kerja_nama: "",
        role: "",
        email: "",
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const rawProfile = localStorage.getItem('profile');
        // console.log(rawProfile);
        const parsed = JSON.parse(rawProfile);
        console.log(parsed);

        setUserData({
            nama: parsed.nama || "User",
            unit_kerja_nama: parsed.unit_kerja_nama || "Administrator",
            role: parsed.role || "",
            email: parsed.email || ""
        });
    }, []);

    return (
        <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 top-0 z-30">
            <button
                onClick={onMenuClick}
                className="p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-64">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari sesuatu..."
                    className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full text-gray-600"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">

                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(userData.nama)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{userData.nama}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{userData.email}</p>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in duration-150">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <User size={16} /> Profil Saya
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <Settings size={16} /> Pengaturan
                            </button>
                            <hr className="my-2 border-gray-100" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}