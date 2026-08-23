import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { EducationSection } from '../components/EducationSection';

interface EducationPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const EducationPage: React.FC<EducationPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <EducationSection data={data} darkMode={darkMode} />
    </div>
  );
};
