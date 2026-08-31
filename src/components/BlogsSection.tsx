import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  User, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { BlogPost, SectionHeaderConfig } from '../types/portfolio';

interface BlogsSectionProps {
  blogs: BlogPost[];
  darkMode: boolean;
  onSelectBlog: (blog: BlogPost) => void;
  headerConfig?: SectionHeaderConfig;
}

export const BlogsSection: React.FC<BlogsSectionProps> = ({
  blogs = [],
  darkMode,
  onSelectBlog,
  headerConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))];

  // Only published blogs on public view
  const publishedBlogs = blogs.filter(b => b.status === 'published' || !b.status);

  // Filter blogs
  const filteredBlogs = publishedBlogs.filter(b => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const featuredPost = filteredBlogs.find(b => b.featured) || filteredBlogs[0];
  const remainingBlogs = filteredBlogs.filter(b => b.id !== featuredPost?.id);

  return (
    <section id="blogs" className="py-16 md:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{headerConfig?.badge || 'Technical Articles & Thought Leadership'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {headerConfig?.title || 'Engineering & Leadership Insights'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              {headerConfig?.subtitle || 'Deep dives on distributed systems, multi-tenancy, high-throughput cloud architectures, and project execution frameworks.'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles or topics..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition-all outline-none ${
                darkMode 
                  ? 'bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-600 shadow-xs'
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
                  ? 'bg-sky-600 text-white shadow-xs'
                  : darkMode
                    ? 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredBlogs.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-slate-400 text-sm">No articles found matching your criteria.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-3 text-xs text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Featured Post Card (Prominent Banner) */}
            {featuredPost && (
              <div
                onClick={() => onSelectBlog(featuredPost)}
                className={`group rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 ${
                  darkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/5' 
                    : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-xl shadow-xs'
                }`}
              >
                <div className="lg:col-span-6 relative aspect-16/9 lg:aspect-auto h-full min-h-[260px] overflow-hidden bg-slate-950">
                  <img
                    src={featuredPost.coverImageUrl}
                    alt={featuredPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/90 text-white flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      Featured Article
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="font-bold text-sky-400 uppercase tracking-wider">{featuredPost.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readTimeMinutes || 5} min read
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featuredPost.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 group-hover:text-sky-400 transition-colors">
                      {featuredPost.title}
                    </h3>

                    <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                      {featuredPost.summary}
                    </p>

                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {featuredPost.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {featuredPost.authorAvatarUrl ? (
                        <img
                          src={featuredPost.authorAvatarUrl}
                          alt={featuredPost.authorName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-sky-400/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                          {featuredPost.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold">{featuredPost.authorName}</div>
                        <div className="text-[10px] text-slate-400">{featuredPost.authorRole || 'Author'}</div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Grid for Remaining Posts */}
            {remainingBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {remainingBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => onSelectBlog(blog)}
                    className={`group rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      darkMode 
                        ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 hover:shadow-xl' 
                        : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-lg shadow-xs'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-sky-300 border border-sky-500/30">
                          {blog.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 text-[10px]">
                        <Eye className="w-3 h-3 text-sky-400" />
                        <span>{blog.views || 320}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                          <span>{new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{blog.readTimeMinutes || 5} min read</span>
                        </div>

                        <h4 className="text-base font-bold tracking-tight mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
                          {blog.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                          {blog.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-400">{blog.authorName}</div>
                        <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
