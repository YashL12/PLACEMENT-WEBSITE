import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Layers,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  ExternalLink,
  Search,
  BookOpen,
  Users,
  Upload,
  Plus,
  Star,
  Download,
  X,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Briefcase,
  Settings,
  KeyRound,
  Lock,
  UserCheck,
  Image as ImageIcon,
  AlertCircle,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CompanyLogo } from '../components/CompanyLogo';
import { AlumniAvatar } from '../components/AlumniAvatar';

const MATERIAL_CATEGORIES = [
  'DSA & Problem Solving',
  'Aptitude & Logical Reasoning',
  'Core CS (OS, DBMS, CN)',
  'Web & Full Stack Development',
  'System Design',
  'Interview Prep & HR',
  'Company Specific Archives',
];

export const AdminDashboardPage = () => {
  const { admin, updateAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['companies', 'materials', 'alumni', 'review', 'reports', 'settings'];
  const initialTab = searchParams.get('tab') || 'review';
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'review');

  const [stats, setStats] = useState(null);
  const [reviewQueue, setReviewQueue] = useState({ companies: [], experiences: [] });
  const [companies, setCompanies] = useState([]);
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [importReports, setImportReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Logo upload ref & state for companies table
  const logoInputRef = useRef(null);
  const [uploadingLogoCompanyId, setUploadingLogoCompanyId] = useState(null);

  // Custom Delete Confirmation Modal state
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(false);

  // Credential Settings state
  const [credForm, setCredForm] = useState({
    currentPasswordForUser: '',
    newUsername: '',
    newEmail: '',
    currentPasswordForPass: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userUpdating, setUserUpdating] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState(null);
  const [credErrorMsg, setCredErrorMsg] = useState(null);

  // Modal states for Material Upload
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    category: 'DSA & Problem Solving',
    companyId: '',
    isExternalLink: false,
    externalUrl: '',
    isPublished: true,
  });
  const [materialFile, setMaterialFile] = useState(null);
  const [materialSubmitting, setMaterialSubmitting] = useState(false);

  // Modal states for Alumni Add/Edit
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [editingAlumniId, setEditingAlumniId] = useState(null);
  const [alumniForm, setAlumniForm] = useState({
    name: '',
    companyName: '',
    linkedinUrl: '',
    jobTitle: '',
    companyLogo: '',
    profilePhoto: '',
    isFeatured: false,
    isPublished: true,
  });
  const [alumniSubmitting, setAlumniSubmitting] = useState(false);

  const navigate = useNavigate();

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchTerm('');
    setSearchParams({ tab: tabName }, { replace: true });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reviewRes, companiesRes, reportsRes, materialsRes, alumniRes] = await Promise.all([
        api.getAdminStats(),
        api.getReviewQueue(),
        api.getCompanies({ limit: 100, includeUnpublished: true }),
        api.getImportReports(),
        api.getLearningMaterials({ limit: 100, includeUnpublished: true }).catch(() => ({ success: false })),
        api.getAlumni({ limit: 100, includeUnpublished: true }).catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (reviewRes.success) setReviewQueue(reviewRes.data);
      if (companiesRes.success) setCompanies(companiesRes.data.companies || []);
      if (reportsRes.success) setImportReports(reportsRes.data || []);
      if (materialsRes.success) setLearningMaterials(materialsRes.data?.materials || []);
      if (alumniRes.success) setAlumniList(alumniRes.data?.alumni || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Toggle company publication with optimistic instant UI update
  const handleToggleCompanyPublish = async (company) => {
    const nextStatus = !company.isPublished;
    setCompanies((prev) =>
      prev.map((c) => (c._id === company._id ? { ...c, isPublished: nextStatus } : c))
    );
    try {
      const res = await api.updateCompany(company._id, {
        isPublished: nextStatus,
      });
      if (res.success) {
        showNotification(
          `Company '${company.name}' ${nextStatus ? 'Published' : 'Unpublished'}`
        );
      } else {
        // Rollback on failure
        setCompanies((prev) =>
          prev.map((c) => (c._id === company._id ? { ...c, isPublished: !nextStatus } : c))
        );
        alert(res.message || 'Error updating publication status');
      }
    } catch (err) {
      setCompanies((prev) =>
        prev.map((c) => (c._id === company._id ? { ...c, isPublished: !nextStatus } : c))
      );
      alert(`Error updating publication status: ${err.message}`);
    }
  };

  // Direct Company Logo Upload from row
  const triggerLogoUpload = (companyId) => {
    setUploadingLogoCompanyId(companyId);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
      logoInputRef.current.click();
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingLogoCompanyId) return;

    try {
      showNotification('Uploading company logo...');
      const uploadRes = await api.uploadCompanyLogo(file);
      if (uploadRes.success && uploadRes.data?.logoUrl) {
        const newLogoUrl = uploadRes.data.logoUrl;
        const updateRes = await api.updateCompany(uploadingLogoCompanyId, { logoUrl: newLogoUrl });
        if (updateRes.success) {
          setCompanies((prev) =>
            prev.map((c) =>
              c._id === uploadingLogoCompanyId ? { ...c, logoUrl: newLogoUrl } : c
            )
          );
          showNotification('Company logo updated and cached successfully!');
        }
      }
    } catch (err) {
      alert(`Logo upload failed: ${err.message}`);
    } finally {
      setUploadingLogoCompanyId(null);
    }
  };

  // Confirm and execute company deletion
  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      setDeletingCompany(true);
      const res = await api.deleteCompany(companyToDelete._id);
      if (res.success) {
        setCompanies((prev) => prev.filter((c) => c._id !== companyToDelete._id));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totals: {
                  ...prev.totals,
                  companies: Math.max(0, prev.totals.companies - 1),
                  publishedCompanies: companyToDelete.isPublished
                    ? Math.max(0, prev.totals.publishedCompanies - 1)
                    : prev.totals.publishedCompanies,
                },
              }
            : prev
        );
        showNotification(res.message || `Deleted '${companyToDelete.name}'`);
        setCompanyToDelete(null);
      }
    } catch (err) {
      alert(`Error deleting company: ${err.message}`);
    } finally {
      setDeletingCompany(false);
    }
  };

  // Resolve Review item
  const handleResolveReview = async (type, id, action, targetCompanyId = null, notes = '') => {
    try {
      const res = await api.resolveReview({
        type,
        id,
        action,
        targetCompanyId,
        publishNow: true,
        notes: notes || 'Reviewed and validated by administrator',
      });
      if (res.success) {
        showNotification(res.message || 'Review item resolved successfully');
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error resolving review: ${err.message}`);
    }
  };

  // Update Admin User ID / Username & Email handler
  const handleUpdateAdminUser = async (e) => {
    e.preventDefault();
    setCredSuccessMsg(null);
    setCredErrorMsg(null);

    if (!credForm.currentPasswordForUser) {
      setCredErrorMsg('Current password is required to verify your identity');
      return;
    }
    if (!credForm.newUsername.trim() && !credForm.newEmail.trim()) {
      setCredErrorMsg('Please specify a new User ID / Username or new Email address');
      return;
    }

    try {
      setUserUpdating(true);
      const payload = {
        currentPassword: credForm.currentPasswordForUser,
      };
      if (credForm.newUsername.trim()) payload.newUsername = credForm.newUsername.trim();
      if (credForm.newEmail.trim()) payload.newEmail = credForm.newEmail.trim();

      const res = await api.updateAdminCredentials(payload);
      if (res.success) {
        updateAdmin(res.data);
        setCredSuccessMsg(res.message || 'Administrator User ID updated successfully! Use your new User ID on next login.');
        setCredForm((prev) => ({
          ...prev,
          currentPasswordForUser: '',
          newUsername: '',
          newEmail: '',
        }));
      }
    } catch (err) {
      setCredErrorMsg(err.message || 'Failed to update credentials');
    } finally {
      setUserUpdating(false);
    }
  };

  // Update Admin Password handler
  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    setCredSuccessMsg(null);
    setCredErrorMsg(null);

    if (!credForm.currentPasswordForPass) {
      setCredErrorMsg('Current password is required');
      return;
    }
    if (!credForm.newPassword) {
      setCredErrorMsg('New password is required');
      return;
    }
    if (credForm.newPassword.length < 8) {
      setCredErrorMsg('New password must be at least 8 characters long');
      return;
    }
    if (credForm.newPassword !== credForm.confirmPassword) {
      setCredErrorMsg('New password and confirm password do not match');
      return;
    }

    try {
      setPassUpdating(true);
      const res = await api.updateAdminCredentials({
        currentPassword: credForm.currentPasswordForPass,
        newPassword: credForm.newPassword,
        confirmPassword: credForm.confirmPassword,
      });

      if (res.success) {
        updateAdmin(res.data);
        setCredSuccessMsg('Administrator password changed successfully! Your old password has been invalidated.');
        setCredForm((prev) => ({
          ...prev,
          currentPasswordForPass: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      setCredErrorMsg(err.message || 'Failed to update password');
    } finally {
      setPassUpdating(false);
    }
  };

  // --- LEARNING MATERIALS HANDLERS ---
  const handleOpenMaterialModal = () => {
    setMaterialForm({
      title: '',
      description: '',
      category: 'DSA & Problem Solving',
      companyId: '',
      isExternalLink: false,
      externalUrl: '',
      isPublished: true,
    });
    setMaterialFile(null);
    setShowMaterialModal(true);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim()) {
      alert('Please enter a title for the material');
      return;
    }

    try {
      setMaterialSubmitting(true);
      let res;

      if (materialForm.isExternalLink) {
        if (!materialForm.externalUrl.trim()) {
          alert('Please enter an external resource URL');
          setMaterialSubmitting(false);
          return;
        }
        res = await api.createLearningMaterial({
          title: materialForm.title,
          description: materialForm.description,
          category: materialForm.category,
          companyId: materialForm.companyId,
          isExternalLink: true,
          externalUrl: materialForm.externalUrl,
          isPublished: materialForm.isPublished,
          fileType: 'LINK',
        });
      } else {
        if (!materialFile) {
          alert('Please select a file to upload');
          setMaterialSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', materialForm.title);
        formData.append('description', materialForm.description);
        formData.append('category', materialForm.category);
        if (materialForm.companyId) formData.append('companyId', materialForm.companyId);
        formData.append('isExternalLink', 'false');
        formData.append('isPublished', String(materialForm.isPublished));
        formData.append('file', materialFile);

        res = await api.createLearningMaterial(formData);
      }

      if (res.success) {
        showNotification('Learning material added successfully!');
        setShowMaterialModal(false);
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error saving material: ${err.message}`);
    } finally {
      setMaterialSubmitting(false);
    }
  };

  const handleToggleMaterialPublish = async (material) => {
    try {
      const res = await api.updateLearningMaterial(material._id, {
        isPublished: !material.isPublished,
      });
      if (res.success) {
        showNotification(
          `Material '${material.title}' ${!material.isPublished ? 'Published' : 'Unpublished'}`
        );
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error updating publication: ${err.message}`);
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (window.confirm(`Are you sure you want to delete '${material.title}'? This action cannot be undone.`)) {
      try {
        const res = await api.deleteLearningMaterial(material._id);
        if (res.success) {
          showNotification('Learning material deleted successfully');
          loadDashboardData();
        }
      } catch (err) {
        alert(`Error deleting material: ${err.message}`);
      }
    }
  };

  // --- ALUMNI HANDLERS ---
  const handleOpenAlumniModal = (alum = null) => {
    if (alum) {
      setEditingAlumniId(alum._id);
      setAlumniForm({
        name: alum.name || '',
        companyName: alum.companyName || '',
        linkedinUrl: alum.linkedinUrl || '',
        jobTitle: alum.jobTitle || '',
        companyLogo: alum.companyLogo || '',
        profilePhoto: alum.profilePhoto || '',
        isFeatured: alum.isFeatured || false,
        isPublished: alum.isPublished ?? true,
      });
    } else {
      setEditingAlumniId(null);
      setAlumniForm({
        name: '',
        companyName: '',
        linkedinUrl: '',
        jobTitle: '',
        companyLogo: '',
        profilePhoto: '',
        isFeatured: false,
        isPublished: true,
      });
    }
    setShowAlumniModal(true);
  };

  const handleAlumniSubmit = async (e) => {
    e.preventDefault();
    if (!alumniForm.name.trim() || !alumniForm.companyName.trim() || !alumniForm.linkedinUrl.trim()) {
      alert('Name, Company, and LinkedIn URL are required');
      return;
    }

    try {
      setAlumniSubmitting(true);
      let res;
      if (editingAlumniId) {
        res = await api.updateAlumni(editingAlumniId, alumniForm);
      } else {
        res = await api.createAlumni(alumniForm);
      }

      if (res.success) {
        showNotification(`Alumni profile ${editingAlumniId ? 'updated' : 'created'} successfully!`);
        setShowAlumniModal(false);
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error saving alumni: ${err.message}`);
    } finally {
      setAlumniSubmitting(false);
    }
  };

  const handleToggleAlumniFeatured = async (alum) => {
    try {
      const res = await api.toggleFeaturedAlumni(alum._id);
      if (res.success) {
        showNotification(
          `Alumni '${alum.name}' ${!alum.isFeatured ? 'marked as Featured' : 'unfeatured'}`
        );
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error updating featured status: ${err.message}`);
    }
  };

  const handleToggleAlumniPublish = async (alum) => {
    try {
      const res = await api.updateAlumni(alum._id, {
        isPublished: !alum.isPublished,
      });
      if (res.success) {
        showNotification(
          `Alumni profile '${alum.name}' ${!alum.isPublished ? 'Published' : 'Unpublished'}`
        );
        loadDashboardData();
      }
    } catch (err) {
      alert(`Error updating publication status: ${err.message}`);
    }
  };

  const handleDeleteAlumni = async (alum) => {
    if (window.confirm(`Are you sure you want to delete alumni profile for '${alum.name}'?`)) {
      try {
        const res = await api.deleteAlumni(alum._id);
        if (res.success) {
          showNotification('Alumni record deleted successfully');
          loadDashboardData();
        }
      } catch (err) {
        alert(`Error deleting alumni record: ${err.message}`);
      }
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading GECR Placement Sarthi Admin Console..." size="large" />
      </div>
    );
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.aliases?.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMaterials = learningMaterials.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.companyName && m.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAlumni = alumniList.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reviewQueueCount =
    (reviewQueue.companies?.length || 0) + (reviewQueue.experiences?.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-purple-700">
              GECR Placement Sarthi • Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Central Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage recruiting company records, logos, interview rounds, study materials, and alumni directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'companies' && (
            <Link
              to="/admin/companies/new"
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>Add Company</span>
            </Link>
          )}

          {activeTab === 'materials' && (
            <button
              onClick={handleOpenMaterialModal}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Learning Material</span>
            </button>
          )}

          {activeTab === 'alumni' && (
            <button
              onClick={() => handleOpenAlumniModal()}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Alumni Record</span>
            </button>
          )}

          <button
            onClick={loadDashboardData}
            title="Refresh statistics"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Action Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Companies</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {stats.totals.companies}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {stats.totals.publishedCompanies} Published
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Experiences</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {stats.totals.experiences}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              2024 & 2025 Seasons
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Study Materials</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {learningMaterials.length}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">
              Repository Assets
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Alumni Directory</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 block mb-1">
              {alumniList.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Graduate Records
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xs ${
            reviewQueueCount > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-amber-900">Review Queue</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-950 block mb-1">
              {reviewQueueCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              {reviewQueueCount > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => switchTab('companies')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'companies'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Companies & Logos ({companies.length})</span>
        </button>

        <button
          onClick={() => switchTab('materials')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'border-indigo-700 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learning Materials ({learningMaterials.length})</span>
        </button>

        <button
          onClick={() => switchTab('alumni')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'alumni'
              ? 'border-emerald-700 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumni Directory ({alumniList.length})</span>
        </button>

        <button
          onClick={() => switchTab('review')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'review'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Review Queue ({reviewQueueCount})</span>
        </button>

        <button
          onClick={() => switchTab('reports')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Import History</span>
        </button>

        <button
          onClick={() => switchTab('settings')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-blue-700 text-blue-700 bg-blue-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Security</span>
        </button>
      </div>

      {/* Hidden file input for fast company logo upload */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleLogoFileChange}
        className="hidden"
      />

      {/* TAB 1: Companies & Logos Management */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter companies by name or alias..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 font-medium">
                {filteredCompanies.length} of {companies.length} companies
              </span>
              <Link
                to="/admin/companies/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Company</span>
              </Link>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Logo</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Aliases</th>
                  <th className="py-3 px-4">Placement Seasons</th>
                  <th className="py-3 px-4">Experiences</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredCompanies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CompanyLogo src={c.logoUrl} name={c.name} size="sm" />
                        <button
                          type="button"
                          onClick={() => triggerLogoUpload(c._id)}
                          disabled={uploadingLogoCompanyId === c._id}
                          className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Change / Upload Company Logo"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <Link to={`/companies/${c._id}`} className="hover:text-blue-700 transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {c.aliases && c.aliases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.aliases.map((a, i) => (
                            <span key={i} className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.placementYears?.map((y) => (
                          <Badge key={y} variant={y === 2026 ? 'year2026' : y === 2025 ? 'year2025' : 'year2024'}>
                            {y}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.totalExperiencesCount || 0}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleCompanyPublish(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          c.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {c.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/companies/${c._id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Edit Company Details & Logo"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setCompanyToDelete(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                      No companies match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredCompanies.map((c) => (
              <div key={c._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo src={c.logoUrl} name={c.name} size="md" />
                    <div>
                      <Link to={`/companies/${c._id}`} className="font-bold text-slate-900 text-sm hover:text-blue-700 block">
                        {c.name}
                      </Link>
                      <span className="text-[11px] text-slate-500">
                        {c.totalExperiencesCount || 0} Experiences
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerLogoUpload(c._id)}
                    disabled={uploadingLogoCompanyId === c._id}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] flex items-center gap-1"
                    title="Change Logo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Logo</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex gap-1 flex-wrap">
                    {c.placementYears?.map((y) => (
                      <Badge key={y} variant={y === 2026 ? 'year2026' : y === 2025 ? 'year2025' : 'year2024'}>
                        {y}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCompanyPublish(c)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        c.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {c.isPublished ? 'Published' : 'Hidden'}
                    </button>
                    <Link
                      to={`/admin/companies/${c._id}/edit`}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setCompanyToDelete(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredCompanies.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No companies match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Learning Materials Management */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search learning materials..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleOpenMaterialModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Material</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Resource Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Type / Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredMaterials.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <span className="block truncate">{m.title}</span>
                      {m.description && (
                        <span className="text-[11px] text-slate-400 block truncate font-normal">
                          {m.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium text-[11px]">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {m.companyName || <span className="text-slate-400 italic">General</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {m.fileType} {m.fileSize > 0 && `(${(m.fileSize / 1024 / 1024).toFixed(1)} MB)`}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleMaterialPublish(m)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          m.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {m.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={m.isExternalLink ? m.fileUrl : `/api/learning-materials/${m._id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"
                          title="Preview / Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteMaterial(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      No learning materials uploaded yet. Click "Upload New Material" above to add study resources.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Alumni Directory Management (With Kevit Featured Ranking) */}
      {activeTab === 'alumni' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search alumni by name or company..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleOpenAlumniModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Alumni Record</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Alumni Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">LinkedIn</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredAlumni.map((a) => (
                  <tr key={a._id} className={`hover:bg-slate-50/70 transition-colors ${a.isFeatured ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <AlumniAvatar src={a.profilePhoto} name={a.name} size="sm" />
                        <span>{a.name}</span>
                        {a.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-blue-600" />
                            <span>Featured (Top)</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <CompanyLogo src={a.companyLogo} name={a.companyName} size="sm" />
                        <span>{a.companyName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {a.jobTitle || <span className="text-slate-400 italic">Graduate</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAlumniFeatured(a)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          a.isFeatured
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={a.isFeatured ? 'Featured first in directory' : 'Click to feature at top'}
                      >
                        <Star className={`w-3 h-3 ${a.isFeatured ? 'fill-blue-600 text-blue-600' : ''}`} />
                        <span>{a.isFeatured ? 'Featured First' : 'Set Featured'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAlumniPublish(a)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          a.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {a.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={a.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline font-medium"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAlumniModal(a)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAlumni(a)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAlumni.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No alumni records in directory. Click "Add Alumni Record" above to register graduates (e.g. Kevit).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Review Queue */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Authoritative Verification Requirement:</span>
              <p className="leading-relaxed">
                Source document inspection identified unheaded sections (e.g. Questions TnP 2025.pdf Page 8 and Pages 14-15) where the original PDF omitted an explicit company header. Per project requirements, these records are quarantined from public student view until approved or merged.
              </p>
            </div>
          </div>

          {/* Flagged Companies */}
          {reviewQueue.companies && reviewQueue.companies.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                Flagged Company Records ({reviewQueue.companies.length})
              </div>
              <div className="divide-y divide-slate-100">
                {reviewQueue.companies.map((c) => (
                  <div key={c._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        <Badge variant="review">Needs Review</Badge>
                        <Badge variant={c.isPublished ? 'published' : 'draft'}>
                          {c.isPublished ? 'Public' : 'Quarantined / Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl">{c.reviewNotes || c.about}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleResolveReview('company', c._id, 'approve', null, 'Approved by admin')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish & Approve</span>
                      </button>
                      <Link
                        to={`/admin/companies/${c._id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flagged Experiences */}
          {reviewQueue.experiences && reviewQueue.experiences.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                Flagged Interview Experiences ({reviewQueue.experiences.length})
              </div>
              <div className="divide-y divide-slate-100">
                {reviewQueue.experiences.map((exp) => (
                  <div key={exp._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 text-sm">
                          {exp.company?.name || 'Unassigned'} — {exp.role}
                        </span>
                        <Badge variant={exp.placementYear === 2025 ? 'year2025' : 'yearUnknown'}>
                          Season {exp.placementYear || 'Undated'}
                        </Badge>
                        <Badge variant="review">Awaiting Association</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                        {exp.reviewNotes || exp.processOverview}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Source: {exp.sourceDocument} ({exp.sourcePage})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleResolveReview('experience', exp._id, 'approve', null, 'Approved by admin')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Experience</span>
                      </button>

                      <Link
                        to={`/companies/${exp.company?._id || ''}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Questions</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewQueueCount === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Review Queue is Empty
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All extracted placement records have been validated and published to the student portal.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Import History & Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">
              System Ingestion & Import History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records extracted from Placement Data.docx, Questions TnP 2024 .pdf, and Questions TnP 2025.pdf
            </p>
          </div>

          <div className="p-5">
            {importReports.length > 0 ? (
              <div className="space-y-4">
                {importReports.map((report) => (
                  <div key={report._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-slate-800">
                        Import Date: {new Date(report.importDate).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Success
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-sm text-slate-900 block">{report.companiesCount}</span>
                        <span className="text-[10px] text-slate-400">Companies</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-sm text-slate-900 block">{report.experiencesCount}</span>
                        <span className="text-[10px] text-slate-400">Experiences</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-sm text-slate-900 block">{report.roundsCount}</span>
                        <span className="text-[10px] text-slate-400">Rounds</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-sm text-slate-900 block">{report.questionsCount}</span>
                        <span className="text-[10px] text-slate-400">Questions</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Source Files: </span>
                      {report.sourceFiles.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No import reports available.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Settings & Administrator Security */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <h2 className="text-base font-bold text-slate-900">
                    Administrator Security & Credentials
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Manage your admin login identifier (User ID / Username / Email) and change account password.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Active User ID
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {admin?.username || 'admin'}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Email
                  </span>
                  <span className="text-slate-700 font-medium">
                    {admin?.email || 'admin@placementportal.edu'}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Banner */}
            {credSuccessMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{credSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setCredSuccessMsg(null)}
                  className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Banner */}
            {credErrorMsg && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{credErrorMsg}</span>
                </div>
                <button
                  onClick={() => setCredErrorMsg(null)}
                  className="text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Form Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Change User ID / Email */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Change Administrator User ID
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Update the User ID or username used to log into the administrative console. You can also update the email address.
                </p>

                <form onSubmit={handleUpdateAdminUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={credForm.currentPasswordForUser}
                      onChange={(e) =>
                        setCredForm({ ...credForm, currentPasswordForUser: e.target.value })
                      }
                      placeholder="Enter current password to verify identity"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      New User ID / Username
                    </label>
                    <input
                      type="text"
                      value={credForm.newUsername}
                      onChange={(e) =>
                        setCredForm({ ...credForm, newUsername: e.target.value })
                      }
                      placeholder={`Current: ${admin?.username || 'admin'}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Can be alphanumeric (e.g. 6351521549, admin_gecr, or custom ID).
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      New Administrator Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={credForm.newEmail}
                      onChange={(e) =>
                        setCredForm({ ...credForm, newEmail: e.target.value })
                      }
                      placeholder={`Current: ${admin?.email || 'admin@placementportal.edu'}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={userUpdating}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{userUpdating ? 'Updating User ID...' : 'Save User ID Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Card B: Change Password */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <KeyRound className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Change Administrator Password
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Enter your current password and choose a strong new password of at least 8 characters.
                </p>

                <form onSubmit={handleUpdateAdminPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={credForm.currentPasswordForPass}
                      onChange={(e) =>
                        setCredForm({ ...credForm, currentPasswordForPass: e.target.value })
                      }
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={credForm.newPassword}
                      onChange={(e) =>
                        setCredForm({ ...credForm, newPassword: e.target.value })
                      }
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    {/* Live Strength Meter */}
                    {credForm.newPassword && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${
                              credForm.newPassword.length < 8
                                ? 'w-1/3 bg-rose-500'
                                : credForm.newPassword.length < 12
                                ? 'w-2/3 bg-amber-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {credForm.newPassword.length < 8
                            ? 'Too short'
                            : credForm.newPassword.length < 12
                            ? 'Good'
                            : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={credForm.confirmPassword}
                      onChange={(e) =>
                        setCredForm({ ...credForm, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password exactly"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    {credForm.confirmPassword && (
                      <p
                        className={`text-[10px] font-semibold mt-1 ${
                          credForm.newPassword === credForm.confirmPassword
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {credForm.newPassword === credForm.confirmPassword
                          ? '✓ Passwords match'
                          : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passUpdating}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{passUpdating ? 'Updating Password...' : 'Save New Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Security Architecture Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GECRPlacement Security & Storage Standard</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 leading-relaxed">
              <li>Passwords are encrypted using one-way bcrypt cryptographic hashing with automatic salt generation.</li>
              <li>Passwords are never transmitted in logs, returned in API payloads, or displayed in plaintext.</li>
              <li>Old passwords cannot be reused, and previous session tokens are automatically validated.</li>
              <li>Administrator registration is private and strictly protected by session authentication.</li>
            </ul>
          </div>
        </div>
      )}

      {/* --- MODAL: Upload Learning Material --- */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-bold text-slate-900">Upload Learning Material</h3>
              </div>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaterialSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Material Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. DSA Top 100 Interview Questions Guide"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Short summary of topics, algorithms, or formulas covered..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  >
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Related Company (Optional)
                  </label>
                  <select
                    value={materialForm.companyId}
                    onChange={(e) => setMaterialForm({ ...materialForm, companyId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="">General / None</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode: File upload vs External Link */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="materialMode"
                      checked={!materialForm.isExternalLink}
                      onChange={() => setMaterialForm({ ...materialForm, isExternalLink: false })}
                    />
                    <span>Upload Document File</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="materialMode"
                      checked={materialForm.isExternalLink}
                      onChange={() => setMaterialForm({ ...materialForm, isExternalLink: true })}
                    />
                    <span>External Resource Link</span>
                  </label>
                </div>

                {!materialForm.isExternalLink ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Select Document (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                      onChange={(e) => setMaterialFile(e.target.files[0] || null)}
                      className="w-full text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Resource URL (e.g. Google Drive, GitHub, LeetCode list)
                    </label>
                    <input
                      type="url"
                      value={materialForm.externalUrl}
                      onChange={(e) => setMaterialForm({ ...materialForm, externalUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Publication toggle */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={materialForm.isPublished}
                    onChange={(e) => setMaterialForm({ ...materialForm, isPublished: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Publish immediately for students</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={materialSubmitting}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {materialSubmitting ? 'Uploading...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add / Edit Alumni Record --- */}
      {showAlumniModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingAlumniId ? 'Edit Alumni Profile' : 'Add Alumni Record'}
                </h3>
              </div>
              <button
                onClick={() => setShowAlumniModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAlumniSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={alumniForm.name}
                  onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                  placeholder="e.g. Kevit or Alumni Graduate Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={alumniForm.companyName}
                    onChange={(e) => setAlumniForm({ ...alumniForm, companyName: e.target.value })}
                    placeholder="e.g. Kevit Technologies, TatvaSoft"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={alumniForm.jobTitle}
                    onChange={(e) => setAlumniForm({ ...alumniForm, jobTitle: e.target.value })}
                    placeholder="e.g. Software Engineer, AI Lead"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  LinkedIn Profile URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={alumniForm.linkedinUrl}
                  onChange={(e) => setAlumniForm({ ...alumniForm, linkedinUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Alumnus Profile Photo URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={alumniForm.profilePhoto}
                    onChange={(e) => setAlumniForm({ ...alumniForm, profilePhoto: e.target.value })}
                    placeholder="e.g. /uploads/alumni/photo.jpg or verified image URL"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                  />
                  <AlumniAvatar src={alumniForm.profilePhoto} name={alumniForm.name || 'Alumnus'} size="sm" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Must be an approved personal photo. If omitted, a clean neutral avatar placeholder is used. Never use a company logo.
                </p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Company Logo URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={alumniForm.companyLogo}
                    onChange={(e) => setAlumniForm({ ...alumniForm, companyLogo: e.target.value })}
                    placeholder="e.g. /logos/kevit.png or auto-matched from company"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                  />
                  <CompanyLogo src={alumniForm.companyLogo} name={alumniForm.companyName || 'C'} size="sm" />
                </div>
              </div>

              {/* Featured Alumni Toggle: Required for Kevit or any top alumni */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-900">
                  <input
                    type="checkbox"
                    checked={alumniForm.isFeatured}
                    onChange={(e) => setAlumniForm({ ...alumniForm, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    <span>Feature at Top of Alumni Directory (Pinned First)</span>
                  </span>
                </label>
                <p className="text-[11px] text-blue-700 font-normal leading-relaxed">
                  Featured alumni appear first in the directory grid across desktop and mobile. Mark Kevit as featured here to ensure Kevit always ranks #1.
                </p>
              </div>

              {/* Publication toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={alumniForm.isPublished}
                    onChange={(e) => setAlumniForm({ ...alumniForm, isPublished: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Publish publicly in student alumni directory</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAlumniModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={alumniSubmitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {alumniSubmitting ? 'Saving...' : 'Save Alumni Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Confirm Delete Company --- */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Company?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{companyToDelete.name}</strong>? All associated interview experiences, interview rounds, and questions for this company will also be permanently removed from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                disabled={deletingCompany}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCompany}
                disabled={deletingCompany}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {deletingCompany ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Company</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
