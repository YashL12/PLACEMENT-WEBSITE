import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BookOpen,
  Users,
  Shield,
  Home,
  MessageCircle,
  Heart,
  ExternalLink,
  GraduationCap,
  Mail,
} from 'lucide-react';

const WHATSAPP_NUMBER = '916351521549';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hi Yash, I have a question regarding your placement preparation website.'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Company Directory', path: '/companies', icon: Building2 },
    { label: 'Alumni Network', path: '/alumni', icon: Users },
    { label: 'Learning Resources', path: '/learning-material', icon: BookOpen },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto" role="contentinfo">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-5">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                <img
                  src="/gecr-logo.png"
                  alt="GECR Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">
                  GECR <span className="text-blue-400">Placement Sarthi</span>
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Government Engineering College, Rajkot
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An independent student-focused platform created to support placement preparation,
              skill development, and career readiness. Not an official institute website.
            </p>

            {/* Disclaimer badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Independent initiative to help GECR students with placements</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors group"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors group"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Contact & Support
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Have questions, suggestions, or feedback? Feel free to reach out — I'm happy to help!
            </p>

            {/* WhatsApp CTA */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500"
              style={{ background: '#25d366' }}
              aria-label="Contact on WhatsApp — opens in a new tab"
            >
              {/* WhatsApp SVG icon */}
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
            </a>

            <p className="text-xs text-slate-600 mt-3">
              WhatsApp:{' '}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                +91 63515 21549
              </a>
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {currentYear} GECR Placement Sarthi. All rights reserved.{' '}
              <span className="text-slate-600">Independent student initiative.</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <span>Designed &amp; Developed with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 flex-shrink-0" aria-hidden="true" />
              <span>by</span>
              <span className="font-bold text-white">Yash Lakhani</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
