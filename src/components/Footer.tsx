
import { FaHeart, FaTwitter, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="relative z-10 bg-deep-slate-900 border-t border-deep-slate-border pt-16 pb-24 md:pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-right">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ice-mint to-ice-mint-active italic tracking-tighter mb-6 block">
                            LMINA
                        </Link>
                        <p className="text-text-secondary text-sm leading-8 max-w-md ml-auto">
                            منصة ترفيهية متكاملة تقدم أحدث الأفلام والمسلسلات بجودة عالية، بالإضافة إلى أدوات تعليمية وخدمات تحميل ذكية.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-6">تصفح</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link to="/" className="hover:text-ice-mint transition-colors">الرئيسية</Link></li>
                            <li><Link to="/courses" className="hover:text-ice-mint transition-colors">الكورسات</Link></li>
                            <li><Link to="/downloader" className="hover:text-ice-mint transition-colors">التحميل</Link></li>
                            <li><Link to="/matches" className="hover:text-ice-mint transition-colors">المباريات</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6">الدعم</h4>
                        <ul className="space-y-4 text-sm text-text-muted">
                            <li><Link to="#" className="hover:text-ice-mint transition-colors">سياسة الخصوصية</Link></li>
                            <li><Link to="#" className="hover:text-ice-mint transition-colors">شروط الاستخدام</Link></li>
                            <li><Link to="#" className="hover:text-ice-mint transition-colors">تواصل معنا</Link></li>
                            <li><Link to="#" className="hover:text-ice-mint transition-colors">الإبلاغ عن مشكلة</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-deep-slate-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-text-muted text-xs font-bold order-2 md:order-1 flex items-center gap-1">
                        صنع بكل <FaHeart className="text-red-500 animate-pulse" /> LMINA © 2026
                    </p>

                    <div className="flex items-center gap-6 order-1 md:order-2">
                        <a href="#" className="text-text-muted hover:text-ice-mint transition-colors text-xl"><FaGithub /></a>
                        <a href="#" className="text-text-muted hover:text-ice-mint transition-colors text-xl"><FaTwitter /></a>
                        <a href="#" className="text-text-muted hover:text-ice-mint transition-colors text-xl"><FaInstagram /></a>
                        <a href="#" className="text-text-muted hover:text-ice-mint transition-colors text-xl"><FaYoutube /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
