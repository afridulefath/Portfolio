import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Eye, 
  Clock, 
  Calendar, 
  Save, 
  Image, 
  FileText, 
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BlogPost, BlogImage } from '../types/portfolio';
import { ImageUploader } from './ImageUploader';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  onChange: (blogs: BlogPost[]) => void;
  darkMode: boolean;
}

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({
  blogs = [],
  onChange,
  darkMode,
}) => {
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [previewMarkdown, setPreviewMarkdown] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'gallery' | 'seo'>('content');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
  };

  const handleStartCreate = () => {
    const newId = 'blog-' + Date.now();
    const newBlog: BlogPost = {
      id: newId,
      slug: 'new-article-' + Date.now(),
      title: 'New Technical Article Title',
      subtitle: 'Insightful subtitle explaining the article scope',
      summary: 'Short summary of the article for cards and meta descriptions.',
      content: `## Introduction to the Topic

Start writing your technical article or insights here using Markdown...

### Key Architectural Concepts
* Concept 1: Scalability & Performance
* Concept 2: High Availability Design

\`\`\`typescript
// Code snippet example
export const sampleFunction = () => {
  console.log("High performance execution");
};
\`\`\`

### Summary & Takeaways
Summarize key takeaways for readers.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      category: 'Cloud & Architecture',
      tags: ['Engineering', 'Architecture', 'Tech'],
      authorName: 'Alex Vance',
      authorRole: 'Senior Solutions Architect',
      authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'published',
      featured: false,
      views: 1,
      readTimeMinutes: 5,
    };
    setEditingBlog(newBlog);
    setIsCreating(true);
    setActiveTab('content');
  };

  const handleSaveBlog = () => {
    if (!editingBlog) return;

    const cleanTitle = editingBlog.title?.trim() || 'Untitled Article';
    const finalSlug = (editingBlog.slug?.trim() || generateSlug(cleanTitle));
    
    const blogToSave: BlogPost = {
      ...editingBlog,
      id: editingBlog.id || ('blog-' + Date.now()),
      title: cleanTitle,
      slug: finalSlug,
      subtitle: editingBlog.subtitle?.trim() || '',
      summary: editingBlog.summary?.trim() || '',
      content: editingBlog.content || '',
      category: editingBlog.category?.trim() || 'Engineering',
      tags: editingBlog.tags && editingBlog.tags.length > 0 ? editingBlog.tags : ['Engineering'],
      publishDate: editingBlog.publishDate || new Date().toISOString().split('T')[0],
      status: editingBlog.status || 'published',
      coverImageUrl: editingBlog.coverImageUrl || '',
      authorName: editingBlog.authorName?.trim() || 'Author',
      readTimeMinutes: Number(editingBlog.readTimeMinutes) || 5,
    };

    let updatedList: BlogPost[];
    if (isCreating) {
      updatedList = [blogToSave, ...blogs.filter(b => b.id !== blogToSave.id)];
    } else {
      const exists = blogs.some(b => b.id === blogToSave.id);
      if (exists) {
        updatedList = blogs.map(b => b.id === blogToSave.id ? blogToSave : b);
      } else {
        updatedList = [blogToSave, ...blogs];
      }
    }

    onChange(updatedList);
    setEditingBlog(null);
    setIsCreating(false);
    setSaveSuccessMsg('আর্টিকেল সফলভাবে সংরক্ষিত হয়েছে! / Article saved successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleDeleteBlog = (id: string) => {
    if (confirm('Are you sure you want to delete this article? / আপনি কি এই আর্টিকেল মুছে ফেলতে চান?')) {
      const updatedList = blogs.filter(b => b.id !== id);
      onChange(updatedList);
      if (editingBlog?.id === id) {
        setEditingBlog(null);
        setIsCreating(false);
      }
      setSaveSuccessMsg('আর্টিকেল মুছে ফেলা হয়েছে / Article deleted.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleToggleFeatured = (id: string) => {
    const updatedList = blogs.map(b => b.id === id ? { ...b, featured: !b.featured } : b);
    onChange(updatedList);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>Blog & Technical Articles Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Write, edit, schedule and manage articles with rich markdown, images, and SEO configuration.
          </p>
        </div>

        {!editingBlog && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* EDITING FORM */}
      {editingBlog ? (
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        } space-y-6`}>
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {isCreating ? 'Draft New Article' : 'Edit Article'}
              </span>
              <h4 className="text-lg font-bold">{editingBlog.title || 'Untitled Article'}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditingBlog(null); setIsCreating(false); }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200'
                } cursor-pointer`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Article</span>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
            {[
              { id: 'content', label: 'Article Content' },
              { id: 'metadata', label: 'Metadata & Author' },
              { id: 'gallery', label: 'Diagrams & Gallery' },
              { id: 'seo', label: 'SEO Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: ARTICLE CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Article Title</label>
                  <input
                    type="text"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Subtitle / Key Takeaway</label>
                <input
                  type="text"
                  value={editingBlog.subtitle || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, subtitle: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Article Summary</label>
                <textarea
                  rows={2}
                  value={editingBlog.summary}
                  onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Markdown Editor & Live Preview Switcher */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold">Rich Markdown Content</label>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewMarkdown(false)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        !previewMarkdown ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMarkdown(true)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        previewMarkdown ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {previewMarkdown ? (
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 min-h-[280px] max-h-[400px] overflow-y-auto">
                    <div className="markdown-body prose prose-invert text-xs text-slate-200">
                      <Markdown>{editingBlog.content}</Markdown>
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={editingBlog.content}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className={`w-full p-3 rounded-2xl text-xs font-mono border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: METADATA & AUTHOR */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={editingBlog.publishDate}
                    onChange={(e) => setEditingBlog({ ...editingBlog, publishDate: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2.5 ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <ImageUploader
                  label="আর্টিকেল কভার ছবি / Cover Image"
                  sublabel="ডিভাইস থেকে ফাইল নির্বাচন করুন অথবা ড্রপ করুন"
                  value={editingBlog.coverImageUrl}
                  onChange={(url) => setEditingBlog({ ...editingBlog, coverImageUrl: url })}
                  darkMode={darkMode}
                  aspectRatio="wide"
                />
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    কভার ছবি Alt Text (Google SEO ও স্ক্রিন রিডার)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Cloud Architecture and Microservices Pattern Overview"
                    value={editingBlog.coverImageAlt || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, coverImageAlt: e.target.value })}
                    className={`w-full p-2 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={(editingBlog.tags || []).join(', ')}
                  onChange={(e) => setEditingBlog({
                    ...editingBlog,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                  })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingBlog.authorName}
                    onChange={(e) => setEditingBlog({ ...editingBlog, authorName: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Author Role</label>
                  <input
                    type="text"
                    value={editingBlog.authorRole || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, authorRole: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Read Time (Minutes)</label>
                  <input
                    type="number"
                    value={editingBlog.readTimeMinutes || 5}
                    onChange={(e) => setEditingBlog({ ...editingBlog, readTimeMinutes: Number(e.target.value) })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-blog-check"
                  checked={editingBlog.featured}
                  onChange={(e) => setEditingBlog({ ...editingBlog, featured: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured-blog-check" className="text-xs font-semibold cursor-pointer">
                  Featured Top Hero Article
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY & DIAGRAMS */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Supplementary Architecture Diagrams</span>
                <button
                  type="button"
                  onClick={() => {
                    const newImg: BlogImage = {
                      id: 'bi-' + Date.now(),
                      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                      caption: 'System cluster diagram',
                      order: (editingBlog.galleryImages?.length || 0) + 1,
                    };
                    setEditingBlog({
                      ...editingBlog,
                      galleryImages: [...(editingBlog.galleryImages || []), newImg],
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Diagram</span>
                </button>
              </div>

              <div className="space-y-2">
                {(editingBlog.galleryImages || []).map((img, idx) => (
                  <div key={img.id} className="p-3 rounded-2xl border border-slate-800 space-y-2 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Diagram #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBlog({
                            ...editingBlog,
                            galleryImages: editingBlog.galleryImages?.filter(i => i.id !== img.id),
                          });
                        }}
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <ImageUploader
                        label="ডায়াগ্রাম / ছবি / Diagram Image"
                        sublabel="ডিভাইস থেকে ফাইল নির্বাচন করুন"
                        value={img.url}
                        onChange={(url) => {
                          const updated = [...editingBlog.galleryImages!];
                          updated[idx].url = url;
                          setEditingBlog({ ...editingBlog, galleryImages: updated });
                        }}
                        darkMode={darkMode}
                        aspectRatio="video"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Caption / Description</label>
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => {
                          const updated = [...editingBlog.galleryImages!];
                          updated[idx].caption = e.target.value;
                          setEditingBlog({ ...editingBlog, galleryImages: updated });
                        }}
                        className="w-full p-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">SEO Title (Search Engine Result Title)</label>
                  <input
                    type="text"
                    value={editingBlog.seoTitle || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, seoTitle: e.target.value })}
                    placeholder="Custom Meta Title for search engine listings"
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">URL Slug (/blog/your-slug)</label>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    placeholder="e.g. distributed-cloud-architecture"
                    className={`w-full p-2.5 rounded-xl text-xs border font-mono ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-sky-400' : 'bg-slate-50 border-slate-200 text-sky-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">SEO Meta Description (Google Search Result)</label>
                <textarea
                  rows={3}
                  value={editingBlog.seoDescription || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, seoDescription: e.target.value })}
                  placeholder="Meta description (150-160 characters)"
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Focus Keywords (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={editingBlog.seoKeywords?.join(', ') || ''}
                  onChange={(e) => setEditingBlog({
                    ...editingBlog,
                    seoKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                  placeholder="e.g. Cloud, Microservices, Event-Driven, System Architecture"
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <ImageUploader
                  label="সোশ্যাল শেয়ার ইমেজ / Open Graph Share Image"
                  sublabel="এই আর্টিকেলের লিংক শেয়ার করার সময় যে প্রিভিউ ছবি দেখাবে"
                  value={editingBlog.ogImageUrl || ''}
                  onChange={(url) => setEditingBlog({ ...editingBlog, ogImageUrl: url })}
                  darkMode={darkMode}
                  aspectRatio="landscape"
                />
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ARTICLES LIST VIEW */
        <div className="space-y-3">
          {blogs.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={b.coverImageUrl}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold truncate">{b.title}</h4>
                    {b.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      b.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {b.status || 'published'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{b.category}</span>
                    <span>•</span>
                    <span>{b.readTimeMinutes || 5} min read</span>
                    <span>•</span>
                    <span className="font-mono text-sky-400">{b.views || 250} views</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(b.id)}
                  title={b.featured ? 'Remove from Featured' : 'Mark as Featured'}
                  className={`p-2 rounded-xl border text-xs cursor-pointer ${
                    b.featured 
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                      : darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={b.featured ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={() => { setEditingBlog(b); setIsCreating(false); setActiveTab('content'); }}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 text-sky-400 cursor-pointer ${
                    darkMode ? 'bg-slate-950 border-slate-800 hover:border-sky-500/40' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Edit Article"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteBlog(b.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Article"
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
