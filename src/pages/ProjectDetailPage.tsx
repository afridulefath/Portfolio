import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Code2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  Target, 
  AlertCircle, 
  Zap, 
  Trophy, 
  Star, 
  Sparkles, 
  Layers, 
  Share2, 
  Eye, 
  Building2, 
  Globe, 
  ChevronRight,
  Sliders
} from 'lucide-react';
import { ProjectItem } from '../types/portfolio';
import { AnalyticsService } from '../services/analyticsService';

interface ProjectDetailPageProps {
  project: ProjectItem;
  allProjects: ProjectItem[];
  darkMode: boolean;
  onBack: () => void;
  onSelectProject: (proj: ProjectItem) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  allProjects = [],
  darkMode,
  onBack,
  onSelectProject,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track Pageview in Analytics
    AnalyticsService.trackPageView(
      `/project/${project.slug || project.id}`,
      `${project.title} | Case Study`,
      { projectId: project.slug || project.id }
    );
  }, [project]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Find related projects
  const relatedProjects = allProjects.filter(p => p.id !== project.id).slice(0, 2);

  // Check if there is a before/after gallery item
  const beforeAfterItem = project.gallery?.find(g => g.type === 'before_after');

  return (
    <div className={`min-h-screen py-10 transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Share Case Study"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Live Project</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Hero Section Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-slate-800 bg-slate-950 aspect-21/9 max-h-[460px] w-full">
          <img
            src={project.bannerUrl || project.thumbnailUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {project.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {project.status || 'Completed'}
              </span>
              {project.duration && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {project.duration}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-sm sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                {project.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Key Metrics Strip */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {project.metrics.map((m, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-3xl border transition-all ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="text-xs text-slate-400 font-semibold mb-1">{m.label}</div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono tracking-tight">{m.value}</div>
                {m.description && (
                  <div className="text-[11px] text-slate-400 mt-1">{m.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left 2 Cols: Main Narrative */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview & Summary */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <span>Executive Summary & Overview</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* My Role & Responsibilities */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>My Role: <strong className="text-emerald-400">{project.myRole}</strong></span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">Primary leadership responsibilities and core contributions</p>

              {project.roleResponsibilities && project.roleResponsibilities.length > 0 ? (
                <ul className="space-y-2.5">
                  {project.roleResponsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Spearheaded the technical direction and delivery execution for this project.</p>
              )}
            </div>

            {/* Objectives, Challenges & Solutions */}
            <div className="space-y-6">
              {/* Objectives */}
              {project.objectives && project.objectives.length > 0 && (
                <div className={`p-6 sm:p-8 rounded-3xl border ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-sky-400" />
                    <span>Project Objectives</span>
                  </h3>
                  <ul className="space-y-2">
                    {project.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0"></span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges & Solutions */}
              {((project.challenges && project.challenges.length > 0) || (project.solutions && project.solutions.length > 0)) && (
                <div className={`p-6 sm:p-8 rounded-3xl border ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Architectural Challenges & Engineered Solutions</span>
                  </h3>

                  <div className="space-y-4">
                    {project.challenges && project.challenges.map((ch, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1.5">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Challenge {i + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300">{ch}</p>
                        {project.solutions && project.solutions[i] && (
                          <div className="pt-2 mt-2 border-t border-amber-500/10 text-xs sm:text-sm text-emerald-400">
                            <strong>Engineered Solution:</strong> {project.solutions[i]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Achievements */}
              {project.keyAchievements && project.keyAchievements.length > 0 && (
                <div className={`p-6 sm:p-8 rounded-3xl border ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Key Achievements & Milestones</span>
                  </h3>
                  <div className="space-y-2">
                    {project.keyAchievements.map((ach, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Before & After Architecture Slider (if available) */}
            {beforeAfterItem && beforeAfterItem.beforeImageUrl && beforeAfterItem.afterImageUrl && (
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Interactive Before / After System Comparison</span>
                  </h3>
                  <span className="text-xs text-slate-400">Slide to compare</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{beforeAfterItem.caption}</p>

                <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden select-none border border-slate-800 bg-black">
                  {/* After Image (Full background) */}
                  <img
                    src={beforeAfterItem.afterImageUrl}
                    alt="After Architecture"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/80 backdrop-blur-md text-white text-[11px] font-bold">
                    Optimized After
                  </div>

                  {/* Before Image (Clipped by slider position) */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={beforeAfterItem.beforeImageUrl}
                      alt="Before Architecture"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%' }}
                    />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold">
                      Legacy Before
                    </div>
                  </div>

                  {/* Divider Handle */}
                  <div
                    className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center text-xs font-bold shadow-md">
                      ↔
                    </div>
                  </div>

                  {/* Range Slider for Accessible Interaction */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                    aria-label="Before and after slider"
                  />
                </div>
              </div>
            )}

            {/* Gallery Images Grid */}
            {project.gallery && project.gallery.length > 0 && (
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Project Screenshots & Visual Artifacts</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedGalleryImage(item.url)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-800 cursor-pointer aspect-video bg-slate-950"
                    >
                      <img
                        src={item.url}
                        alt={item.caption || 'Project visual'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-[11px] text-slate-300">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Col: Sidebar metadata */}
          <div className="space-y-6">
            
            {/* Client Card */}
            {project.client && (
              <div className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Client & Organization</span>
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="font-extrabold text-base">{project.client.company}</div>
                  {project.client.name && (
                    <div className="text-slate-400">Stakeholder: <strong className="text-slate-200">{project.client.name}</strong></div>
                  )}
                  {project.client.industry && (
                    <div className="text-slate-400">Industry: <span className="text-slate-200">{project.client.industry}</span></div>
                  )}
                  {project.client.country && (
                    <div className="text-slate-400">Region: <span className="text-slate-200">{project.client.country}</span></div>
                  )}
                  {project.client.website && (
                    <a
                      href={project.client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:underline pt-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{project.client.website.replace('https://', '')}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Technologies Stack */}
            {project.technologies && project.technologies.length > 0 && (
              <div className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Technologies & Stack</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <div
                      key={t.name}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Testimonial */}
            {project.testimonial && (
              <div className={`p-6 rounded-3xl border relative overflow-hidden ${
                darkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'
              }`}>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(project.testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-300 italic mb-4 leading-relaxed">
                  "{project.testimonial.comment}"
                </blockquote>
                <div className="flex items-center gap-3">
                  {project.testimonial.clientPhotoUrl ? (
                    <img
                      src={project.testimonial.clientPhotoUrl}
                      alt={project.testimonial.clientName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-indigo-400/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {project.testimonial.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold">{project.testimonial.clientName}</div>
                    <div className="text-[11px] text-slate-400">
                      {project.testimonial.clientRole}, {project.testimonial.clientCompany}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* External Links Card */}
            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Project Repositories & Demos
              </h3>
              <div className="space-y-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Production Website</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      <span>GitHub Source Code</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal for viewing high-res gallery image */}
        {selectedGalleryImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] relative">
              <img
                src={selectedGalleryImage}
                alt="Enlarged visual"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-slate-950/80 text-white text-xs font-bold cursor-pointer"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
