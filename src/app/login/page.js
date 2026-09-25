"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/appSlice";
import Joi from "joi";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { User, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { errorMessage, loading } = useSelector((state) => state.app);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (localError || errorMessage) {
            setLocalError("");
        }
    }, [username, password]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { error } = schema.validate({ username, password });
        if (error) {
            setLocalError(
                error.message.includes("username")
                    ? "Username tidak valid (3-13 karakter alfanumerik)"
                    : "Password minimal 6 karakter"
            );
            return;
        }

        const resultAction = await dispatch(loginUser({ username, password }));

        if (loginUser.fulfilled.match(resultAction)) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {loading && <LoadingOverlay />}

            <div className="relative w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
                    {/* Header & Logo */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative mb-3 p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                            <Image
                                src="/images/logo_konsel.png"
                                alt="Logo Kabupaten Konawe Selatan"
                                width={72}
                                height={72}
                                priority
                                className="object-contain drop-shadow"
                            />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            Survei Kepuasan Masyarakat
                        </h1>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
                            Kabupaten Konawe Selatan
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Silakan masuk untuk mengakses panel sistem
                        </p>
                    </div>

                    {/* Error Alert */}
                    {(localError || errorMessage) && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm shadow-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-semibold">Peringatan: </strong>
                                <span>{localError || errorMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username Input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Masukkan username"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{loading ? "Menghubungkan..." : "Masuk"}</span>
                        </button>
                    </form>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-6 text-xs text-blue-200/70">
                    &copy; {new Date().getFullYear()} Pemerintah Kabupaten Konawe Selatan. All rights reserved.
                </div>
            </div>
        </div>
    );
}