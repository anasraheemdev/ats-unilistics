import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Compass,
  Award,
  ArrowRight,
  Euro,
  Calendar,
  Check,
  Building2,
  Atom,
  MapPin,
} from 'lucide-react';
import { ProfessorVectorAvatar } from './ProfessorVectorAvatar';
import { ROUTES } from '@/config/routes';

interface UniversityOpportunity {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: 'de' | 'fr' | 'it' | 'ro';
  countryFlag: string;
  regionName: string;
  backgroundImage: string;
  tuitionModel: string;
  tuitionType: 'free' | 'subsidized' | 'grant' | 'fixed';
  popularFields: string[];
  programsCount: number;
  highlightTag: string;
}

interface ScholarshipOpportunity {
  id: string;
  name: string;
  provider: string;
  country: string;
  countryCode: 'de' | 'fr' | 'it' | 'ro' | 'eu';
  countryFlag: string;
  university?: string;
  backgroundImage: string;
  partnerLogo?: string;
  fundingType: 'full_tuition_and_stipend' | 'regional_grant' | 'tuition_waiver';
  fundingLabel: string;
  amountText: string;
  targetLevel: string;
  annualDeadline: string;
  eligibilityNote: string;
}

interface ProfessorResearchOpportunity {
  id: string;
  professorName: string;
  title: string;
  department: string;
  university: string;
  city: string;
  country: string;
  countryCode: 'de' | 'fr' | 'it' | 'ro';
  countryFlag: string;
  researchArea: string;
  categoryTag: 'ai' | 'energy' | 'automotive' | 'biomedical' | 'economics';
  openTopics: string[];
  labName: string;
}

const UNIVERSITIES_OPPORTUNITIES: UniversityOpportunity[] = [
  {
    id: 'uni-tum',
    name: 'Technical University of Munich',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    regionName: 'Bavaria',
    backgroundImage: '/images/hero_student_europe.jpg',
    tuitionModel: '€0 Statutory Tuition (€152 semester fee)',
    tuitionType: 'free',
    popularFields: ['Informatics & AI', 'Mechanical Eng.', 'Data Systems'],
    programsCount: 182,
    highlightTag: 'Top 30 Worldwide • TU9 Alliance',
  },
  {
    id: 'uni-sorbonne',
    name: 'Sorbonne University',
    city: 'Paris',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    regionName: 'Île-de-France',
    backgroundImage: '/images/university_facade_polaroid.jpg',
    tuitionModel: 'State Subsidized (€243–€380 / year)',
    tuitionType: 'subsidized',
    popularFields: ['Applied Mathematics', 'Quantum Physics', 'Computer Science'],
    programsCount: 145,
    highlightTag: 'Historic Prestige • Eiffel Eligible',
  },
  {
    id: 'uni-polimi',
    name: 'Politecnico di Milano',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    regionName: 'Lombardy',
    backgroundImage: '/images/student_campus_portrait.jpg',
    tuitionModel: '€0–€3,890 / year (DSU Grant Eligible)',
    tuitionType: 'grant',
    popularFields: ['Automotive Eng.', 'Architecture & Design', 'Biomedical'],
    programsCount: 110,
    highlightTag: '#1 Politecnico in Italy • DSU Lodging',
  },
  {
    id: 'uni-bucharest',
    name: 'University of Bucharest',
    city: 'Bucharest',
    country: 'Romania',
    countryCode: 'ro',
    countryFlag: '🇷🇴',
    regionName: 'Bucharest-Ilfov',
    backgroundImage: '/images/guidance_intro_visual.jpg',
    tuitionModel: '€2,400–€3,800 / year (Fixed Rate)',
    tuitionType: 'fixed',
    popularFields: ['General Medicine', 'Software Eng.', 'Cybersecurity'],
    programsCount: 94,
    highlightTag: 'Direct Ministry Letter • English Tracks',
  },
  {
    id: 'uni-rwth',
    name: 'RWTH Aachen University',
    city: 'Aachen',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    regionName: 'North Rhine-Westphalia',
    backgroundImage: '/images/student_library_explorer.jpg',
    tuitionModel: '€0 Statutory Tuition (€310 transit ticket)',
    tuitionType: 'free',
    popularFields: ['Electrical Eng.', 'Renewable Energy', 'Automotive Systems'],
    programsCount: 160,
    highlightTag: 'Engineering Capital • NRW Transit Pass',
  },
  {
    id: 'uni-sciencespo',
    name: 'Sciences Po Paris',
    city: 'Paris',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    regionName: 'Paris Centre',
    backgroundImage: '/images/contact_office_warm.jpg',
    tuitionModel: 'Merit-Exempt & Subsidized Schemes',
    tuitionType: 'subsidized',
    popularFields: ['Public Policy', 'Global Development', 'International Economics'],
    programsCount: 78,
    highlightTag: '#3 Global in Politics • Émile Boutmy',
  },
];

