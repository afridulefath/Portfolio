import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioData, BlogPost } from '../types/portfolio';
import { BlogsSection } from '../components/BlogsSection';
import { BlogDetailPage } from './BlogDetailPage';
import { SeoHead } from '../components/SeoHead';
import { generateBlogPostingSchema, getBaseUrl } from '../utils/seoUtils';

interface BlogsPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ data, darkMode }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const blogs = data.blogs || [];

  // Find active blog by slug or id
  const activeBlog = slug
    ? blogs.find(b => b.slug === slug || b.id === slug) || null
    : null;

  const handleSelectBlog = (b: BlogPost) => {
    navigate(`/blog/${b.slug || b.id}`);
  };

  const handleBackToBlogs = () => {
    navigate('/blogs');
  };

  if (activeBlog) {
    const siteUrl = getBaseUrl(data);
    const blogSchema = generateBlogPostingSchema(activeBlog, data.personal.fullName, siteUrl);

    return (
      <div className="pt-24 pb-16">
        <SeoHead
          data={data}
          title={activeBlog.seoTitle || `${activeBlog.title} | Articles & Insights`}
          description={activeBlog.seoDescription || activeBlog.summary}
          keywords={activeBlog.seoKeywords || activeBlog.tags || ['Engineering', 'Architecture', 'Blog']}
          ogImage={activeBlog.ogImageUrl || activeBlog.coverImageUrl}
          canonicalPath={`/blog/${activeBlog.slug || activeBlog.id}`}
          type="article"
          customSchema={blogSchema}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: 'Blogs & Articles', url: '/blogs' },
            { name: activeBlog.title, url: `/blog/${activeBlog.slug || activeBlog.id}` },
          ]}
        />
        <BlogDetailPage
          blog={activeBlog}
          allBlogs={blogs}
          darkMode={darkMode}
          onBack={handleBackToBlogs}
          onSelectBlog={handleSelectBlog}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Articles, Insights & Technical Essays | ${data.personal.fullName}`}
        description={`Read in-depth technical guides, architecture case studies, and engineering leadership essays by ${data.personal.fullName}.`}
        canonicalPath="/blogs"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blogs & Articles', url: '/blogs' },
        ]}
      />
      <BlogsSection
        blogs={blogs}
        darkMode={darkMode}
        onSelectBlog={handleSelectBlog}
      />
    </div>
  );
};
