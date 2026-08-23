import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { AboutSection } from '../components/AboutSection';

interface AboutPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const AboutPage: React.FC<AboutPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <AboutSection data={data} darkMode={darkMode} />
    </div>
  );
};
