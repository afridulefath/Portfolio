import React, { useState } from 'react';
import { PortfolioData, BlogPost } from '../types/portfolio';
import { BlogsSection } from '../components/BlogsSection';
import { BlogDetailPage } from './BlogDetailPage';

interface BlogsPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ data, darkMode }) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const blogs = data.blogs || [];

  if (selectedBlog) {
    return (
      <BlogDetailPage
        blog={selectedBlog}
        allBlogs={blogs}
        darkMode={darkMode}
        onBack={() => setSelectedBlog(null)}
        onSelectBlog={(b) => setSelectedBlog(b)}
      />
    );
  }

  return (
    <div className="pt-24 pb-16">
      <BlogsSection
        blogs={blogs}
        darkMode={darkMode}
        onSelectBlog={(b) => setSelectedBlog(b)}
      />
    </div>
  );
};
