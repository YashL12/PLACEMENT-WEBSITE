import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Lock, EyeOff, Server, Database } from 'lucide-react';
import { hasConsent, setConsent } from '../services/tracker';

export const PrivacyDialog = ({ isOpen, onClose }) => {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(!hasConsent());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleOptOut = () => {
    const nextState = !optedOut;
    setOptedOut(nextState);
    setConsent(!nextState);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Shield className="w-4 h-4" />
            </div>
            <h3 id="privacy-dialog-title" className="text-sm font-bold text-slate-900">
              Privacy &amp; First-Party Analytics Disclosure
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed mb-6">
          <p>
            GEC Placement Sarthi utilizes <strong>ordinary first-party telemetry</strong> to help our
            Training &amp; Placement student volunteers understand which company interview archives,
            DSA questions, and study notes are most useful to students.
          </p>

          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">No Personal Data</span>
                <span className="text-[11px] text-slate-500">
                  We never store passwords, private messages, or student identities.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">First-Party Only</span>
                <span className="text-[11px] text-slate-500">
                  Data is never shared with third-party ad networks or marketing brokers.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Server className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Anonymous Tokens</span>
                <span className="text-[11px] text-slate-500">
                  Visits use randomized local tokens (v_xxxx) without fingerprinting.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Strict Retention</span>
                <span className="text-[11px] text-slate-500">
                  Historical logs are pruned regularly to conserve college database resources.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
            <div>
              <span className="font-bold text-slate-800 block">First-Party Analytics Collection</span>
              <span className="text-[11px] text-slate-500">
                {optedOut
                  ? 'Telemetry is currently DISABLED for this browser.'
                  : 'Telemetry is currently ACTIVE to help improve resources.'}
              </span>
            </div>
            <button
              onClick={handleToggleOptOut}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                optedOut
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {optedOut ? 'Enable Telemetry' : 'Opt Out'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDialog;

