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
  Upload,
  Image,
  Globe,
  Calendar,
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
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [about, setAbout] = useState('');
  const [placementYears, setPlacementYears] = useState([2024, 2025]);
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
            setPlacementYears(c.placementYears?.length ? c.placementYears : [2024, 2025]);
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

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, SVG, WebP)');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleYearToggle = (yr) => {
    if (placementYears.includes(yr)) {
      setPlacementYears(placementYears.filter((y) => y !== yr));
    } else {
      setPlacementYears([...placementYears, yr].sort());
    }
  };

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

    try {
      setSaving(true);

      let finalLogoUrl = logoUrl.trim();

      // If user selected an image file, upload it first
      if (logoFile) {
        try {
          const uploadRes = await api.uploadCompanyLogo(isNew ? null : id, logoFile);
          if (uploadRes.success && uploadRes.logoUrl) {
            finalLogoUrl = uploadRes.logoUrl;
          }
        } catch (uploadErr) {
          setError(`Logo upload failed: ${uploadErr.message}`);
          setSaving(false);
          return;
        }
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
        logoUrl: finalLogoUrl,
        about: about.trim(),
        generalAdvice,
        placementYears,
        isPublished,
        needsReview,
        reviewNotes: reviewNotes.trim(),
      };

      if (isNew) {
        const res = await api.createCompany(payload);
        if (res.success) {
          navigate('/admin/dashboard?tab=companies');
        }
      } else {
        const res = await api.updateCompany(id, payload);
        if (res.success) {
          setSuccess('Company updated successfully!');
          setTimeout(() => navigate('/admin/dashboard?tab=companies'), 1000);
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

  const effectiveLogoSrc = logoPreview || logoUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-6">
        <Link
          to="/admin/dashboard?tab=companies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 transition-colors font-medium mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-blue-700" />
          <span>{isNew ? 'Create New Company' : `Edit: ${name || 'Company'}`}</span>
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 shadow-2xs">
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
          />
        </div>

        {/* Company Logo Section with Upload and URL option */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Company Logo
            </label>
            {effectiveLogoSrc && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Logo Configured</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <CompanyLogo src={effectiveLogoSrc} name={name || 'C'} size="lg" />
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100/70 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                  <span>{logoFile ? 'Replace Logo File' : 'Upload Logo File'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </label>
                {logoFile && (
                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    if (logoFile) {
                      setLogoFile(null);
                      setLogoPreview('');
                    }
                  }}
                  placeholder="Or enter logo path/URL: e.g. /logos/tss.png"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Supports PNG, SVG, JPG, WebP. Logos outside the viewport lazy-load automatically with professional fallback initials.
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono text-xs"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Separate aliases with commas. Students searching any alias will be accurately matched.
          </p>
        </div>

        {/* Placement Years */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Placement Seasons
          </label>
          <div className="flex items-center gap-3">
            {[2024, 2025, 2026].map((yr) => {
              const selected = placementYears.includes(yr);
              return (
                <button
                  type="button"
                  key={yr}
                  onClick={() => handleYearToggle(yr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Season {yr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Official Website URL (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>
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
            placeholder="Overview of the company, domain, and work culture..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all leading-relaxed"
          />
        </div>

        {/* General Advice */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              General Advice &amp; Tips for Candidates
            </label>
            <button
              type="button"
              onClick={handleAddAdvice}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Advice Bullet</span>
            </button>
          </div>
          <div className="space-y-2">
            {adviceList.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleAdviceChange(index, e.target.value)}
                  placeholder={`Tip #${index + 1}...`}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {adviceList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAdvice(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Publishing & Review Flags */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-700 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800">Publish Immediately</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsReview}
                onChange={(e) => setNeedsReview(e.target.checked)}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-slate-800">Flag for Review</span>
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/admin/dashboard?tab=companies"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNew ? 'Create Company' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
