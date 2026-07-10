import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, Package, Globe, Shield, Clock, Zap, Star, ChevronDown,
    ArrowRight, Truck, MapPin, CheckCircle, Users, Award, TrendingUp, Phone
} from 'lucide-react';

const STATS = [
    { label: 'Shipments Delivered', value: '2.4M+', icon: Package },
    { label: 'Countries Covered', value: '220+', icon: Globe },
    { label: 'Happy Customers', value: '500K+', icon: Users },
    { label: 'On-Time Rate', value: '99.2%', icon: Award },
];

const SERVICES = [
    {
        icon: Zap,
        title: 'Express Delivery',
        description: 'Same-day and next-day delivery for urgent shipments across major cities worldwide.',
        color: 'bg-orange-50 text-orange-600',
        border: 'border-orange-100',
    },
    {
        icon: Globe,
        title: 'International Freight',
        description: 'Reliable air and sea freight solutions connecting 220+ countries globally.',
        color: 'bg-blue-50 text-[#0B3D91]',
        border: 'border-blue-100',
    },
    {
        icon: Shield,
        title: 'Customs Clearance',
        description: 'Hassle-free customs brokerage and compliance management for all shipments.',
        color: 'bg-green-50 text-green-600',
        border: 'border-green-100',
    },
    {
        icon: Package,
        title: 'Warehousing',
        description: 'Secure, climate-controlled storage facilities in strategic global locations.',
        color: 'bg-purple-50 text-purple-600',
        border: 'border-purple-100',
    },
    {
        icon: Truck,
        title: 'Last-Mile Delivery',
        description: 'Efficient last-mile logistics ensuring packages reach the final recipient safely.',
        color: 'bg-cyan-50 text-cyan-600',
        border: 'border-cyan-100',
    },
    {
        icon: MapPin,
        title: 'Real-Time Tracking',
        description: 'Live GPS tracking with automated alerts and real-time status updates.',
        color: 'bg-red-50 text-red-600',
        border: 'border-red-100',
    },
];

const TESTIMONIALS = [
    {
        name: 'Sarah Thompson',
        role: 'E-Commerce Director, StyleHub',
        text: 'SwiftTrack has transformed our international shipping. Real-time tracking and customs support are exceptional.',
        rating: 5,
        avatar: 'ST',
        country: '🇬🇧 United Kingdom',
    },
    {
        name: 'Mohammed Al-Rashid',
        role: 'Operations Manager, Gulf Imports',
        text: 'Outstanding reliability for our Dubai operations. The approval workflow ensures every update is verified.',
        rating: 5,
        avatar: 'MA',
        country: '🇦🇪 United Arab Emirates',
    },
    {
        name: 'James Mitchell',
        role: 'CEO, AusTech Solutions',
        text: 'We ship thousands of packages monthly to Europe and Asia. SwiftTrack\'s platform is best-in-class.',
        rating: 5,
        avatar: 'JM',
        country: '🇦🇺 Australia',
    },
];

const FAQS = [
    {
        q: 'How do I track my shipment?',
        a: 'Enter your tracking number in the search box above or on our dedicated Track page. Your shipment details, current location, and full history will appear instantly.',
    },
    {
        q: 'How long does international shipping take?',
        a: 'Express international delivery typically takes 1-3 business days, while standard shipping takes 5-10 business days depending on origin and destination countries.',
    },
    {
        q: 'What countries do you cover?',
        a: 'We cover 220+ countries and territories worldwide with direct partnerships and agent networks ensuring reliable coverage globally.',
    },
    {
        q: 'How are tracking updates managed?',
        a: 'All tracking updates go through our secure admin approval workflow before becoming visible to customers, ensuring only verified and accurate information is shown.',
    },
    {
        q: 'Can I track multiple shipments at once?',
        a: 'Yes. You can track multiple shipments using individual tracking numbers. Our system supports all standard tracking number formats from our global partner network.',
    },
];

