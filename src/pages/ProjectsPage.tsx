import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioData, ProjectItem } from '../types/portfolio';
import { ProjectsSection } from '../components/ProjectsSection';
import { ProjectDetailPage } from './ProjectDetailPage';
import { SeoHead } from '../components/SeoHead';
import { generateProjectSchema, getBaseUrl } from '../utils/seoUtils';

interface ProjectsPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ data, darkMode }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const projects = data.projects || [];

  // Match project by slug or ID
  const activeProject = slug
    ? projects.find(p => p.slug === slug || p.id === slug) || null
    : null;

  const handleSelectProject = (proj: ProjectItem) => {
    navigate(`/project/${proj.slug || proj.id}`);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (activeProject) {
    const siteUrl = getBaseUrl(data);
    const projectSchema = generateProjectSchema(activeProject, data.personal.fullName, siteUrl);

    return (
      <div className="pt-24 pb-16">
        <SeoHead
          data={data}
          title={activeProject.seoTitle || `${activeProject.title} | Case Study`}
          description={activeProject.seoDescription || activeProject.summary}
          keywords={activeProject.seoKeywords || [activeProject.category, activeProject.title, 'Case Study']}
          ogImage={activeProject.ogImageUrl || activeProject.thumbnailUrl}
          canonicalPath={`/project/${activeProject.slug || activeProject.id}`}
          type="article"
          customSchema={projectSchema}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: 'Projects', url: '/projects' },
            { name: activeProject.title, url: `/project/${activeProject.slug || activeProject.id}` },
          ]}
        />
        <ProjectDetailPage
          project={activeProject}
          allProjects={projects}
          darkMode={darkMode}
          onBack={handleBackToProjects}
          onSelectProject={handleSelectProject}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Engineering Projects & Case Studies | ${data.personal.fullName}`}
        description={`Explore selected high-impact projects, full-stack systems, and client solutions architected by ${data.personal.fullName}.`}
        canonicalPath="/projects"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
        ]}
      />
      <ProjectsSection
        projects={projects}
        darkMode={darkMode}
        onSelectProject={handleSelectProject}
      />
    </div>
  );
};
