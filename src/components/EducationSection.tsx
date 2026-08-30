import React from 'react';
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';

interface EducationSectionProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ data, darkMode }) => {
  const { education, certificates } = data;

  return (
    <section 
      id="education" 
      className={`py-24 sm:py-32 transition-colors duration-300 scroll-mt-20 ${
        darkMode ? 'bg-slate-900/40 border-y border-slate-800/80' : 'bg-slate-50/60 border-y border-slate-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic & Credentials</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Education & Certifications
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Formal computer science foundations paired with continuous industry-standard certifications.
          </p>
        </div>

        {/* Two Column Grid: Education History & Professional Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Education */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className={`text-2xl font-bold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Academic Background
              </h3>
            </div>

            <div className="space-y-6">
              {education.length === 0 ? (
                <div className={`p-8 rounded-3xl border text-center ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
                }`}>
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 text-indigo-400 opacity-60" />
                  <p className="text-sm">No academic background listed yet.</p>
                </div>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 hover:-translate-y-1 ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {edu.degree}
                        </h4>
                        <p className={`text-sm font-semibold ${
                          darkMode ? 'text-indigo-400' : 'text-indigo-600'
                        }`}>
                          {edu.institution}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {edu.fieldOfStudy}
                        </p>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          {edu.startYear} – {edu.endYear}
                        </span>
                        {edu.grade && edu.grade.trim() !== '' && (
                          <p className="text-xs font-semibold text-emerald-500">
                            {edu.grade}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className={`mt-4 text-sm leading-relaxed ${
                      darkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {edu.description}
                    </p>

                    {/* Honors / Distinctions */}
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
                        {edu.honors.map((honor, hIdx) => (
                          <span
                            key={hIdx}
                            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                              darkMode
                                ? 'bg-slate-800/60 border-slate-700/80 text-amber-300'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {honor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Verified Certifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className={`text-2xl font-bold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Verified Certifications
              </h3>
            </div>

            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className={`p-8 rounded-3xl border text-center ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
                }`}>
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-amber-400 opacity-60" />
                  <p className="text-sm">No certifications listed yet.</p>
                </div>
              ) : (
                certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 ${
                      darkMode
                        ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0 flex items-center justify-center mt-0.5">
                        <Award className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h4 className={`text-sm font-bold leading-snug ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {cert.title}
                        </h4>
                        <p className={`text-xs font-medium ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Issued by <span className="text-indigo-500 font-semibold">{cert.issuer}</span>
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
                          <span>Issued: {cert.issueDate}</span>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                            >
                              <span>Verify Credential</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
