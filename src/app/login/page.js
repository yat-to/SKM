"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/appSlice";
import Joi from "joi";
import LoadingOverlay from "@/app/components/LoadingOverlay";

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { errorMessage } = useSelector((state) => state.app);
    const { loading } = useSelector((state) => state.app);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (localError || errorMessage) {
            setLocalError("");
            // dispatch(clearError());
        }
    }, [username, password]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { error } = schema.validate({ username, password });
        if (error) {
            setLocalError(error.message.includes("username") 
                ? "Username tidak valid" 
                : "Password minimal 6 karakter");
            return;
        }

        const resultAction = await dispatch(loginUser({ username, password }));

        if (loginUser.fulfilled.match(resultAction)) {
            router.push("/dashboard");
        }
    };

    return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-[linear-gradient(135deg,#eef4ff,#bdd2ff,#4880ff)]">
            {loading && <LoadingOverlay />}
                <div className="w-full max-w-md p-8 bg-slate-50 rounded-2xl shadow-xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-800">Selamat Datang</h1>
                        <p className="text-slate-500 mt-2">Silakan masuk ke akun Anda</p>
                    </div>

                    {(localError || errorMessage) && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm shadow-sm">
                            <strong>Warning!</strong> {localError || errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                        >
                            {loading ? "Menghubungkan..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
    );
}