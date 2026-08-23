import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { ExperienceSection } from '../components/ExperienceSection';

interface ExperiencePageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <ExperienceSection data={data} darkMode={darkMode} />
    </div>
  );
};
