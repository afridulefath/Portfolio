import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioData, ProjectItem } from '../types/portfolio';
import { ProjectsSection } from '../components/ProjectsSection';
import { ProjectDetailPage } from './ProjectDetailPage';

interface ProjectsPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ data, darkMode }) => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const projects = data.projects || [];

  if (selectedProject) {
    return (
      <ProjectDetailPage
        project={selectedProject}
        allProjects={projects}
        darkMode={darkMode}
        onBack={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />
    );
  }

  return (
    <div className="pt-24 pb-16">
      <ProjectsSection
        projects={projects}
        darkMode={darkMode}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />
    </div>
  );
};