const SCHOLARSHIPS_OPPORTUNITIES: ScholarshipOpportunity[] = [
  {
    id: 'sch-daad',
    name: 'DAAD Study Scholarships for Postgraduate Studies',
    provider: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    backgroundImage: '/images/hero_student_europe.jpg',
    partnerLogo: '/images/partners/Daad.png',
    fundingType: 'full_tuition_and_stipend',
    fundingLabel: 'Full Tuition & Living Grant',
    amountText: '€934 / month + Health Insurance & Travel',
    targetLevel: 'Master & PhD',
    annualDeadline: 'October 31',
    eligibilityNote: 'Bachelor degree completed within the last 6 years with strong academic standing.',
  },
  {
    id: 'sch-eiffel',
    name: 'Eiffel Excellence Scholarship Program',
    provider: 'French Ministry for Europe and Foreign Affairs',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    backgroundImage: '/images/university_facade_polaroid.jpg',
    partnerLogo: '/images/partners/logo-campus-france.png',
    fundingType: 'full_tuition_and_stipend',
    fundingLabel: 'Full Tuition & Monthly Stipend',
    amountText: '€1,181 / month + Return Flight & Housing Subsidy',
    targetLevel: 'Master & PhD',
    annualDeadline: 'January 10',
    eligibilityNote: 'Nominated directly by French higher education institutions for exceptional profiles.',
  },
  {
    id: 'sch-dsu',
    name: 'Italian Regional DSU Study Grants (Lombardy & Piedmont)',
    provider: 'Regional Education Authorities (EDISU / DSU)',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    backgroundImage: '/images/student_campus_portrait.jpg',
    partnerLogo: '/images/partners/MUR-logo.png',
    fundingType: 'regional_grant',
    fundingLabel: 'Tuition Waiver & Living Subsidy',
    amountText: '€5,500–€7,200 / year + Free University Meals',
    targetLevel: 'Bachelor & Master',
    annualDeadline: 'August 30',
    eligibilityNote: 'Based on family economic indicator (ISEE Parificato) and certified sworn translation.',
  },
  {
    id: 'sch-arice',
    name: 'Romanian Government MFA / ARICE Foreign Citizen Grant',
    provider: 'Ministry of Foreign Affairs & ARICE Romania',
    country: 'Romania',
    countryCode: 'ro',
    countryFlag: '🇷🇴',
    backgroundImage: '/images/guidance_intro_visual.jpg',
    partnerLogo: '/images/partners/Sigiliu-guvernamental-si-identitate-ministeriala-RO.png',
    fundingType: 'full_tuition_and_stipend',
    fundingLabel: 'Full Tuition Waiver & Dormitory',
    amountText: '100% Tuition Waiver + Free Dormitory Housing + Stipend',
    targetLevel: 'Bachelor, Master & PhD',
    annualDeadline: 'March 15',
    eligibilityNote: 'Open to all non-EU citizens with accredited secondary or bachelor certificates.',
  },
  {
    id: 'sch-heinrich',
    name: 'Heinrich Böll Foundation International Scholarship',
    provider: 'Heinrich Böll Stiftung',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    backgroundImage: '/images/student_library_explorer.jpg',
    partnerLogo: '/images/partners/Daad.png',
    fundingType: 'full_tuition_and_stipend',
    fundingLabel: 'Full Living Grant',
    amountText: '€934 / month + Individual Study Allowance',
    targetLevel: 'Master & PhD',
    annualDeadline: 'September 1 / March 1',
    eligibilityNote: 'Excellent academic records, social engagement, and commitment to sustainability.',
  },
  {
    id: 'sch-boutmy',
    name: 'Émile Boutmy International Scholarship',
    provider: 'Sciences Po Paris',
    university: 'Sciences Po Paris',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    backgroundImage: '/images/contact_office_warm.jpg',
    partnerLogo: '/images/partners/logo-campus-france.png',
    fundingType: 'tuition_waiver',
    fundingLabel: 'Tuition Grant Co-Financed',
    amountText: 'Up to €14,210 / year in Direct Tuition Coverage',
    targetLevel: 'Bachelor & Master',
    annualDeadline: 'December 1',
    eligibilityNote: 'Awarded on academic merit and individual profile criteria for first-time non-EU applicants.',
  },
];

