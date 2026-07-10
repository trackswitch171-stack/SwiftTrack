import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Menu, X, Search } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [trackInput, setTrackInput] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackInput.trim()) navigate(`/track/${trackInput.trim()}`);
    };

    const navBg =
        scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-transparent';

    const textColor = scrolled || !isHome ? 'text-[#0B3D91]' : 'text-white';
    const linkColor =
        scrolled || !isHome
            ? 'text-gray-600 hover:text-[#0B3D91]'
            : 'text-white/90 hover:text-white';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0B3D91] to-[#1a4fc4] rounded-xl flex items-center justify-center shadow-md">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-xl font-bold ${textColor}`}>
                            Swift<span className="text-orange-500">Track</span>
                        </span>
                    </Link>

                    {/* Desktop Nav links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`font-medium transition-colors ${linkColor}`}>Home</Link>
                        <Link to="/track" className={`font-medium transition-colors ${linkColor}`}>Track</Link>
                        <a href="/#services" className={`font-medium transition-colors ${linkColor}`}>Services</a>
                        <a href="/#about" className={`font-medium transition-colors ${linkColor}`}>About</a>
                    </div>

                    {/* Desktop quick-track (no Admin button) */}
                    <div className="hidden md:flex items-center">
                        <form onSubmit={handleTrack} className="flex items-center">
                            <input
                                type="text"
                                placeholder="Enter tracking number..."
                                value={trackInput}
                                onChange={(e) => setTrackInput(e.target.value)}
                                className="w-52 px-4 py-2 text-sm rounded-l-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0B3D91] text-white rounded-r-xl hover:bg-[#0a3380] transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`md:hidden p-2 rounded-lg ${scrolled || !isHome ? 'text-[#0B3D91]' : 'text-white'}`}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-3">
                            <Link to="/" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/track" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                                Track Shipment
                            </Link>
                            <a href="/#services" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                                Services
                            </a>
                            <a href="/#about" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                                About
                            </a>
                            <form onSubmit={handleTrack} className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    placeholder="Enter tracking number..."
                                    value={trackInput}
                                    onChange={(e) => setTrackInput(e.target.value)}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-sm font-medium"
                                >
                                    Track
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
