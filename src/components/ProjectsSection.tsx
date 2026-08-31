import React, { useState } from 'react';
import { 
  Briefcase, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Code2, 
  Search, 
  TrendingUp, 
  Star,
  Eye,
  Filter
} from 'lucide-react';
import { ProjectItem, SectionHeaderConfig } from '../types/portfolio';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  darkMode: boolean;
  onSelectProject: (project: ProjectItem) => void;
  headerConfig?: SectionHeaderConfig;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  projects = [], 
  darkMode, 
  onSelectProject,
  headerConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.myRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technologies && p.technologies.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="projects" className="py-16 md:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{headerConfig?.badge || 'Engineered Solutions & Case Studies'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {headerConfig?.title || 'Featured Projects & Portfolio'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              {headerConfig?.subtitle || 'Comprehensive case studies spanning high-scale distributed architectures, AI operations, and modern web platforms.'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or tech..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition-all outline-none ${
                darkMode 
                  ? 'bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 shadow-xs'
              }`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : darkMode
                    ? 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-slate-400 text-sm">No projects found matching your search filters.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-3 text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`group rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl shadow-xs'
                }`}
              >
                {/* Top Image Preview with Overlay Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  {/* Badges in Image */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        Featured Case Study
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 text-xs border border-white/10">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono text-[11px]">{project.views || 450}</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Role: <strong className="text-white">{project.myRole}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    
                    {project.subtitle && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-1 italic">
                        {project.subtitle}
                      </p>
                    )}

                    <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {project.summary}
                    </p>

                    {/* Key Metrics row */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80">
                        {project.metrics.slice(0, 2).map((m, idx) => (
                          <div key={idx} className="text-left">
                            <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                            <div className="text-base font-extrabold text-indigo-400 font-mono">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Technologies tags */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span
                            key={tech.name}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              darkMode 
                                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {tech.name}
                          </span>
                        ))}
                        {project.technologies.length > 5 && (
                          <span className="px-2 py-1 rounded-lg text-xs text-slate-400 font-mono">
                            +{project.technologies.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-200 cursor-pointer"
                    >
                      <span>Explore Case Study</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl border text-xs text-slate-400 hover:text-white transition-colors cursor-pointer ${
                            darkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl border text-xs text-slate-400 hover:text-white transition-colors cursor-pointer ${
                            darkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="View Repository"
                        >
                          <Code2 className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