export default function HomePage() {
    const [trackingInput, setTrackingInput] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingInput.trim()) navigate(`/track/${trackingInput.trim()}`);
    };

    return (
        <div className="overflow-x-hidden">
            {/* HERO */}
            <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0B3D91]/5 rounded-full blur-3xl" />
                    {/* Grid pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-6">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Global Tracking Active — 220+ Countries
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                                Track Your Shipment{' '}
                                <span className="text-orange-400">Anywhere</span>{' '}
                                in the World
                            </h1>

                            <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
                                Professional logistics tracking trusted by 500,000+ customers globally. Real-time updates, verified information, and complete visibility from pickup to delivery.
                            </p>

                            {/* Track form */}
                            <form onSubmit={handleTrack} className="mb-8">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your tracking number"
                                            value={trackingInput}
                                            onChange={(e) => setTrackingInput(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-lg text-sm font-medium"
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                                    >
                                        <Search className="w-5 h-5" />
                                        Track Now
                                    </motion.button>
                                </div>
                                <p className="text-white/50 text-xs mt-2 ml-1">
                                    Use your own tracking number from the shipment confirmation.
                                </p>
                            </form>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                                {['No registration required', '24/7 live tracking', 'Instant results'].map((item) => (
                                    <div key={item} className="flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — animated illustration */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="hidden lg:flex justify-center items-center"
                        >
                            <div className="relative w-full max-w-md">
                                {/* Main card */}
                                <motion.div
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                                <Package className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">TRK-XX-2026-000001</p>
                                                <p className="text-white/60 text-xs">Express Shipment</p>
                                            </div>
                                        </div>
                                        <span className="bg-orange-500/20 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full border border-orange-400/30">
                                            In Transit
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="text-center">
                                            <p className="text-white font-bold text-sm">SYD</p>
                                            <p className="text-white/60 text-xs">Sydney</p>
                                        </div>
                                        <div className="flex-1 flex items-center gap-1">
                                            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '65%' }}
                                                    transition={{ duration: 2, delay: 1 }}
                                                    className="h-full bg-orange-400 rounded-full"
                                                />
                                            </div>
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <Truck className="w-5 h-5 text-orange-400" />
                                            </motion.div>
                                            <div className="h-1 flex-1 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-sm">DXB</p>
                                            <p className="text-white/60 text-xs">Dubai</p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-xs">Current Location</p>
                                            <p className="text-white font-semibold text-sm">Singapore Transit Hub</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating badges */}
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                    className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg"
                                >
                                    ✓ Customs Cleared
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                                    className="absolute -bottom-4 -left-4 bg-white text-[#0B3D91] text-xs font-bold px-3 py-2 rounded-xl shadow-lg"
                                >
                                    📍 Live Tracking
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* STATS */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-[#0B3D91]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className="w-6 h-6 text-[#0B3D91]" />
                                </div>
                                <div className="text-3xl font-extrabold text-[#0B3D91] mb-1">{stat.value}</div>
                                <div className="text-gray-500 text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Our Services</span>
                        <h2 className="section-title mt-2">Everything You Need for Global Shipping</h2>
                        <p className="section-subtitle max-w-2xl mx-auto">
                            From single packages to full freight loads, we provide comprehensive logistics solutions for businesses of all sizes.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SERVICES.map((service, i) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`card-hover border ${service.border} cursor-pointer group`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                                <div className="flex items-center gap-1 mt-4 text-[#0B3D91] text-sm font-semibold">
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Why SwiftTrack</span>
                            <h2 className="section-title mt-2 mb-6">Trusted by Businesses Worldwide</h2>
                            <div className="space-y-5">
                                {[
                                    { icon: Shield, title: 'Verified Tracking Updates', desc: 'Every status update goes through admin verification before being visible to customers, ensuring 100% accuracy.' },
                                    { icon: Globe, title: 'True Global Coverage', desc: '220+ countries with local expertise and established partner networks guaranteeing reliable delivery worldwide.' },
                                    { icon: Clock, title: 'Real-Time Updates', desc: 'Live GPS integration with automatic notifications keep senders and receivers informed at every step.' },
                                    { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Powerful dashboard analytics give businesses complete visibility into their shipping operations.' },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#0B3D91]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <item.icon className="w-5 h-5 text-[#0B3D91]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-gradient-hero rounded-3xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6">Global Network Coverage</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { region: 'Asia Pacific', countries: '45+ countries', flag: '🌏' },
                                        { region: 'Europe', countries: '50+ countries', flag: '🌍' },
                                        { region: 'Americas', countries: '35+ countries', flag: '🌎' },
                                        { region: 'Middle East & Africa', countries: '60+ countries', flag: '🌍' },
                                        { region: 'South Asia', countries: '8+ countries', flag: '🌏' },
                                        { region: 'Oceania', countries: '14+ countries', flag: '🌏' },
                                    ].map((region) => (
                                        <div key={region.region} className="bg-white/10 rounded-xl p-4">
                                            <div className="text-2xl mb-1">{region.flag}</div>
                                            <p className="font-semibold text-sm">{region.region}</p>
                                            <p className="text-white/60 text-xs">{region.countries}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                        <h2 className="section-title mt-2">What Our Customers Say</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card"
                            >
                                <div className="flex mb-3">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B3D91] to-[#0B3D91] flex items-center justify-center text-white font-bold text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                        <p className="text-gray-500 text-xs">{t.role}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.country}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">FAQ</span>
                        <h2 className="section-title mt-2">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="border border-gray-100 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.q}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        className="px-5 pb-5"
                                    >
                                        <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-hero">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Ready to Track Your Shipment?
                        </h2>
                        <p className="text-white/75 mb-8 max-w-xl mx-auto">
                            Enter your tracking number and get instant real-time updates on your shipment's location and status.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/track')}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
                            >
                                <Search className="w-5 h-5" />
                                Track a Shipment
                            </button>
                            <a
                                href="https://wa.me/17202779473"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white rounded-2xl font-bold hover:bg-white/25 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                Contact Support
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
