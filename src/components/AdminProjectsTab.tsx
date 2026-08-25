import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  Layers, 
  Sliders, 
  Code2, 
  Star, 
  Image, 
  Save, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProjectItem, ProjectGalleryItem, ProjectTechnology, ProjectMetric } from '../types/portfolio';
import { ImageUploader } from './ImageUploader';

interface AdminProjectsTabProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
  darkMode: boolean;
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({
  projects = [],
  onChange,
  darkMode,
}) => {
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'role' | 'details' | 'tech' | 'gallery' | 'metrics' | 'testimonial' | 'seo'>('basic');

  const handleStartCreate = () => {
    const newId = 'proj-' + Date.now();
    const newProject: ProjectItem = {
      id: newId,
      slug: 'new-project-' + Date.now(),
      title: 'New Featured Project',
      subtitle: 'Modern high-performance solution description',
      category: 'Web Development',
      status: 'Completed',
      duration: '3 Months',
      completionDate: new Date().toISOString().split('T')[0],
      featured: true,
      order: (projects.length || 0) + 1,
      views: 120,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80',
      gallery: [],
      client: {
        name: 'Client Contact',
        company: 'Partner Enterprise',
        industry: 'Technology',
        country: 'United States',
      },
      myRole: 'Lead Solutions Architect',
      roleResponsibilities: [
        'End-to-end technical direction and agile sprint management.',
        'Architected robust microservices and edge caching pipelines.',
      ],
      summary: 'Comprehensive overview of the client problem, engineering methodology, and measurable business outcomes achieved.',
      objectives: ['Modernize legacy infrastructure', 'Improve response latency by 50%'],
      challenges: ['High concurrent user spikes during market openings'],
      solutions: ['Implemented distributed Redis caching and edge microservices'],
      keyAchievements: ['Delivered project 2 weeks ahead of schedule'],
      technologies: [
        { name: 'React 19', category: 'Frontend' },
        { name: 'TypeScript', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'Tailwind CSS', category: 'Styling' },
      ],
      liveUrl: 'https://example.com',
      metrics: [
        { label: 'Latency Reduction', value: '75%' },
        { label: 'Uptime SLA', value: '99.99%' },
      ],
      testimonial: {
        clientName: 'Sarah Jenkins',
        clientRole: 'VP of Product',
        clientCompany: 'Partner Enterprise',
        rating: 5,
        comment: 'Outstanding technical acumen and project delivery.',
      },
    };
    setEditingProject(newProject);
    setIsCreating(true);
  };

  const handleSaveProject = () => {
    if (!editingProject) return;

    if (isCreating) {
      onChange([...projects, editingProject]);
    } else {
      onChange(projects.map(p => p.id === editingProject.id ? editingProject : p));
    }
    setEditingProject(null);
    setIsCreating(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      onChange(projects.filter(p => p.id !== id));
      if (editingProject?.id === id) {
        setEditingProject(null);
      }
    }
  };

  const handleToggleFeatured = (id: string) => {
    onChange(projects.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span>Projects & Portfolio Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create and edit rich case studies, technical stack tags, metrics, and before/after comparisons.
          </p>
        </div>

        {!editingProject && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        )}
      </div>

      {/* EDITING FORM */}
      {editingProject ? (
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        } space-y-6`}>
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {isCreating ? 'Create New Project' : 'Editing Project'}
              </span>
              <h4 className="text-lg font-bold">{editingProject.title || 'Untitled Project'}</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditingProject(null); setIsCreating(false); }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200'
                } cursor-pointer`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Project</span>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'role', label: 'Role & Client' },
              { id: 'details', label: 'Overview & Challenges' },
              { id: 'tech', label: 'Technologies' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'testimonial', label: 'Testimonial' },
              { id: 'seo', label: 'SEO' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BASIC INFO */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Project Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Subtitle / Headline</label>
                <input
                  type="text"
                  value={editingProject.subtitle || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="e.g. Cloud Architecture, AI & Full Stack"
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Duration / Timeline</label>
                  <input
                    type="text"
                    value={editingProject.duration || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                    placeholder="e.g. 4 Months (2024)"
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2.5 ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <ImageUploader
                    label="প্রজেক্ট থাম্বনেইল ছবি / Thumbnail Image"
                    sublabel="কার্ডে প্রদর্শনের জন্য ডিভাইস থেকে ছবি আপলোড করুন"
                    value={editingProject.thumbnailUrl}
                    onChange={(url) => setEditingProject({ ...editingProject, thumbnailUrl: url })}
                    darkMode={darkMode}
                    aspectRatio="video"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      ছবি Alt Text (Google SEO ও স্ক্রিন রিডার)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Cloud Platform Dashboard Preview"
                      value={editingProject.thumbnailAlt || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, thumbnailAlt: e.target.value })}
                      className={`w-full p-2 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border space-y-2.5 ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <ImageUploader
                    label="ব্যানার ছবি / Banner Image (Detail View)"
                    sublabel="ডিটেইল ভিউর হেডারের জন্য ডিভাইস থেকে ছবি আপলোড করুন"
                    value={editingProject.bannerUrl || ''}
                    onChange={(url) => setEditingProject({ ...editingProject, bannerUrl: url })}
                    darkMode={darkMode}
                    aspectRatio="wide"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      ব্যানার Alt Text (Google SEO ও স্ক্রিন রিডার)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High-throughput Enterprise Platform System Overview"
                      value={editingProject.bannerAlt || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, bannerAlt: e.target.value })}
                      className={`w-full p-2 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Live URL (Optional)</label>
                  <input
                    type="text"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">GitHub URL (Optional)</label>
                  <input
                    type="text"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={editingProject.featured}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-xs font-semibold cursor-pointer">
                  Featured on Homepage & Showcase Top
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE & CLIENT */}
          {activeSection === 'role' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">My Role in Project</label>
                <input
                  type="text"
                  value={editingProject.myRole}
                  onChange={(e) => setEditingProject({ ...editingProject, myRole: e.target.value })}
                  placeholder="e.g. Lead Solutions Architect, Full Stack Developer"
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Role Responsibilities (One per line)</label>
                <textarea
                  rows={3}
                  value={(editingProject.roleResponsibilities || []).join('\n')}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    roleResponsibilities: e.target.value.split('\n').filter(Boolean),
                  })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Client Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Client Contact Name</label>
                    <input
                      type="text"
                      value={editingProject.client?.name || ''}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        client: { ...editingProject.client, name: e.target.value },
                      })}
                      className={`w-full p-2.5 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editingProject.client?.company || ''}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        client: { ...editingProject.client, company: e.target.value },
                      })}
                      className={`w-full p-2.5 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OVERVIEW & DETAILS */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Executive Summary</label>
                <textarea
                  rows={4}
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Key Objectives (One per line)</label>
                <textarea
                  rows={3}
                  value={(editingProject.objectives || []).join('\n')}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    objectives: e.target.value.split('\n').filter(Boolean),
                  })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Challenges (One per line)</label>
                  <textarea
                    rows={3}
                    value={(editingProject.challenges || []).join('\n')}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      challenges: e.target.value.split('\n').filter(Boolean),
                    })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Solutions (One per line)</label>
                  <textarea
                    rows={3}
                    value={(editingProject.solutions || []).join('\n')}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      solutions: e.target.value.split('\n').filter(Boolean),
                    })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TECHNOLOGIES */}
          {activeSection === 'tech' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Tech Stack Tags</span>
                <button
                  type="button"
                  onClick={() => {
                    const newTech: ProjectTechnology = { name: 'New Tech', category: 'Frontend' };
                    setEditingProject({
                      ...editingProject,
                      technologies: [...(editingProject.technologies || []), newTech],
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tech</span>
                </button>
              </div>

              <div className="space-y-2">
                {(editingProject.technologies || []).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const updated = [...editingProject.technologies];
                        updated[idx].name = e.target.value;
                        setEditingProject({ ...editingProject, technologies: updated });
                      }}
                      placeholder="Tech name (e.g. Next.js, Redis)"
                      className={`flex-1 p-2 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <input
                      type="text"
                      value={t.category || ''}
                      onChange={(e) => {
                        const updated = [...editingProject.technologies];
                        updated[idx].category = e.target.value;
                        setEditingProject({ ...editingProject, technologies: updated });
                      }}
                      placeholder="Category (e.g. Database)"
                      className={`w-32 p-2 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject({
                          ...editingProject,
                          technologies: editingProject.technologies.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: METRICS */}
          {activeSection === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Key Numeric Metrics & Statistics</span>
                <button
                  type="button"
                  onClick={() => {
                    const newM: ProjectMetric = { label: 'Metric Name', value: '100%' };
                    setEditingProject({
                      ...editingProject,
                      metrics: [...(editingProject.metrics || []), newM],
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="space-y-2">
                {(editingProject.metrics || []).map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const updated = [...editingProject.metrics!];
                        updated[idx].label = e.target.value;
                        setEditingProject({ ...editingProject, metrics: updated });
                      }}
                      placeholder="Label (e.g. Latency Reduction)"
                      className={`flex-1 p-2 rounded-xl text-xs border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const updated = [...editingProject.metrics!];
                        updated[idx].value = e.target.value;
                        setEditingProject({ ...editingProject, metrics: updated });
                      }}
                      placeholder="Value (e.g. 78%)"
                      className={`w-28 p-2 rounded-xl text-xs border font-mono ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject({
                          ...editingProject,
                          metrics: editingProject.metrics!.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GALLERY & BEFORE/AFTER */}
          {activeSection === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Gallery Items & Before/After Comparison</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newG: ProjectGalleryItem = {
                        id: 'g-' + Date.now(),
                        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                        caption: 'System dashboard interface',
                        type: 'image',
                      };
                      setEditingProject({
                        ...editingProject,
                        gallery: [...(editingProject.gallery || []), newG],
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newBA: ProjectGalleryItem = {
                        id: 'ba-' + Date.now(),
                        url: '',
                        caption: 'Architecture Overhaul Before & After',
                        type: 'before_after',
                        beforeImageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
                        afterImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                      };
                      setEditingProject({
                        ...editingProject,
                        gallery: [...(editingProject.gallery || []), newBA],
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Add Before/After</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(editingProject.gallery || []).map((item, idx) => (
                  <div key={item.id} className="p-3 rounded-2xl border border-slate-800 space-y-2 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        {item.type === 'before_after' ? 'Before & After Slider' : `Image #${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject({
                            ...editingProject,
                            gallery: editingProject.gallery.filter(g => g.id !== item.id),
                          });
                        }}
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    {item.type === 'before_after' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <ImageUploader
                            label="পূর্বের ছবি / Before Image"
                            sublabel="ফাইল আপলোড করুন"
                            value={item.beforeImageUrl || ''}
                            onChange={(url) => {
                              const updated = [...editingProject.gallery];
                              updated[idx].beforeImageUrl = url;
                              setEditingProject({ ...editingProject, gallery: updated });
                            }}
                            darkMode={darkMode}
                            aspectRatio="video"
                          />
                        </div>
                        <div>
                          <ImageUploader
                            label="পরের ছবি / After Image"
                            sublabel="ফাইল আপলোড করুন"
                            value={item.afterImageUrl || ''}
                            onChange={(url) => {
                              const updated = [...editingProject.gallery];
                              updated[idx].afterImageUrl = url;
                              setEditingProject({ ...editingProject, gallery: updated });
                            }}
                            darkMode={darkMode}
                            aspectRatio="video"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <ImageUploader
                          label="গ্যালারি ছবি / Project Image"
                          sublabel="ডিভাইস থেকে ফাইল নির্বাচন করুন বা ড্রপ করুন"
                          value={item.url}
                          onChange={(url) => {
                            const updated = [...editingProject.gallery];
                            updated[idx].url = url;
                            setEditingProject({ ...editingProject, gallery: updated });
                          }}
                          darkMode={darkMode}
                          aspectRatio="video"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-slate-400">Caption</label>
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => {
                          const updated = [...editingProject.gallery];
                          updated[idx].caption = e.target.value;
                          setEditingProject({ ...editingProject, gallery: updated });
                        }}
                        className="w-full p-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TESTIMONIAL */}
          {activeSection === 'testimonial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editingProject.testimonial?.clientName || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      testimonial: { ...editingProject.testimonial, clientName: e.target.value, rating: editingProject.testimonial?.rating || 5, comment: editingProject.testimonial?.comment || '' },
                    })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Client Role & Company</label>
                  <input
                    type="text"
                    value={editingProject.testimonial?.clientRole || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      testimonial: { ...editingProject.testimonial!, clientRole: e.target.value },
                    })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Testimonial Quote</label>
                <textarea
                  rows={3}
                  value={editingProject.testimonial?.comment || ''}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    testimonial: { ...editingProject.testimonial!, comment: e.target.value },
                  })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 8: SEO */}
          {activeSection === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">SEO Title (Search Engine Snippet Title)</label>
                  <input
                    type="text"
                    value={editingProject.seoTitle || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, seoTitle: e.target.value })}
                    placeholder="e.g. FinTech Architecture Case Study | Alex Vance"
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">SEO URL Slug (/project/your-slug)</label>
                  <input
                    type="text"
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    placeholder="e.g. enterprise-cloud-platform"
                    className={`w-full p-2.5 rounded-xl text-xs border font-mono ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">SEO Meta Description (Google Search Result Description)</label>
                <textarea
                  rows={3}
                  value={editingProject.seoDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, seoDescription: e.target.value })}
                  placeholder="Search engine summary (150-160 characters)"
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Focus Keywords (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={editingProject.seoKeywords?.join(', ') || ''}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    seoKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                  placeholder="e.g. Cloud Architecture, Microservices, FinTech, High Availability"
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <ImageUploader
                  label="সোশ্যাল শেয়ার ইমেজ / Open Graph Share Image"
                  sublabel="এই প্রজেক্টের লিংক ফেসবুকে বা লিঙ্কডইনে শেয়ার করার সময় যে ছবি প্রিভিউ হবে"
                  value={editingProject.ogImageUrl || ''}
                  onChange={(url) => setEditingProject({ ...editingProject, ogImageUrl: url })}
                  darkMode={darkMode}
                  aspectRatio="landscape"
                />
              </div>
            </div>
          )}

        </div>
      ) : (
        /* PROJECTS LIST VIEW */
        <div className="space-y-3">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={proj.thumbnailUrl}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold truncate">{proj.title}</h4>
                    {proj.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{proj.category}</span>
                    <span>•</span>
                    <span>Role: <strong className="text-slate-300">{proj.myRole}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-indigo-400">{proj.views || 350} views</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(proj.id)}
                  title={proj.featured ? 'Remove from Featured' : 'Mark as Featured'}
                  className={`p-2 rounded-xl border text-xs cursor-pointer ${
                    proj.featured 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={proj.featured ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={() => { setEditingProject(proj); setIsCreating(false); setActiveSection('basic'); }}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 text-indigo-400 cursor-pointer ${
                    darkMode ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/40' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Edit Project"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(proj.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
