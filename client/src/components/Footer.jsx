import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BookOpen,
  Users,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 shadow-2xs flex items-center justify-center flex-shrink-0">
                <img
                  src="/gecr-logo.png"
                  alt="GECR Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block">
                  GECR <span className="text-blue-400">Placement Sarthi</span>
                </span>
                <span className="text-xs text-slate-400 block">
                  Government Engineering College, Rajkot
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Official campus placement assistance platform dedicated to guiding engineering students through authentic interview experiences, recruitment rounds, technical question banks, study materials, and alumni networks.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Preserves original candidate interview questions and round details</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link to="/learning-material" className="hover:text-white transition-colors">
                  Learning Material
                </Link>
              </li>
              <li>
                <Link to="/alumni" className="hover:text-white transition-colors">
                  Alumni Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Integrity & Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Access & Integrity
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Designed as a transparent, centralized resource for students preparing for on-campus and off-campus placements.
            </p>
            <div>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Administrator Portal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} GECR Placement Sarthi. All rights reserved.</p>
          <p className="text-slate-400 font-medium">
            Designed & Developed by <span className="text-slate-200 font-semibold">Yash Lakhani</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
