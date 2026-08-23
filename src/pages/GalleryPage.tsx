import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { GallerySection } from '../components/GallerySection';

interface GalleryPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <GallerySection data={data} darkMode={darkMode} />
    </div>
  );
};
