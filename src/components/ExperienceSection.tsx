import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Award, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2
} from 'lucide-react';
import { PortfolioData, ExperienceItem } from '../types/portfolio';

interface ExperienceSectionProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ data, darkMode }) => {
  const { experiences } = data;
  const [expandedId, setExpandedId] = useState<string | null>(experiences[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <section id="experience" className="py-24 sm:py-32 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career History</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Professional Work Experience
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            A track record of engineering leadership, cloud scalability, and delivering critical software infrastructure.
          </p>
        </div>

        {/* Timeline Container or Empty State */}
        {experiences.length === 0 ? (
          <div className={`max-w-xl mx-auto text-center p-12 rounded-3xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
          }`}>
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-indigo-400 opacity-60" />
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              No Experience Listed
            </h3>
            <p className="text-sm leading-relaxed">
              No career positions have been added yet. Add positions using the CMS Studio.
            </p>
          </div>
        ) : (
          <div className="relative max-w-4xl mx-auto">
            
            {/* Vertical Central Line */}
            <div className={`hidden md:block absolute left-8 top-6 bottom-6 w-0.5 ${
              darkMode ? 'bg-slate-800' : 'bg-slate-200'
            }`} />

            <div className="space-y-8">
              {experiences.map((exp, index) => {
                const isExpanded = expandedId === exp.id || expandedId === null; // expanded by default or targeted

                return (
                  <div 
                    key={exp.id} 
                    id={`experience-item-${exp.id}`}
                    className="relative md:pl-20 transition-all duration-300"
                  >
                  {/* Timeline Dot with Year Icon */}
                  <div className={`hidden md:flex absolute left-5 top-7 -translate-x-1/2 w-6 h-6 rounded-full border-4 items-center justify-center transition-all ${
                    exp.current
                      ? 'border-indigo-600 bg-white ring-4 ring-indigo-500/20 shadow-md'
                      : darkMode
                        ? 'border-slate-700 bg-slate-900'
                        : 'border-slate-300 bg-white'
                  }`}>
                    {exp.current && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>

                  {/* Experience Card */}
                  <div 
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                      darkMode
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Card Header Top */}
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Company Info & Role */}
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl overflow-hidden border shrink-0 flex items-center justify-center ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                          }`}>
                            {exp.logoUrl ? (
                              <img 
                                src={exp.logoUrl} 
                                alt={exp.company} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Building2 className="w-7 h-7 text-indigo-500" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className={`text-xl font-bold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {exp.role}
                              </h3>
                              {exp.current && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  Current Role
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                              {exp.companyUrl ? (
                                <a 
                                  href={exp.companyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1 hover:underline ${
                                    darkMode ? 'text-indigo-400 font-semibold' : 'text-indigo-600 font-semibold'
                                  }`}
                                >
                                  <span>{exp.company}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className={darkMode ? 'text-indigo-400 font-semibold' : 'text-indigo-600 font-semibold'}>
                                  {exp.company}
                                </span>
                              )}
                              <span className="text-slate-400">•</span>
                              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                                {exp.employmentType || 'Full-time'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date & Location Badges */}
                        <div className="flex flex-row sm:flex-col sm:items-end gap-2 text-xs">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border ${
                            darkMode 
                              ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                          </div>

                          {(exp.location || exp.address) && (
                            <div className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{exp.location || exp.address}</span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Summary */}
                      {exp.summary && (
                        <p className={`mt-5 text-sm sm:text-base leading-relaxed ${
                          darkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {exp.summary}
                        </p>
                      )}

                      {/* Responsibilities & Achievements */}
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                        
                        {/* Responsibilities */}
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="space-y-3">
                            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Key Responsibilities</span>
                            </h4>
                            <ul className="space-y-2">
                              {exp.responsibilities.map((resp, rIdx) => (
                                <li key={rIdx} className="text-xs sm:text-sm text-slate-400 flex items-start gap-2">
                                  <span className="text-indigo-500 shrink-0 font-bold">•</span>
                                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Achievements */}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="space-y-3">
                            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              darkMode ? 'text-amber-400' : 'text-amber-700'
                            }`}>
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Measurable Impact</span>
                            </h4>
                            <ul className="space-y-2">
                              {exp.achievements.map((ach, aIdx) => (
                                <li key={aIdx} className="text-xs sm:text-sm text-slate-400 flex items-start gap-2">
                                  <span className="text-amber-500 shrink-0 font-bold">★</span>
                                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{ach}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>

                      {/* Tech Stack Chips */}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-800/40 flex flex-wrap items-center gap-1.5">
                          <span className={`text-xs font-semibold mr-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tech Stack:
                          </span>
                          {exp.technologies.map((tech, tIdx) => (
                            <span 
                              key={tIdx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                darkMode 
                                  ? 'bg-slate-800/60 border-slate-700 text-slate-300' 
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
        )}

      </div>
    </section>
  );
};
