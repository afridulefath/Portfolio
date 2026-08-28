import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { EducationSection } from '../components/EducationSection';
import { SeoHead } from '../components/SeoHead';

interface EducationPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const EducationPage: React.FC<EducationPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Education & Professional Certifications | ${data.personal.fullName}`}
        description={`Academic degrees, honors, and verified industry credentials earned by ${data.personal.fullName}.`}
        canonicalPath="/education"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Education & Certifications', url: '/education' },
        ]}
      />
      <EducationSection data={data} darkMode={darkMode} />
    </div>
  );
};
