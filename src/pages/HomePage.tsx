import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Camera, 
  Mail, 
  UserCheck, 
  CheckCircle2, 
  Award,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  BookOpen,
  Layers,
  Clock,
  Eye,
  Star
} from 'lucide-react';
import { PortfolioData, GalleryItem } from '../types/portfolio';
import { HeroSection } from '../components/HeroSection';
import { SeoHead } from '../components/SeoHead';

interface HomePageProps {
  data: PortfolioData;
  darkMode: boolean;
  onOpenCms: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ data, darkMode, onOpenCms }) => {
  const { about, experiences, education, certificates, skills, gallery, contact, personal, projects = [], blogs = [] } = data;

  // Selected representative items for preview
  const previewExperiences = experiences.slice(0, 2);
  const previewEducation = education.slice(0, 2);
  const previewCerts = certificates.slice(0, 3);
  const previewSkills = skills.slice(0, 6);
  const previewGallery = gallery.slice(0, 4);
  const featuredProjects = projects.filter(p => p.featured).slice(0, 2).concat(projects.slice(0, 2)).slice(0, 2);
  const featuredBlogs = blogs.filter(b => b.status === 'published' || !b.status).slice(0, 3);

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* Dynamic SEO & Schema Engine */}
      <SeoHead
        data={data}
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', url: '/' }]}
      />

      {/* 1. Hero / Intro Area */}
      <HeroSection data={data} darkMode={darkMode} onOpenCms={onOpenCms} />

      {/* 2. About Preview */}
      <section id="home-about-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl border backdrop-blur-md transition-all ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-800 shadow-xl' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b pb-6 border-slate-800/40 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
                <UserCheck className="w-4 h-4" />
                <span>Executive Overview</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {about.storyTitle || about.title || 'About & Leadership Background'}
              </h2>
            </div>

            <Link
              id="home-about-see-more"
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 group w-fit cursor-pointer"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className={`text-base sm:text-lg leading-relaxed ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {about.storySummary || about.summary || personal.bio}
              </p>

              {about.highlights && about.highlights.length > 0 && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {about.highlights.slice(0, 4).map((highlight, idx) => (
                    <div 
                      key={`about-highlight-${idx}`}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium ${
                        darkMode 
                          ? 'bg-slate-850/60 border-slate-800 text-slate-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className={`p-6 rounded-2xl border ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Expertise</span>
                  <span className="text-xs text-indigo-400 font-semibold">{skills.length} competencies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewSkills.map((s, sIdx) => (
                    <span
                      key={s.name || `skill-${sIdx}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        darkMode
                          ? 'bg-slate-900 border-slate-750 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                      }`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/40 dark:border-slate-800 text-center">
                  <Link to="/about" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                    Explore all skills & full biography <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Experience Preview */}
      <section id="home-experience-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
              <Briefcase className="w-4 h-4" />
              <span>Career Highlights</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Professional Experience
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Featured leadership and engineering milestones
            </p>
          </div>

          <Link
            id="home-experience-see-more"
            to="/experience"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 group w-fit cursor-pointer"
          >
            <span>See More Experience</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previewExperiences.map((exp, expIdx) => (
            <div
              key={exp.id || `exp-preview-${expIdx}`}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all hover:border-indigo-500/50 ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    exp.isCurrent
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {exp.isCurrent ? 'Current Role' : `${exp.startDate} - ${exp.endDate}`}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {exp.location}
                  </span>
                </div>

                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {exp.position || exp.role}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
                  <Building className="w-4 h-4" />
                  <span>{exp.company}</span>
                </div>

                <p className={`text-sm line-clamp-3 leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {exp.description || exp.summary}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-800/40 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {exp.technologies?.slice(0, 3).map((tech, i) => (
                    <span key={`exp-${exp.id || expIdx}-tech-${i}`} className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800/60 text-slate-300 border border-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
                <Link to="/experience" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Education & Certification Preview */}
      <section id="home-education-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl border ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
                <GraduationCap className="w-4 h-4" />
                <span>Academic & Credentials</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Education & Certifications
              </h2>
            </div>

            <Link
              id="home-education-see-more"
              to="/education"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 group w-fit cursor-pointer"
            >
              <span>See More Education</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Degree Card */}
            {previewEducation.map((edu, eduIdx) => (
              <div
                key={edu.id || `edu-preview-${eduIdx}`}
                className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-400">{edu.fieldOfStudy}</span>
                  <span className="text-xs text-slate-400">{edu.startYear} - {edu.endYear}</span>
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {edu.degree}
                </h3>
                <p className="text-sm text-slate-400 font-medium">{edu.institution}</p>
                {edu.grade && (
                  <p className="text-xs text-emerald-400 mt-2 font-medium">Result/Honors: {edu.grade}</p>
                )}
              </div>
            ))}
          </div>

          {/* Certifications row */}
          {previewCerts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-800/40 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Certifications</span>
                <Link to="/education" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  View all {certificates.length} certificates →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {previewCerts.map((cert, cIdx) => (
                  <div
                    key={cert.id || `cert-preview-${cIdx}`}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <p className={`text-xs font-bold truncate ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {cert.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Featured Projects & Case Studies */}
      {featuredProjects.length > 0 && (
        <section id="home-projects-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
                <Briefcase className="w-4 h-4" />
                <span>Selected Works & Case Studies</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Featured Architectural Solutions
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Production-grade platforms and systems engineered for extreme scale.
              </p>
            </div>

            <Link
              id="home-projects-see-more"
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 group w-fit cursor-pointer"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((proj) => (
              <Link
                key={proj.id}
                to="/projects"
                className={`group rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl shadow-xs'
                }`}
              >
                <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                      {proj.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-400">
                      Role: <strong className="text-slate-200">{proj.myRole}</strong>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Featured Insights & Articles */}
      {featuredBlogs.length > 0 && (
        <section id="home-blogs-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-500 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Publications & Insights</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Latest Engineering Articles
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Thought leadership, architectural blueprints, and deep dives.
              </p>
            </div>

            <Link
              id="home-blogs-see-more"
              to="/blogs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-md shadow-sky-600/20 group w-fit cursor-pointer"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBlogs.map((b) => (
              <Link
                key={b.id}
                to="/blogs"
                className={`group rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 hover:shadow-xl' 
                    : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-lg shadow-xs'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={b.coverImageUrl}
                    alt={b.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-sky-300 border border-sky-500/30">
                      {b.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span>{new Date(b.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{b.readTimeMinutes || 5} min read</span>
                    </div>

                    <h4 className="text-base font-bold tracking-tight mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
                      {b.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{b.authorName}</span>
                    <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. Gallery Preview */}
      <section id="home-gallery-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
              <Camera className="w-4 h-4" />
              <span>Media & Showcase</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Visual Gallery Preview
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Events, speaking engagements, and milestone snapshots
            </p>
          </div>

          <Link
            id="home-gallery-see-more"
            to="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 group w-fit cursor-pointer"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {previewGallery.map((item, gIdx) => (
            <Link
              key={item.id || `gal-preview-${gIdx}`}
              to="/gallery"
              className={`group relative rounded-2xl overflow-hidden aspect-4/3 border transition-all duration-300 hover:scale-[1.02] ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                <span className="text-[11px] font-semibold text-indigo-400">{item.category}</span>
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Contact Preview / CTA Section */}
      <section id="home-contact-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-14 rounded-3xl border relative overflow-hidden text-center sm:text-left ${
          darkMode
            ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-900/50 shadow-2xl'
            : 'bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-indigo-200 shadow-md'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
                <Mail className="w-4 h-4" />
                <span>Let&apos;s Build Something Great</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {contact.title || 'Ready to collaborate or need expert advice?'}
              </h2>
              <p className={`text-base max-w-2xl ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {contact.subtitle || 'Feel free to reach out for advisory, project collaboration, speaking opportunities, or executive leadership.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-400">
                <span>📍 {contact.location || personal.location}</span>
                <span>•</span>
                <span>📧 {contact.email || personal.email}</span>
                {contact.phone && (
                  <>
                    <span>•</span>
                    <span>📞 {contact.phone}</span>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center lg:items-end">
              <Link
                id="home-contact-cta-btn"
                to="/contact"
                className="px-7 py-4 rounded-xl font-bold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Contact Me Directly</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className={`px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all text-center ${
                  darkMode 
                    ? 'border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Read Background First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
