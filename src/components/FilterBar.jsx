import React from 'react';
import { Search, X, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) {
  const statuses = [
    { id: 'All', label: 'All Statuses' },
    { id: 'Verified Authentic', label: 'Verified Authentic' },
    { id: 'Suspicious / Needs Review', label: 'Suspicious' },
    { id: 'Potentially Fraudulent', label: 'Fraud Alerts' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Live Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name on certificate, course/internship title, platform, skills, or ID..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {statuses.map(st => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-slate-200">
                  {st.label}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newestUpload" className="bg-slate-900">Recently Uploaded</option>
              <option value="newestIssue" className="bg-slate-900">Newest Completion Date</option>
              <option value="highestScore" className="bg-slate-900">Highest Trust Score</option>
              <option value="lowestScore" className="bg-slate-900">Lowest Trust Score (Fraud First)</option>
              <option value="nameAsc" className="bg-slate-900">Student Name (A - Z)</option>
              <option value="titleAsc" className="bg-slate-900">Title (A - Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Audit Table View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
