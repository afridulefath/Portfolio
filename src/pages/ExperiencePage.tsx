import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { ExperienceSection } from '../components/ExperienceSection';
import { SeoHead } from '../components/SeoHead';

interface ExperiencePageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Work Experience & Career History | ${data.personal.fullName}`}
        description={`Track record and career timeline of ${data.personal.fullName} - ${data.personal.designation}. Companies, responsibilities, and major achievements.`}
        canonicalPath="/experience"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Experience', url: '/experience' },
        ]}
      />
      <ExperienceSection data={data} darkMode={darkMode} />
    </div>
  );
};
