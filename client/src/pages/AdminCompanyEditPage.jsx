import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Save,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CompanyLogo } from '../components/CompanyLogo';

export const AdminCompanyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [aliasesText, setAliasesText] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [about, setAbout] = useState('');
  const [adviceList, setAdviceList] = useState(['']);
  const [isPublished, setIsPublished] = useState(true);
  const [needsReview, setNeedsReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isNew) {
      const loadCompany = async () => {
        try {
          setLoading(true);
          const res = await api.getCompanyById(id, true);
          if (res.success && res.data?.company) {
            const c = res.data.company;
            setName(c.name || '');
            setAliasesText((c.aliases || []).join(', '));
            setWebsite(c.website || '');
            setLogoUrl(c.logoUrl || '');
            setAbout(c.about || '');
            setAdviceList(c.generalAdvice?.length > 0 ? c.generalAdvice : ['']);
            setIsPublished(c.isPublished ?? true);
            setNeedsReview(c.needsReview ?? false);
            setReviewNotes(c.reviewNotes || '');
          }
        } catch (err) {
          setError(err.message || 'Failed to load company details');
        } finally {
          setLoading(false);
        }
      };

      loadCompany();
    }
  }, [id, isNew]);

  const handleAdviceChange = (index, value) => {
    const updated = [...adviceList];
    updated[index] = value;
    setAdviceList(updated);
  };

  const handleAddAdvice = () => {
    setAdviceList([...adviceList, '']);
  };

  const handleRemoveAdvice = (index) => {
    setAdviceList(adviceList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Company name is required');
      return;
    }

    const aliases = aliasesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const generalAdvice = adviceList
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      aliases,
      website: website.trim(),
      logoUrl: logoUrl.trim(),
      about: about.trim(),
      generalAdvice,
      isPublished,
      needsReview,
      reviewNotes: reviewNotes.trim(),
    };

    try {
      setSaving(true);
      if (isNew) {
        const res = await api.createCompany(payload);
        if (res.success) {
          navigate('/admin/dashboard');
        }
      } else {
        const res = await api.updateCompany(id, payload);
        if (res.success) {
          setSuccess('Company updated successfully!');
          setTimeout(() => navigate('/admin/dashboard'), 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save company changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading company record..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-600 transition-colors font-medium mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-purple-600" />
          <span>{isNew ? 'Create New Company' : `Edit: ${name || 'Company'}`}</span>
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. TSS Consultancy Private Limited"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
        </div>

        {/* Company Logo Reference & Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Company Logo URL or Asset Reference
            </label>
            {logoUrl && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Logo Configured</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="e.g. /logos/tss.png or https://example.com/logo.png"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-mono text-xs"
            />
            <CompanyLogo src={logoUrl} name={name || 'C'} size="md" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Specify local asset path (e.g. /logos/kevit.png) or verified public HTTPS image URL.
          </p>
        </div>

        {/* Aliases */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Recognized Aliases / Abbreviations (Comma Separated)
          </label>
          <input
            type="text"
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
            placeholder="e.g. TSS, TSS Consultancy"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Separate aliases with commas. Students searching any alias will be accurately matched to this canonical company record.
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Official Website URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
        </div>

        {/* About */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Company Description / Domain
          </label>
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Brief description of business and technology domains..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
        </div>

        {/* General Advice Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Company-Specific Candidate Advice
            </label>
            <button
              type="button"
              onClick={handleAddAdvice}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Advice Item</span>
            </button>
          </div>
          <div className="space-y-2.5">
            {adviceList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleAdviceChange(idx, e.target.value)}
                  placeholder={`Advice point ${idx + 1}...`}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                {adviceList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAdvice(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Publication & Review Controls */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Publish Record to Students (Public Access)
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="needsReview"
              checked={needsReview}
              onChange={(e) => setNeedsReview(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="needsReview" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Flag for Review / Quarantine
            </label>
          </div>
        </div>

        {/* Review Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Internal Review Notes
          </label>
          <input
            type="text"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Audit notes or reasons for review..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            to="/admin/dashboard"
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Company Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
