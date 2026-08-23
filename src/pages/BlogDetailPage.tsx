import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Tag, 
  Check, 
  BookOpen, 
  Sparkles, 
  User, 
  Layers, 
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { BlogPost } from '../types/portfolio';
import { AnalyticsService } from '../services/analyticsService';

interface BlogDetailPageProps {
  blog: BlogPost;
  allBlogs: BlogPost[];
  darkMode: boolean;
  onBack: () => void;
  onSelectBlog: (blog: BlogPost) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  blog,
  allBlogs = [],
  darkMode,
  onBack,
  onSelectBlog,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track Pageview in Analytics
    AnalyticsService.trackPageView(
      `/blog/${blog.slug || blog.id}`,
      `${blog.title} | Blog`,
      { blogSlug: blog.slug || blog.id }
    );
  }, [blog]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Read "${blog.title}" by ${blog.authorName}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  // Related posts
  const relatedPosts = allBlogs.filter(b => b.id !== blog.id).slice(0, 2);

  return (
    <div className={`min-h-screen py-10 transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Share Row */}
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
            <span>Back to All Articles</span>
          </button>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareTwitter}
              className={`p-2.5 rounded-2xl border text-xs font-semibold hover:text-sky-400 transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
              title="Share on X / Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleShareLinkedIn}
              className={`p-2.5 rounded-2xl border text-xs font-semibold hover:text-blue-500 transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
              title="Share on LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.88a1.62 1.62 0 1 0 1.62 1.62 1.62 1.62 0 0 0-1.62-1.62z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
            <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {blog.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTimeMinutes || 5} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              {blog.views || 420} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            {blog.title}
          </h1>

          {blog.subtitle && (
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed italic mb-6">
              {blog.subtitle}
            </p>
          )}

          {/* Author Card */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            {blog.authorAvatarUrl ? (
              <img
                src={blog.authorAvatarUrl}
                alt={blog.authorName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-sky-400/40"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm">
                {blog.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-sm font-bold">{blog.authorName}</div>
              <div className="text-xs text-slate-400">{blog.authorRole || 'Author & Technical Lead'}</div>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-slate-800 bg-slate-950 aspect-16/9 w-full">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Markdown Body Content */}
        <div className={`p-6 sm:p-10 rounded-3xl border mb-10 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="markdown-body prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-4 text-sm sm:text-base">
            <Markdown>{blog.content}</Markdown>
          </div>
        </div>

        {/* Gallery Images (if any) */}
        {blog.galleryImages && blog.galleryImages.length > 0 && (
          <div className={`p-6 sm:p-8 rounded-3xl border mb-10 ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Supplementary Architecture Diagrams</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blog.galleryImages.map((img) => (
                <div key={img.id} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={img.url}
                    alt={img.caption || 'Diagram'}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-video object-cover"
                  />
                  {img.caption && (
                    <div className="p-2.5 text-[11px] text-slate-400 bg-slate-950/80 border-t border-slate-800">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-sky-400' : 'bg-slate-100 border-slate-200 text-sky-700'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>More Articles & Insights</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectBlog(rel)}
                  className={`p-5 rounded-3xl border cursor-pointer group transition-all ${
                    darkMode 
                      ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50' 
                      : 'bg-white border-slate-200 hover:border-sky-400 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-bold text-sky-400 uppercase mb-2">{rel.category}</div>
                  <h4 className="text-base font-bold mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {rel.summary}
                  </p>
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
