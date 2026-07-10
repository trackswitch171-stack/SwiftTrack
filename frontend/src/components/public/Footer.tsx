import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0B3D91] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                Swift<span className="text-orange-500">Track</span>
                            </span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed mb-5">
                            Global logistics and shipment tracking platform connecting businesses and customers across 220+ countries worldwide.
                        </p>
                        <div className="flex gap-3">
                            {['FB', 'TW', 'LI', 'IG'].map((label, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors text-xs font-bold"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Services</h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            {['Express Shipping', 'Standard Delivery', 'Freight Services', 'Document Delivery', 'Customs Clearance', 'Warehousing'].map(s => (
                                <li key={s}>
                                    <a href="#" className="hover:text-orange-400 transition-colors">{s}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Company</h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            {['About Us', 'Careers', 'Press Room', 'Partners', 'Sustainability', 'Privacy Policy'].map(s => (
                                <li key={s}>
                                    <a href="#" className="hover:text-orange-400 transition-colors">{s}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                <span>Global Operations Center<br />New York, United States</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <a href="https://wa.me/17202779473" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                                    +1 (720) 277-9473
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <span>trackswitch171@gmail.com</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Globe className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <span>220+ Countries Covered</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/50">
                    <p>© {new Date().getFullYear()} SwiftTrack Global Logistics. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
