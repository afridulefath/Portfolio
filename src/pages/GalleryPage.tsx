import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { GallerySection } from '../components/GallerySection';
import { SeoHead } from '../components/SeoHead';

interface GalleryPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Visual Portfolio & Project Gallery | ${data.personal.fullName}`}
        description={`Visual archive of architectural designs, keynote speaking appearances, workspace setups, and awards.`}
        canonicalPath="/gallery"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Gallery', url: '/gallery' },
        ]}
      />
      <GallerySection data={data} darkMode={darkMode} />
    </div>
  );
};
