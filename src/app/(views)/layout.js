"use client";

// app/(dashboard)/layout.js
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
// import Header from "../components/Header";
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            <div className={`flex flex-col flex-1  bg-stone-100 transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
                <Navbar onMenuClick={toggleSidebar} />
                <views className="p-4 md:p-6 overflow-x-hidden">
                    {children}
                </views>
            </div>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
}