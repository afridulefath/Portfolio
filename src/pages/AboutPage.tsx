import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { AboutSection } from '../components/AboutSection';
import { SeoHead } from '../components/SeoHead';

interface AboutPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const AboutPage: React.FC<AboutPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`About ${data.personal.fullName} - Biography & Professional Philosophy`}
        description={data.about.storySummary || data.personal.shortBio}
        canonicalPath="/about"
        type="profile"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      <AboutSection data={data} darkMode={darkMode} />
    </div>
  );
};
