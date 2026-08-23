import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Award, 
  Cpu, 
  Filter,
  Flame
} from 'lucide-react';
import { PortfolioData, SkillItem } from '../types/portfolio';

interface AboutSectionProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ data, darkMode }) => {
  const { about, skills, personal } = data;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Backend', 'Cloud & DevOps', 'Architecture & Design', 'Management & Tools'];

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const renderPillarIcon = (iconName: string) => {
    const cls = "w-6 h-6 text-indigo-500";
    switch (iconName.toLowerCase()) {
      case 'shieldcheck':
        return <ShieldCheck className={cls} />;
      case 'zap':
        return <Zap className={cls} />;
      case 'sparkles':
        return <Sparkles className={cls} />;
      case 'users':
        return <Users className={cls} />;
      default:
        return <Cpu className={cls} />;
    }
  };

  return (
    <section 
      id="about" 
      className={`py-24 sm:py-32 transition-colors duration-300 scroll-mt-20 ${
        darkMode ? 'bg-slate-900/40 border-y border-slate-800/80' : 'bg-slate-50/60 border-y border-slate-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About & Expertise</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Engineering Passion, Architectural Precision
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {about.storySummary}
          </p>
        </div>

        {/* Top Grid: Bio Narrative & Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Detailed Biography & Key Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`p-8 rounded-3xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Biography & Approach
              </h3>
              
              <div className={`space-y-4 text-base leading-relaxed whitespace-pre-line ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {about.biography}
              </div>

              {/* Highlights List */}
              {about.highlights && about.highlights.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                    darkMode ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    Key Career Highlights
                  </h4>
                  <ul className="space-y-3">
                    {about.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Pillars & Guiding Principles */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold tracking-tight ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {about.philosophyTitle}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {about.philosophyDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {about.corePillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                    darkMode
                      ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    {renderPillarIcon(pillar.icon)}
                  </div>
                  <h4 className={`text-base font-bold mb-2 ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    {pillar.title}
                  </h4>
                  <p className={`text-xs sm:text-sm leading-relaxed ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Skills Section with Category Tabs & Proficiency Bars */}
        <div className="space-y-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Technical Skills & Proficiency
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Comprehensive breakdown of technical capabilities across platforms and tooling.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl border bg-slate-900/10 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : darkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  darkMode
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${
                      darkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {skill.name}
                    </span>
                    {skill.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Flame className="w-3 h-3" />
                        Core
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-indigo-500">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{skill.category}</span>
                  <span>{skill.level >= 90 ? 'Mastery' : skill.level >= 80 ? 'Advanced' : 'Proficient'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
