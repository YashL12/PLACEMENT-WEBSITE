import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ExternalLink,
  Download,
  Eye,
  X,
  FileText,
  FolderOpen,
  FolderArchive,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

const DRIVE_FOLDER_ID = '1iMmrTNARZh03kdYssmwjFAvee3FIJxNE';
const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=sharing`;

// The 22 verified individual notes from Yash Lakhani's Google Drive folder
export const VERIFIED_DRIVE_NOTES = [
  {
    id: 'note-1',
    driveId: '1Eh3mPC7gwj5XrnAbZJuj-RX1bKAo00q2',
    title: 'Handwritten Java Notes (IMP Only)',
    fileName: 'Handwritten Java notes (IMP only)',
    category: 'Programming & OOPs',
    description: 'High-yield Java interview notes focusing exclusively on frequently tested questions and concepts.',
    tags: ['Java', 'IMP Topics', 'Interview'],
  },
  {
    id: 'note-2',
    driveId: '15Y-0pF3zon0HTuTpk9UBRYGs6I31vsx-',
    title: 'Advanced DSA Notes',
    fileName: 'Advanced DSA notes.pdf',
    category: 'DSA & Problem Solving',
    description: 'Advanced Data Structures & Algorithms notes covering trees, graphs, dynamic programming, backtracking, and optimization.',
    tags: ['DSA', 'Trees', 'Graphs', 'DP'],
  },
  {
    id: 'note-3',
    driveId: '1SnkSRUMTnxobQcYGfk064O57M6BCSkLe',
    title: 'DSA Notes 📗',
    fileName: '𝘿𝙎𝘼 𝙉𝙤𝙩𝙚𝙨 📗.pdf',
    category: 'DSA & Problem Solving',
    description: 'Core DSA revision notes with concepts, complexity analysis, and frequently tested placement patterns.',
    tags: ['DSA', 'Algorithms', 'Revision'],
  },
  {
    id: 'note-4',
    driveId: '1mrTVbKgiEaeYgDRVIU9nyTpQ5OT2G8Qt',
    title: 'DSA Cheat Sheet',
    fileName: 'DSA Cheat Sheet (1).pdf',
    category: 'DSA & Problem Solving',
    description: 'Quick reference DSA cheatsheet for last-minute placement interview revisions and key formula reviews.',
    tags: ['DSA', 'Cheatsheet', 'Formulas'],
  },
  {
    id: 'note-5',
    driveId: '1q5bnQBcTCuHL63CklUTRuoKdznvvDHUY',
    title: 'Top 50 DSA Interview Questions',
    fileName: 'Top 50 DSA Interview Questions.pdf',
    category: 'DSA & Problem Solving',
    description: 'Curated list of 50 most frequently asked coding interview questions in campus placement exams.',
    tags: ['DSA', 'Top 50', 'Interview Prep'],
  },
  {
    id: 'note-6',
    driveId: '1E1Y74jr21c5LG03ToYbsXsdRpZJ8p7yj',
    title: 'LeetCode SDE Sheet',
    fileName: 'Leetcode SDE Sheet.pdf',
    category: 'DSA & Problem Solving',
    description: 'Structured SDE preparation sheet mapping top LeetCode problems categorized by topic and difficulty level.',
    tags: ['LeetCode', 'SDE', 'Coding'],
  },
  {
    id: 'note-7',
    driveId: '15b5YbOKITSrTPLB9qrzf-2gByDmK-1xi',
    title: 'OOPs Handwritten Notes',
    fileName: 'OOPs Handwritten Notes.pdf',
    category: 'Programming & OOPs',
    description: 'Object-Oriented Programming concepts: Encapsulation, Abstraction, Inheritance, Polymorphism with code examples.',
    tags: ['OOPs', 'Classes', 'Polymorphism'],
  },
  {
    id: 'note-8',
    driveId: '1cQ2lz6k1FDaJtBC2q5wQxuDC8uTI91--',
    title: 'C Language Handwritten Notes',
    fileName: 'C-Handwritten Notes.pdf',
    category: 'Programming & OOPs',
    description: 'Handwritten C programming notes covering pointers, dynamic memory allocation, structures, and recursion.',
    tags: ['C', 'Pointers', 'Memory'],
  },
  {
    id: 'note-9',
    driveId: '1m8v-iv2yQZ3qzSauvI51dXWAU5ZZ0jdy',
    title: 'C Handwritten Notes (Vol 2)',
    fileName: 'C-Handwritten Notes (1).pdf',
    category: 'Programming & OOPs',
    description: 'Extended C programming revision notes with interview code walkthroughs and debugging tips.',
    tags: ['C Language', 'Practice', 'Notes'],
  },
  {
    id: 'note-10',
    driveId: '1bQzgxZeSy568S-yZutgU0OfM4RyseCFU',
    title: 'Java Complete Notes',
    fileName: 'Java_Complete_Notes.pdf',
    category: 'Programming & OOPs',
    description: 'End-to-end Java guide including Core Java, Collections Framework, Multithreading, Exceptions, and JVM architecture.',
    tags: ['Java', 'Collections', 'Multithreading'],
  },
  {
    id: 'note-11',
    driveId: '1N-HLXcJdZ2UQ83mgyqLRT8LoVdpNi7rK',
    title: 'Java Fundamental Notes',
    fileName: 'Java Fundamental notes (1).pdf',
    category: 'Programming & OOPs',
    description: 'Foundations of Java programming: syntax, classes, access specifiers, inheritance, and core principles.',
    tags: ['Java', 'Core Java', 'Fundamentals'],
  },
  {
    id: 'note-12',
    driveId: '19JTiDM4F4SW3VuRLTguUoLEwdNDPWF7v',
    title: 'HTML Handwritten Notes',
    fileName: 'HTML Handwritten Notes (1).pdf',
    category: 'Web Development',
    description: 'HTML5 handwritten notes with semantic tags, forms, tables, accessibility, and modern web fundamentals.',
    tags: ['HTML5', 'Web Dev', 'Frontend'],
  },
  {
    id: 'note-13',
    driveId: '19qQsTq8HhAhGDLsArp9bSCl2dn9q8HAv',
    title: 'JavaScript Complete Notes',
    fileName: 'JavaScript - Notes.pdf',
    category: 'Web Development',
    description: 'Modern JS: closures, event loop, promises, async/await, prototypes, and ES6+ features in depth.',
    tags: ['JavaScript', 'ES6', 'Async'],
  },
  {
    id: 'note-14',
    driveId: '14TvCKPD127PZuE3jN-3-6bq4IykyQqMu',
    title: 'JavaScript Fundamentals',
    fileName: 'javascript Fundamentle.pdf',
    category: 'Web Development',
    description: 'Core JavaScript fundamentals: variables, scope, functions, arrays, objects, and DOM manipulation.',
    tags: ['JavaScript', 'DOM', 'Basics'],
  },
  {
    id: 'note-15',
    driveId: '1v5vXIouRhz1o3PF6L3Jxy-T6Zn29tUtI',
    title: 'JavaScript Handwritten Notes',
    fileName: 'Javascript Handwritten Notes.pdf',
    category: 'Web Development',
    description: 'Clean handwritten notes on JavaScript interview questions, tricky outputs, and scoping quirks.',
    tags: ['JavaScript', 'Handwritten', 'Interview'],
  },
  {
    id: 'note-16',
    driveId: '1pGV6L3KwZWB8TUJNaQ6RMOmkiokYrtpD',
    title: 'Node.js Handwritten Notes',
    fileName: 'NodeJS-Handwritten-Notes.pdf',
    category: 'Web Development',
    description: 'Node.js backend concepts: Event-driven architecture, Buffer & Streams, fs module, and HTTP server.',
    tags: ['Node.js', 'Backend', 'Runtime'],
  },
  {
    id: 'note-17',
    driveId: '1_0IxhMByuRJelmTF-IZhO3KX6Ar5-nxD',
    title: 'Express.js Handwritten Notes',
    fileName: 'ExpressJS-Handwritten-Notes.pdf',
    category: 'Web Development',
    description: 'Express.js web framework guide: routing, middleware, RESTful API design, and error handling.',
    tags: ['Express.js', 'APIs', 'Middleware'],
  },
  {
    id: 'note-18',
    driveId: '1TXAVPd0CLxvMSx3DVuzyU-nvYAspdMd-',
    title: 'SQL Complete Notes',
    fileName: 'SQL-Notes.pdf',
    category: 'Databases & SQL',
    description: 'Comprehensive SQL notes: DDL, DML, DCL, indexing, views, stored procedures, and query optimizations.',
    tags: ['SQL', 'RDBMS', 'Queries'],
  },
  {
    id: 'note-19',
    driveId: '1DE99O4VWrQHfhrBzW4N6ICIH56wIV8Ud',
    title: 'SQL Handwritten Notes',
    fileName: 'SQL Handwritten Notes .pdf',
    category: 'Databases & SQL',
    description: 'Handwritten SQL query examples: complex joins, nested subqueries, grouping, and window functions.',
    tags: ['SQL', 'Joins', 'Subqueries'],
  },
  {
    id: 'note-20',
    driveId: '1UuE7Hb8jCUI-oOMqJo8Qk19MWo_x5uIQ',
    title: 'MongoDB Handwritten Notes',
    fileName: 'MongoDB Handwritten Notes (1).pdf',
    category: 'Databases & SQL',
    description: 'NoSQL MongoDB guide: schema design, aggregation pipeline, indexing, and CRUD operations.',
    tags: ['MongoDB', 'NoSQL', 'Database'],
  },
  {
    id: 'note-21',
    driveId: '1T4HL8RWdQxpxmCAWdNuutn3kwBK6ZzpR',
    title: 'Handwritten Aptitude Notes',
    fileName: 'handwritten aptitude.pdf',
    category: 'Aptitude & Reasoning',
    description: 'Quantitative aptitude and logical reasoning formulas, shortcut tricks, and speed calculation techniques.',
    tags: ['Aptitude', 'Reasoning', 'Maths'],
  },
  {
    id: 'note-22',
    driveId: '1TqEjeiPbVGRHGN6-UWO2m89T6HxZWUYH',
    title: 'HR Interview Questions & Answers',
    fileName: 'HR interview Questions .pdf',
    category: 'HR & Interview Prep',
    description: 'Top HR round questions, behavioral questions, STAR method responses, and company placement advice.',
    tags: ['HR Round', 'Behavioral', 'STAR Method'],
  },
];

const CATEGORIES = [
  'All Notes',
  'DSA & Problem Solving',
  'Programming & OOPs',
  'Web Development',
  'Databases & SQL',
  'Aptitude & Reasoning',
  'HR & Interview Prep',
];

const CATEGORY_COLORS = {
  'DSA & Problem Solving': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: 'hover:border-emerald-300',
  },
  'Programming & OOPs': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    accent: 'hover:border-blue-300',
  },
  'Web Development': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    accent: 'hover:border-indigo-300',
  },
  'Databases & SQL': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: 'hover:border-amber-300',
  },
  'Aptitude & Reasoning': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    accent: 'hover:border-purple-300',
  },
  'HR & Interview Prep': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    accent: 'hover:border-rose-300',
  },
};

export const LearningMaterialPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQueryParam = searchParams.get('search') || '';
  const categoryQueryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryQueryParam);
  const [previewNote, setPreviewNote] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setSelectedCategory(categoryQueryParam);
  }, [searchQueryParam, categoryQueryParam]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (!newParams[key] || newParams[key] === 'All Notes') {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchParams({});
  };

  // Filter notes based on search & category
  const filteredNotes = useMemo(() => {
    return VERIFIED_DRIVE_NOTES.filter((note) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'All Notes' ||
        note.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.fileName.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query) ||
        note.category.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All Notes': VERIFIED_DRIVE_NOTES.length };
    VERIFIED_DRIVE_NOTES.forEach((note) => {
      counts[note.category] = (counts[note.category] || 0) + 1;
    });
    return counts;
  }, []);

  const hasFilters = searchQuery || (selectedCategory && selectedCategory !== 'All Notes');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="section-eyebrow mb-3">
                <BookOpen className="w-3 h-3" aria-hidden="true" />
                Verified Study Material
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Placement Preparation Notes
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                Handwritten notes, problem sheets, and interview guides curated by{' '}
                <strong className="text-slate-700 font-semibold">Yash Lakhani</strong> for GECR
                students. View each note individually, preview online, or open directly in Google Drive.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-lg">
                22
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800">Verified Notes</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> 100% Free for GECR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Google Drive Folder Direct Access Banner ─── */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-7 shadow-md text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-400/10 rounded-full blur-xl" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <FolderArchive className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Google Drive Folder
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-semibold border border-emerald-400/30">
                    Shared Access
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-white leading-tight mb-1">
                  Yash Lakhani's Complete Placement Folder
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                  Browse all 22 documents individually below, or access the shared Google Drive folder
                  to view all files in one place.
                </p>
              </div>
            </div>

            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
              aria-label="Open Google Drive folder in a new tab"
            >
              <span>Open Drive Folder</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* ─── Search + Category Filter Section ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-7 space-y-4">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none" aria-hidden="true">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFilters({ search: e.target.value });
              }}
              placeholder="Search by topic, subject, language (e.g., DSA, Java, SQL, Aptitude, Leetcode)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              aria-label="Search notes"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateFilters({ search: '' });
                }}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            role="group"
            aria-label="Filter by subject"
          >
            {CATEGORIES.map((cat) => {
              const active =
                (!selectedCategory && cat === 'All Notes') || selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const next = cat === 'All Notes' ? '' : cat;
                    setSelectedCategory(next);
                    updateFilters({ category: next });
                  }}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Results Meta Bar ─── */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-5 px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-800 font-bold">{filteredNotes.length}</strong> of{' '}
              <strong className="text-slate-800 font-bold">{VERIFIED_DRIVE_NOTES.length}</strong>{' '}
              individual notes from Yash Lakhani's Google Drive
              {selectedCategory && selectedCategory !== 'All Notes' && (
                <>
                  {' '}
                  in &ldquo;<span className="text-blue-600 font-semibold">{selectedCategory}</span>&rdquo;
                </>
              )}
            </span>
          </div>

          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* ─── Individual Notes Grid ─── */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => {
              const colorConfig =
                CATEGORY_COLORS[note.category] || CATEGORY_COLORS['DSA & Problem Solving'];
              const viewUrl = `https://drive.google.com/file/d/${note.driveId}/view?usp=sharing`;
              const downloadUrl = `https://drive.google.com/uc?export=download&id=${note.driveId}`;

              return (
                <article
                  key={note.id}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group ${colorConfig.accent}`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row: Category badge & PDF pill */}
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${colorConfig.badge}`}
                      >
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                        PDF
                      </span>
                    </div>

                    {/* Note Title & Icon */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorConfig.iconBg}`}
                      >
                        <FileText className="w-4.5 h-4.5" aria-hidden="true" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {note.title}
                      </h3>
                    </div>

                    {/* Note Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                      {note.description}
                    </p>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Original File Name */}
                    <div className="text-[11px] text-slate-400 font-mono truncate border-t border-slate-100 pt-2.5 flex items-center gap-1.5">
                      <span className="text-slate-300">File:</span>
                      <span className="truncate text-slate-500">{note.fileName}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                    {/* Preview Button (In-app modal) */}
                    <button
                      onClick={() => setPreviewNote(note)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                      title="Preview this note inside the website"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Preview</span>
                    </button>

                    {/* Open in Drive Button */}
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                      title="Open in Google Drive"
                      aria-label={`Open ${note.title} in Google Drive`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      <span className="hidden sm:inline">Drive</span>
                    </a>

                    {/* Direct Download Button */}
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs"
                      title="Download PDF directly"
                      aria-label={`Download ${note.title}`}
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No notes match your search"
            description="Try searching for a different keyword or choose another category from the filters above."
            actionLabel="Reset all filters"
            onAction={handleClearFilters}
          />
        )}
      </div>

      {/* ─── In-App Google Drive PDF Preview Modal ─── */}
      {previewNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          onClick={() => setPreviewNote(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3
                    id="preview-modal-title"
                    className="text-sm sm:text-base font-bold text-slate-900 truncate"
                  >
                    {previewNote.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{previewNote.fileName}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://drive.google.com/file/d/${previewNote.driveId}/view?usp=sharing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Open in Drive</span>
                </a>
                <a
                  href={`https://drive.google.com/uc?export=download&id=${previewNote.driveId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={() => setPreviewNote(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Google Drive Preview */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={`https://drive.google.com/file/d/${previewNote.driveId}/preview`}
                title={`Preview of ${previewNote.title}`}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningMaterialPage;
