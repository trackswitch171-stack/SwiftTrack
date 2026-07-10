import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Package, Mail, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginForm {
    email: string;
    password: string;
}

export default function AdminLogin() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        defaultValues: {
            email: 'admin@swifttrack.com',
            password: 'swifttrack123',
        },
    });

    if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Welcome back!');
            navigate('/admin/dashboard');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0B3D91] to-[#0B3D91] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#0B3D91]">
                            Swift<span className="text-orange-500">Track</span>
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Admin Portal</p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your admin account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                                    })}
                                    type="email"
                                    placeholder="admin@swifttrack.com"
                                    className={`input-field pl-11 ${errors.email ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    {...register('password', { required: 'Password is required' })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#0B3D91] to-[#0B3D91] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Sign In to Admin Portal
                                </>
                            )}
                        </motion.button>
                    </form>

                </div>

                {/* Back to site */}
                <p className="text-center text-white/70 mt-6 text-sm">
                    <a href="/" className="hover:text-white transition-colors">← Back to public site</a>
                </p>
            </motion.div>
        </div>
    );
}
