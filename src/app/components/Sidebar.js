"use client";
import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSidebarMenu, initializeAuth } from '@/store/appSlice';

import { menu } from "@/data/menux";

const ListMenu = ({ datax }) => {
    const router = useRouter();

    const hasChildren = datax.children && datax.children.length > 0;
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname();

    const LucideIcon = LucideIcons[datax.icon];
    const isGoogleIcon = datax.icon && !LucideIcon; // Jika bukan Lucide, anggap Google Icon

    const DynamicIcon = LucideIcons[datax.icon];
    const ChevronIcon = LucideIcons['ChevronDown'];

    const handleClick = (e) => {
        e.stopPropagation();
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            if (datax.url) {
                router.push(datax.url);
            }
        }
    };

    return (
        <li className="list-none">
            <div
                onClick={handleClick}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${pathname === datax.url
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
            >
                {/* <div className="flex items-center gap-4">
                    {DynamicIcon && datax.icon ? <DynamicIcon size={20} /> : " "}
                    <span>{datax.title}</span>
                </div> */}

                <div className="flex items-center gap-4">
                    {/* Render Ikon */}
                    <div className="w-5 flex justify-center">
                        {LucideIcon ? (
                            <LucideIcon size={20} />
                        ) : isGoogleIcon ? (
                            <span className="material-icons text-[20px]">{datax.icon}</span>
                        ) : null}
                    </div>
                    <span>{datax.title}</span>
                </div>

                {hasChildren && (
                    <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronIcon size={16} />
                    </span>
                )}
            </div>

            {hasChildren && isOpen && (
                <ul className="ml-5 mt-1 border-l border-gray-200 space-y-1">
                    {datax.children.map((child) => (
                        <ListMenu key={`${child.id}-${child.title}`} datax={child} />
                    ))}
                </ul>
            )}
        </li>
    )
}

function Sidebar({ isOpen, onClose }) {
    const dispatch = useDispatch()

    // Menu statis sesuai permintaan
    const staticMenu = [
        { id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', url: '/' },
        { id: 'aplikasi', title: 'Aplikasi', icon: 'AppWindow', url: '/aplikasi' },
        { id: 'ulasan', title: 'Ulasan & Komen', icon: 'MessageSquare', url: '/ulasan' },
    ];

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch])

    return (
        <div>
            {isOpen && (
                <div
                    className='fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity'
                    onClick={onClose}
                />
            )}
            {/* <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0"> */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col 
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Brand Logo Section */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 px-2">
                        <Image
                            src="/images/logo_konsel.png"
                            alt="Logo SKM"
                            width={56}
                            height={56}
                            className="object-contain shrink-0"
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-800 leading-none">SKM</span>
                            <span className="text-xs font-medium text-gray-500 mt-1">Survei Kepuasan Masyarakat</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {menu.map((item) => (
                            <ListMenu key={`${item.id}-${item.title}`} datax={item} />
                        ))}
                    </ul>
                </nav>
            </aside>
        </div>
    )
}

export default Sidebar