const PROFESSORS_OPPORTUNITIES: ProfessorResearchOpportunity[] = [
  {
    id: 'prof-meier',
    professorName: 'Prof. Dr. Klaus Meier',
    title: 'Chair of Scalable Intelligent Systems',
    department: 'Department of Computer Science & Informatics',
    university: 'Technical University of Munich',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    researchArea: 'Artificial Intelligence & Computer Vision',
    categoryTag: 'ai',
    openTopics: ['Autonomous Perception Systems', 'Multimodal LLM Reasoning'],
    labName: 'Munich AI & Robotics Perception Lab',
  },
  {
    id: 'prof-rossi',
    professorName: 'Prof. Elena Rossi',
    title: 'Head of Advanced Vehicle Dynamics',
    department: 'Department of Mechanical Engineering',
    university: 'Politecnico di Milano',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    researchArea: 'Electric Powertrains & Automotive Systems',
    categoryTag: 'automotive',
    openTopics: ['Battery Thermal Optimization', 'Vehicle Stability Control'],
    labName: 'PoliMi Meccatronica Research Group',
  },
  {
    id: 'prof-laurent',
    professorName: 'Prof. Jean-Pierre Laurent',
    title: 'Director of Applied Mathematical Modeling',
    department: 'Faculty of Science & Engineering',
    university: 'Sorbonne University',
    city: 'Paris',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    researchArea: 'Data Science & Quantitative Algorithms',
    categoryTag: 'ai',
    openTopics: ['Stochastic Optimization', 'Statistical Machine Learning'],
    labName: 'Laboratoire de Probabilités et Modèles Aléatoires',
  },
  {
    id: 'prof-becker',
    professorName: 'Prof. Dr. Ingrid Becker',
    title: 'Chair of Sustainable Grid Integration',
    department: 'Faculty of Electrical Engineering & Information Tech',
    university: 'RWTH Aachen University',
    city: 'Aachen',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    researchArea: 'Clean Energy & Power Electronics',
    categoryTag: 'energy',
    openTopics: ['Green Hydrogen Electrolyzer Control', 'Decentralized Smart Microgrids'],
    labName: 'Institute for Power Generation & Energy Systems',
  },
  {
    id: 'prof-popescu',
    professorName: 'Prof. Dr. Dan Popescu',
    title: 'Head of Distributed & Cloud Computing',
    department: 'Faculty of Mathematics and Computer Science',
    university: 'University of Bucharest',
    city: 'Bucharest',
    country: 'Romania',
    countryCode: 'ro',
    countryFlag: '🇷🇴',
    researchArea: 'Cybersecurity & Cloud Architectures',
    categoryTag: 'ai',
    openTopics: ['Zero-Trust Cloud Virtualization', 'Cryptographic Protocols'],
    labName: 'Centre for Advanced Distributed Technologies',
  },
  {
    id: 'prof-dupuis',
    professorName: 'Prof. Claire Dupuis',
    title: 'Director of Health Economics & Global Policy',
    department: 'Paris School of International Affairs',
    university: 'Sciences Po Paris',
    city: 'Paris',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    researchArea: 'International Economics & Health Systems',
    categoryTag: 'economics',
    openTopics: ['European Healthcare Subsidies', 'Cross-Border Labor Policy'],
    labName: 'Centre for Economic Studies & Policy',
  },
];

