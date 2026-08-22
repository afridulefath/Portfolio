import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  FileCode, 
  Terminal, 
  FolderTree, 
  Layers, 
  Sparkles,
  Download
} from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const [activeFile, setActiveFile] = useState<string>('schemas');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileContents: Record<string, { title: string; filename: string; language: string; content: string }> = {
    schemas: {
      title: 'Sanity.io Schemas Index (All 10 Collections)',
      filename: 'sanity/schemaTypes/index.ts',
      language: 'typescript',
      content: `// sanity/schemaTypes/index.ts
import { personalInfo } from './personalInfo';
import { aboutMe } from './aboutMe';
import { experience } from './experience';
import { education } from './education';
import { certificate } from './certificate';
import { skill } from './skill';
import { galleryItem } from './galleryItem';
import { contactInfo } from './contactInfo';
import { socialLink } from './socialLink';
import { seoSettings } from './seoSettings';
import { siteSettings } from './siteSettings';

export const schemaTypes = [
  personalInfo,
  aboutMe,
  experience,
  education,
  certificate,
  skill,
  galleryItem,
  contactInfo,
  socialLink,
  seoSettings,
  siteSettings,
];
`
    },
    personalInfoSchema: {
      title: 'Sanity Schema: Personal Info',
      filename: 'sanity/schemaTypes/personalInfo.ts',
      language: 'typescript',
      content: `// sanity/schemaTypes/personalInfo.ts
import { defineField, defineType } from 'sanity';

export const personalInfo = defineType({
  name: 'personalInfo',
  title: 'Personal Information',
  type: 'document',
  fields: [
    defineField({ name: 'fullName', title: 'Full Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'designation', title: 'Designation', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'shortBio', title: 'Short Bio', type: 'text', rows: 3 }),
    defineField({ name: 'avatar', title: 'Profile Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({
      name: 'availability',
      title: 'Availability Status',
      type: 'string',
      options: {
        list: [
          { title: 'Available for Hire', value: 'Available for Hire' },
          { title: 'Open to Consulting', value: 'Open to Consulting' },
          { title: 'Employed', value: 'Employed' },
          { title: 'Freelance Available', value: 'Freelance Available' },
        ],
      },
    }),
    defineField({ name: 'yearsExperience', title: 'Years of Experience', type: 'number' }),
    defineField({ name: 'projectsCompleted', title: 'Projects Delivered', type: 'number' }),
    defineField({ name: 'resumeUrl', title: 'Resume Download URL', type: 'url' }),
    defineField({ name: 'heroCtaPrimaryText', title: 'Primary CTA Text', type: 'string' }),
    defineField({ name: 'heroCtaPrimaryLink', title: 'Primary CTA Link', type: 'string' }),
    defineField({ name: 'heroCtaSecondaryText', title: 'Secondary CTA Text', type: 'string' }),
    defineField({ name: 'heroCtaSecondaryLink', title: 'Secondary CTA Link', type: 'string' }),
  ],
});
`
    },
    experienceSchema: {
      title: 'Sanity Schema: Job Experience',
      filename: 'sanity/schemaTypes/experience.ts',
      language: 'typescript',
      content: `// sanity/schemaTypes/experience.ts
import { defineField, defineType } from 'sanity';

export const experience = defineType({
  name: 'experience',
  title: 'Job Experience',
  type: 'document',
  fields: [
    defineField({ name: 'company', title: 'Company Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'role', title: 'Role / Position', type: 'string', validation: Rule => Rule.required() }),
    defineField({
      name: 'employmentType',
      title: 'Employment Type',
      type: 'string',
      options: { list: ['Full-time', 'Contract', 'Part-time', 'Remote'] }
    }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'startDate', title: 'Start Date (e.g. Jan 2022)', type: 'string' }),
    defineField({ name: 'endDate', title: 'End Date (or Present)', type: 'string' }),
    defineField({ name: 'current', title: 'Currently Working Here', type: 'boolean', initialValue: false }),
    defineField({ name: 'summary', title: 'Role Summary', type: 'text', rows: 2 }),
    defineField({ name: 'responsibilities', title: 'Responsibilities', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'achievements', title: 'Key Achievements & Metrics', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'technologies', title: 'Technologies / Tech Stack', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'logo', title: 'Company Logo', type: 'image' }),
  ],
});
`
    },
    sanityClient: {
      title: 'Sanity Client & GROQ Fetcher',
      filename: 'src/lib/sanity.client.ts',
      language: 'typescript',
      content: `// src/lib/sanity.client.ts
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-08-01',
  useCdn: true,
});

export const PORTFOLIO_GROQ_QUERY = \`{
  "personal": *[_type == "personalInfo"][0] {
    ...,
    "avatarUrl": avatar.asset->url
  },
  "about": *[_type == "aboutMe"][0],
  "experiences": *[_type == "experience"] | order(startDate desc) {
    ...,
    "logoUrl": logo.asset->url
  },
  "education": *[_type == "education"] | order(startYear desc),
  "certificates": *[_type == "certificate"] | order(issueDate desc),
  "skills": *[_type == "skill"] | order(level desc),
  "gallery": *[_type == "galleryItem"] | order(_createdAt desc) {
    ...,
    "imageUrl": image.asset->url
  },
  "contact": *[_type == "contactInfo"][0],
  "socials": *[_type == "socialLink"] | order(_createdAt asc),
  "seo": *[_type == "seoSettings"][0],
  "siteSettings": *[_type == "siteSettings"][0]
}\`;
`
    },
    resendApiRoute: {
      title: 'Next.js App Router Contact Form API (Resend)',
      filename: 'src/app/api/contact/route.ts',
      language: 'typescript',
      content: `// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, honeypot } = await request.json();

    // Spam honeypot detection
    if (honeypot) {
      return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Send email using Resend free tier
    const data = await resend.emails.send({
      from: 'Portfolio Inquiries <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL || 'your-email@example.com',
      reply_to: email,
      subject: \`[Portfolio Lead] \${subject} - from \${name}\`,
      html: \`
        <h2>New Inquiry from Portfolio Website</h2>
        <p><strong>Name:</strong> \${name}</p>
        <p><strong>Email:</strong> \${email}</p>
        <p><strong>Subject:</strong> \${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">\${message}</p>
      \`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`
    },
    envLocal: {
      title: 'Environment Variables Template',
      filename: '.env.local',
      language: 'bash',
      content: `# Sanity.io Credentials
NEXT_PUBLIC_SANITY_PROJECT_ID="your_sanity_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_READ_TOKEN="your_sanity_read_token"

# Email Notification API (Resend Free Tier)
RESEND_API_KEY="re_123456789_abcdef"
NOTIFICATION_EMAIL="your_personal_email@example.com"

# Website Metadata
NEXT_PUBLIC_SITE_URL="https://your-portfolio.vercel.app"
`
    },
  };

  const current = fileContents[activeFile] || fileContents.schemas;

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="code-export-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in"
    >
      <div className={`w-full max-w-5xl h-[88vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden ${
        darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 shrink-0 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Next.js & Sanity Architecture Hub</h2>
              <p className="text-xs text-slate-400">Complete production source code and schemas for Vercel deployment.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy File Content'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: Left File Navigator + Right Code Preview */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Selector */}
          <div className={`w-64 border-r p-3 overflow-y-auto space-y-1 ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Architecture Files
            </div>

            {Object.entries(fileContents).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setActiveFile(key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  activeFile === key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.filename}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-200">
            <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{current.filename}</span>
              <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold">
                {current.language}
              </span>
            </div>

            <pre className="flex-1 overflow-auto p-5 text-xs font-mono leading-relaxed select-text text-slate-300">
              <code>{current.content}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
