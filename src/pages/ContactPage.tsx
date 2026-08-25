import React from 'react';
import { PortfolioData } from '../types/portfolio';
import { ContactSection } from '../components/ContactSection';
import { SeoHead } from '../components/SeoHead';

interface ContactPageProps {
  data: PortfolioData;
  darkMode: boolean;
}

export const ContactPage: React.FC<ContactPageProps> = ({ data, darkMode }) => {
  return (
    <div className="pt-24 pb-16">
      <SeoHead
        data={data}
        title={`Contact & Hire ${data.personal.fullName} - Collaboration & Consulting`}
        description={`Get in touch with ${data.personal.fullName} (${data.personal.designation}) for engineering consultation, architecture advisory, and leadership roles.`}
        canonicalPath="/contact"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />
      <ContactSection data={data} darkMode={darkMode} />
    </div>
  );
};