export const ExploreOpportunitiesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'universities' | 'scholarships' | 'professors'>('universities');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedResearchTag, setSelectedResearchTag] = useState<string>('all');

  const tabs = [
    { id: 'universities', label: 'Explore Universities', icon: Building2, count: '180+ Indexed' },
    { id: 'scholarships', label: 'Explore Scholarships', icon: Award, count: 'Verified Grants' },
    { id: 'professors', label: 'Explore Professors & Research', icon: Atom, count: 'Academic Directory' },
  ];

  const countryFilterOptions = [
    { id: 'all', label: 'All Destinations' },
    { id: 'de', label: '🇩🇪 Germany' },
    { id: 'fr', label: '🇫🇷 France' },
    { id: 'it', label: '🇮🇹 Italy' },
    { id: 'ro', label: '🇷🇴 Romania' },
  ];

  const researchTags = [
    { id: 'all', label: 'All Specializations' },
    { id: 'ai', label: 'Artificial Intelligence & Data' },
    { id: 'energy', label: 'Clean Energy & Power' },
    { id: 'automotive', label: 'Automotive & Mobility' },
    { id: 'economics', label: 'Economics & Policy' },
  ];

  const filteredUniversities = selectedCountry === 'all'
    ? UNIVERSITIES_OPPORTUNITIES
    : UNIVERSITIES_OPPORTUNITIES.filter((u) => u.countryCode === selectedCountry);

  const filteredScholarships = selectedCountry === 'all'
    ? SCHOLARSHIPS_OPPORTUNITIES
    : SCHOLARSHIPS_OPPORTUNITIES.filter((s) => s.countryCode === selectedCountry);

  const filteredProfessors = PROFESSORS_OPPORTUNITIES
    .filter((p) => {
      const matchesCountry = selectedCountry === 'all' || p.countryCode === selectedCountry;
      const matchesTag = selectedResearchTag === 'all' || p.categoryTag === selectedResearchTag;
      return matchesCountry && matchesTag;
    });

  return (
    <section
      id="explore-opportunities-section"
      className="explore-opportunities-wrapper"
      aria-labelledby="explore-opportunities-heading"
      style={{
        padding: '5rem 1.5rem',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 2.75rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                color: 'var(--action-primary, #245B42)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem',
              }}
            >
              <Compass size={14} aria-hidden="true" />
              <span>Explore Opportunities Worldwide</span>
            </div>

            <h2
              id="explore-opportunities-heading"
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Discover Your Future Across{' '}
              <span style={{ color: 'var(--action-primary, #245B42)' }}>
                European Higher Education
              </span>
            </h2>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
                color: 'var(--color-foreground-muted, #58695E)',
                lineHeight: 1.6,
                margin: '0 auto',
              }}
            >
              Access our unified discovery directory: compare accredited European universities, uncover verified
              national scholarship funds, and connect with faculty research departments.
            </p>
          </motion.div>
        </div>

        {/* Master Three-Way Experience Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}
          role="tablist"
          aria-label="Discovery experience selection"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as 'universities' | 'scholarships' | 'professors')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.7rem 1.35rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: '1.5px solid',
                  borderColor: isActive ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                  backgroundColor: isActive ? 'var(--action-primary, #245B42)' : 'var(--surface-canvas, #F6F8F5)',
                  color: isActive ? '#FFFFFF' : 'var(--color-foreground, #19261F)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: isActive ? '0 4px 16px rgba(36, 91, 66, 0.22)' : 'none',
                }}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.12rem 0.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'rgba(0, 0, 0, 0.06)',
                    color: isActive ? '#19261F' : 'var(--color-foreground-muted, #718578)',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Country Filter Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2.25rem',
          }}
          role="tablist"
          aria-label="Filter opportunities by destination country"
        >
          {countryFilterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={selectedCountry === opt.id}
              onClick={() => setSelectedCountry(opt.id)}
              style={{
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCountry === opt.id ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                backgroundColor: selectedCountry === opt.id ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                color: selectedCountry === opt.id ? 'var(--action-primary, #245B42)' : 'var(--color-foreground-muted, #58695E)',
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* TAB 1: UNIVERSITIES DISCOVERY EXPERIENCE */}
        {activeTab === 'universities' && (
          <motion.div
            key="tab-universities"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {filteredUniversities.map((uni) => (
                <div
                  key={uni.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 200ms ease',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                  }}
                  className="opportunity-card-hover"
                >
                  {/* Top Image Banner with Country Picture & Overlays */}
                  <div
                    style={{
                      position: 'relative',
                      height: '135px',
                      overflow: 'hidden',
                      backgroundColor: '#19261F',
                    }}
                  >
                    <img
                      src={uni.backgroundImage}
                      alt={`${uni.name} campus in ${uni.city}, ${uni.country}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease',
                      }}
                      className="opportunity-card-img"
                    />
                    {/* Gradient Overlay for high contrast */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(18, 30, 23, 0.94) 0%, rgba(18, 30, 23, 0.35) 55%, rgba(18, 30, 23, 0.6) 100%)',
                      }}
                    />

                    {/* Top Row: Country Logo Glass Pill + Program Count */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.85rem',
                        right: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      {/* Country Logo & Flag Glass Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.22rem 0.6rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.96)',
                          backdropFilter: 'blur(8px)',
                          color: '#19261F',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                        }}
                      >
                        <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{uni.countryFlag}</span>
                        <span>{uni.country}</span>
                      </span>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0E1A13',
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          padding: '0.22rem 0.55rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        {uni.programsCount} Programs
                      </span>
                    </div>

                    {/* City & Region Bottom Banner Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.6rem',
                        left: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      }}
                    >
                      <MapPin size={13} style={{ color: 'var(--brand-citron, #D7EE83)' }} />
                      <span>{uni.city}, {uni.regionName}</span>
                    </div>
                  </div>

                  {/* Body Content (Optimized Space, Zero Waste) */}
                  <div
                    style={{
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 800,
                          color: 'var(--color-foreground, #19261F)',
                          lineHeight: 1.25,
                          margin: '0 0 0.3rem',
                        }}
                      >
                        {uni.name}
                      </h3>

                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--action-primary, #245B42)',
                          marginBottom: '0.75rem',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {uni.highlightTag}
                      </div>

                      {/* Compact Tuition Strip */}
                      <div
                        style={{
                          backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                          border: '1px solid var(--border-subtle, #E1E8DE)',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          marginBottom: '0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--color-foreground, #19261F)',
                        }}
                      >
                        <Euro size={14} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} />
                        <span>{uni.tuitionModel}</span>
                      </div>

                      {/* Popular Disciplines Tags */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                        {uni.popularFields.map((field, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid var(--border-subtle, #E1E8DE)',
                              padding: '0.18rem 0.5rem',
                              borderRadius: '6px',
                              color: 'var(--color-foreground-muted, #58695E)',
                            }}
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`${ROUTES.UNIVERSITIES}?country=${encodeURIComponent(uni.country)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.95rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                        color: 'var(--action-primary, #245B42)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 160ms ease',
                      }}
                      className="opportunity-cta-btn"
                    >
                      <span>View University Offerings</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* University Section Primary CTA */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to={ROUTES.UNIVERSITIES}
                id="explore-universities-primary-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.85rem 2.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(36, 91, 66, 0.25)',
                  transition: 'all 180ms ease',
                }}
              >
                <span>Explore Universities</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SCHOLARSHIPS DISCOVERY EXPERIENCE */}
        {activeTab === 'scholarships' && (
          <motion.div
            key="tab-scholarships"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {filteredScholarships.map((sch) => (
                <div
                  key={sch.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    transition: 'all 200ms ease',
                  }}
                  className="opportunity-card-hover"
                >
                  {/* Top Image Banner with Country Picture & Overlays */}
                  <div
                    style={{
                      position: 'relative',
                      height: '135px',
                      overflow: 'hidden',
                      backgroundColor: '#19261F',
                    }}
                  >
                    <img
                      src={sch.backgroundImage}
                      alt={`${sch.name} in ${sch.country}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease',
                      }}
                      className="opportunity-card-img"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(18, 30, 23, 0.94) 0%, rgba(18, 30, 23, 0.35) 55%, rgba(18, 30, 23, 0.6) 100%)',
                      }}
                    />

                    {/* Top Row: Country Logo Glass Pill + Funding Label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.85rem',
                        right: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      {/* Country Logo & Flag Glass Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.22rem 0.6rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.96)',
                          backdropFilter: 'blur(8px)',
                          color: '#19261F',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                        }}
                      >
                        <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{sch.countryFlag}</span>
                        <span>{sch.country}</span>
                      </span>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0E1A13',
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          padding: '0.22rem 0.55rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        {sch.fundingLabel}
                      </span>
                    </div>

                    {/* Bottom Banner Row: Target Level & Partner Logo */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.6rem',
                        left: '0.85rem',
                        right: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}
                      >
                        <Award size={13} style={{ color: 'var(--brand-citron, #D7EE83)' }} />
                        <span>{sch.targetLevel}</span>
                        {sch.university && (
                          <span style={{ color: 'var(--brand-citron, #D7EE83)', fontWeight: 700 }}>
                            • {sch.university}
                          </span>
                        )}
                      </div>

                      {/* Partner Logo Emblem in Banner */}
                      {sch.partnerLogo && (
                        <div
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                          title={`Administered by ${sch.provider}`}
                        >
                          <img
                            src={sch.partnerLogo}
                            alt={sch.provider}
                            style={{ maxHeight: '20px', maxWidth: '36px', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content (Optimized Space, Zero Waste) */}
                  <div
                    style={{
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: 'var(--color-foreground, #19261F)',
                          lineHeight: 1.25,
                          margin: '0 0 0.25rem',
                        }}
                      >
                        {sch.name}
                      </h3>

                      <div style={{ fontSize: '0.72rem', color: 'var(--color-foreground-muted, #58695E)', marginBottom: '0.75rem', fontWeight: 500 }}>
                        Authority: <strong>{sch.provider}</strong>
                      </div>

                      {/* Coverage & Stipend Strip */}
                      <div
                        style={{
                          backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                          border: '1px solid var(--border-subtle, #E1E8DE)',
                          padding: '0.55rem 0.8rem',
                          borderRadius: '10px',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--action-primary, #245B42)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.15rem' }}>
                          Coverage &amp; Monthly Stipend
                        </div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', lineHeight: 1.3 }}>
                          {sch.amountText}
                        </div>
                      </div>

                      {/* Deadline & Brief Eligibility */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--color-foreground, #19261F)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        <Calendar size={13} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} />
                        <span>Annual Deadline: <strong>{sch.annualDeadline}</strong></span>
                      </div>

                      <p style={{ fontSize: '0.72rem', color: 'var(--color-foreground-muted, #58695E)', lineHeight: 1.4, margin: '0 0 1rem' }}>
                        {sch.eligibilityNote}
                      </p>
                    </div>

                    <Link
                      to={ROUTES.SCHOLARSHIPS}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.95rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                        color: 'var(--action-primary, #245B42)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 160ms ease',
                      }}
                      className="opportunity-cta-btn"
                    >
                      <span>View Grant Specifications</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Scholarship Section Primary CTA */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to={ROUTES.SCHOLARSHIPS}
                id="explore-scholarships-primary-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.85rem 2.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(36, 91, 66, 0.25)',
                  transition: 'all 180ms ease',
                }}
              >
                <span>Explore Scholarships</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PROFESSORS & RESEARCH EXPERIENCE */}
        {activeTab === 'professors' && (
          <motion.div
            key="tab-professors"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Interactive Subject & Research Tags Filter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1.75rem',
              }}
              role="tablist"
              aria-label="Filter professors by research field"
            >
              {researchTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedResearchTag === tag.id}
                  onClick={() => setSelectedResearchTag(tag.id)}
                  style={{
                    padding: '0.35rem 0.9rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: selectedResearchTag === tag.id ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                    backgroundColor: selectedResearchTag === tag.id ? 'var(--action-primary, #245B42)' : '#FFFFFF',
                    color: selectedResearchTag === tag.id ? '#FFFFFF' : 'var(--color-foreground, #19261F)',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Professors Grid (Modern, Space-Optimized with Vector Portraits) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {filteredProfessors.map((prof) => (
                <div
                  key={prof.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    transition: 'all 200ms ease',
                  }}
                  className="opportunity-card-hover"
                >
                  <div>
                    {/* Header Row: Vector Portrait + Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.85rem' }}>
                      <ProfessorVectorAvatar professorId={prof.id} size={64} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{prof.countryFlag}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', textTransform: 'uppercase' }}>
                            {prof.country} • {prof.city}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: 'var(--color-foreground, #19261F)',
                            lineHeight: 1.25,
                            margin: '0 0 0.15rem',
                          }}
                        >
                          {prof.professorName}
                        </h3>

                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--color-foreground-muted, #58695E)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {prof.title}
                        </div>
                      </div>
                    </div>

                    {/* University & Department Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.72rem',
                        color: 'var(--color-foreground-muted, #58695E)',
                        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <Building2 size={13} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>{prof.university}</span>
                      <span>—</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prof.department}</span>
                    </div>

                    {/* Research Focus Box */}
                    <div
                      style={{
                        backgroundColor: 'rgba(36, 91, 66, 0.04)',
                        border: '1px solid rgba(36, 91, 66, 0.15)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--action-primary, #245B42)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                        Research Specialization
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', lineHeight: 1.25 }}>
                        {prof.researchArea}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-foreground-muted, #718578)', marginTop: '0.2rem' }}>
                        Lab: {prof.labName}
                      </div>
                    </div>

                    {/* Active Academic Thesis Topics (Compact) */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-foreground-muted, #718578)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                        Active Academic Thesis Topics:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {prof.openTopics.slice(0, 2).map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.72rem',
                              color: 'var(--color-foreground, #19261F)',
                              lineHeight: 1.3,
                            }}
                          >
                            <Check size={12} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <Link
                    to={ROUTES.PROGRAMS}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.95rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      color: 'var(--action-primary, #245B42)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 160ms ease',
                    }}
                    className="opportunity-cta-btn"
                  >
                    <span>Explore Department Degrees</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>

            {/* Professors Section Primary CTA */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to={ROUTES.PROGRAMS}
                id="explore-professors-primary-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.85rem 2.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(36, 91, 66, 0.25)',
                  transition: 'all 180ms ease',
                }}
              >
                <span>Explore Professors</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
