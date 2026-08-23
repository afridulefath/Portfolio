import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { ContactSection } from '../components/ContactSection';

interface ContactPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ContactPage: React.FC<ContactPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <ContactSection data={data} darkMode={darkMode} />
    </div>
  );
};
