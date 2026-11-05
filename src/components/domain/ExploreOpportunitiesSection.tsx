import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Award,
  Atom,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Trophy,
  Landmark,
  GraduationCap,
  LayoutGrid,
  Globe,
  Info,
  ArrowUpRight,
  Bookmark,
  Share2,
  ExternalLink,
  Check,
  Calendar,
  Sparkles,
  CheckCircle,
  FlaskConical,
  BookOpen,
} from 'lucide-react';
import { ProfessorVectorAvatar } from './ProfessorVectorAvatar';
import { UniversityLogoBadge } from './UniversityLogoBadge';
import { CountryFlagIcon } from './CountryFlagIcon';
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
  qsRank: string;
  institutionType: string;
  isVerified: boolean;
  motto: string;
  tuitionDisplay: string;
  programsCount: number;
  degreeLevels: string[];
  languages: string[];
  advisoryNote: string;
  officialPortalUrl?: string;
}

interface ScholarshipOpportunity {
  id: string;
  name: string;
  provider: string;
  country: string;
  countryCode: 'de' | 'fr' | 'it' | 'ro' | 'eu';
  countryFlag: string;
  partnerLogo?: string;
  fundingBadge: string;
  authorityType: string;
  isVerified: boolean;
  motto: string;
  fundingValue: string;
  monthlyStipend: string;
  tuitionCoverage: string;
  travelAllowance: string;
  targetLevel: string;
  keyCriteria: string[];
  annualDeadline: string;
  advisoryNote: string;
  officialPortalUrl?: string;
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
  disciplineBadge: string;
  roleBadge: string;
  isVerified: boolean;
  motto: string;
  specializationDisplay: string;
  openTopicsCount: number;
  categoryTag: 'ai' | 'energy' | 'automotive' | 'biomedical' | 'economics';
  openTopics: string[];
  labName: string;
  degreeLevels: string[];
  languages: string[];
  advisoryNote: string;
}

const UNIVERSITIES_OPPORTUNITIES: UniversityOpportunity[] = [
  {
    id: 'uni-polimi',
    name: 'Politecnico di Milano',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    regionName: 'Lombardy',
    backgroundImage: '/images/milan_duomo_architecture.jpg',
    qsRank: '#98 QS',
    institutionType: 'Public',
    isVerified: true,
    motto: 'Innovation. Research. Global Impact.',
    tuitionDisplay: '€3,900/yr',
    programsCount: 110,
    degreeLevels: ["Master's"],
    languages: ['English'],
    advisoryNote: 'Tuition varies based on ISEE (family income). Non-EU maximum fee is around €3,900/year.',
    officialPortalUrl: 'https://www.polimi.it/en',
  },
  {
    id: 'uni-tum',
    name: 'Technical University of Munich',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    regionName: 'Bavaria',
    backgroundImage: '/images/hero_student_europe.jpg',
    qsRank: '#37 QS',
    institutionType: 'Public',
    isVerified: true,
    motto: 'The Entrepreneurial University • TU9 Alliance.',
    tuitionDisplay: '€0/yr',
    programsCount: 182,
    degreeLevels: ["Master's", "Bachelor's"],
    languages: ['English Tracks'],
    advisoryNote: 'Statutory €0 tuition; nominal €152 semester solidarity fee covers transit & student union.',
    officialPortalUrl: 'https://www.tum.de/en',
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
    qsRank: '#59 QS',
    institutionType: 'Public',
    isVerified: true,
    motto: 'Creators of Futures Since 1257 • Eiffel Partner.',
    tuitionDisplay: '€243/yr',
    programsCount: 145,
    degreeLevels: ["Master's"],
    languages: ['English & French'],
    advisoryNote: 'State-subsidized rates for non-EU students with Eiffel Excellence scholarship eligibility.',
    officialPortalUrl: 'https://www.sorbonne-universite.fr/en',
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
    qsRank: '#801 QS',
    institutionType: 'Public',
    isVerified: true,
    motto: 'Virtus et Sapientia • Tradition in Excellence.',
    tuitionDisplay: '€2,400/yr',
    programsCount: 94,
    degreeLevels: ["Master's", "Bachelor's"],
    languages: ['English Tracks'],
    advisoryNote: 'Direct Ministry Acceptance Letter issued within 4–6 weeks for non-EU applicants.',
    officialPortalUrl: 'https://unibuc.ro/?lang=en',
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
    qsRank: '#106 QS',
    institutionType: 'Public',
    isVerified: true,
    motto: 'Zukunft denken • Engineering Capital of Germany.',
    tuitionDisplay: '€0/yr',
    programsCount: 160,
    degreeLevels: ["Master's"],
    languages: ['English Tracks'],
    advisoryNote: 'Zero tuition with mandatory NRW semester transit ticket included in fee covering regional rail.',
    officialPortalUrl: 'https://www.rwth-aachen.de',
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
    qsRank: '#3 Global',
    institutionType: 'Public',
    isVerified: true,
    motto: 'Understanding Our Times to Shape the Future.',
    tuitionDisplay: '€0–€4,200/yr',
    programsCount: 78,
    degreeLevels: ["Master's"],
    languages: ['English Tracks'],
    advisoryNote: 'Need-based fee scale plus Émile Boutmy scholarship fee waivers available for international students.',
    officialPortalUrl: 'https://www.sciencespo.fr/en',
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
    partnerLogo: '/images/partners/Daad.png',
    fundingBadge: '100% Fully Funded',
    authorityType: 'Statutory Body',
    isVerified: true,
    motto: 'Official German Academic Exchange Grant for Master & PhD Scholars.',
    fundingValue: '€934 / month + Health Insurance',
    monthlyStipend: '€934 / mo',
    tuitionCoverage: '100% Free',
    travelAllowance: 'Flight Covered',
    targetLevel: 'Master & PhD',
    keyCriteria: [
      'Bachelor completed within last 6 years with 3.0+ CGPA',
      'Direct application via official DAAD Portal',
    ],
    annualDeadline: 'October 31, 2026',
    advisoryNote: 'Applications submitted via DAAD portal by October 31. Direct living allowance + health insurance.',
    officialPortalUrl: 'https://www.daad.de',
  },
  {
    id: 'sch-eiffel',
    name: 'Eiffel Excellence Scholarship Program',
    provider: 'Campus France / Ministry for Europe & Foreign Affairs',
    country: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    partnerLogo: '/images/partners/logo-campus-france.png',
    fundingBadge: 'Prestigious National Award',
    authorityType: 'French Republic',
    isVerified: true,
    motto: 'French Ministry Grant for Top International Graduate Talent.',
    fundingValue: '€1,181 / month + Return Flight',
    monthlyStipend: '€1,181 / mo',
    tuitionCoverage: 'State Subsidized',
    travelAllowance: 'Roundtrip Airfare',
    targetLevel: 'Master & PhD',
    keyCriteria: [
      'Nominated directly by French higher education institutions',
      'Priority for Engineering, Science, Economics & Management',
    ],
    annualDeadline: 'January 10, 2027',
    advisoryNote: 'Institutional nomination by French universities. Covers monthly stipend, flights, and social security.',
    officialPortalUrl: 'https://www.campusfrance.org',
  },
  {
    id: 'sch-dsu',
    name: 'DSU Regional Right to Education Grant',
    provider: 'Regional Authority for Higher Education (Lombardy & Tuscany)',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    partnerLogo: '/images/partners/MUR-logo.png',
    fundingBadge: 'Need-Based Welfare Grant',
    authorityType: 'Regional Board',
    isVerified: true,
    motto: 'Equal Access Funding: Tuition Waiver, Dormitory & Dining Hall Access.',
    fundingValue: 'Up to €7,200/yr + Free Meals',
    monthlyStipend: '€600–€750 / mo',
    tuitionCoverage: '100% Waived',
    travelAllowance: 'Free Meals Included',
    targetLevel: 'Bachelor & Master',
    keyCriteria: [
      'Calculated based on family ISEE equivalence certificate',
      'Provides campus dorm housing and daily canteen meals',
    ],
    annualDeadline: 'August 30, 2026',
    advisoryNote: 'Based on family ISEE equivalence. Free student residence accommodation and university meal plans.',
    officialPortalUrl: 'https://www.dsu.toscana.it',
  },
  {
    id: 'sch-arice',
    name: 'Romanian Government Ministry Scholarships (ARICE)',
    provider: 'Romanian Agency for Foreign Investments & Trade',
    country: 'Romania',
    countryCode: 'ro',
    countryFlag: '🇷🇴',
    partnerLogo: '/images/partners/Sigiliu-guvernamental-si-identitate-ministeriala-RO.png',
    fundingBadge: 'Bilateral State Grant',
    authorityType: 'Romanian Govt',
    isVerified: true,
    motto: 'Full Tuition, Free Accommodation & Monthly Maintenance Allowance.',
    fundingValue: '100% Tuition Waiver + Free Dorm',
    monthlyStipend: '65–85 € / mo',
    tuitionCoverage: '100% Waived',
    travelAllowance: 'Dorm Included',
    targetLevel: 'Bachelor, Master & PhD',
    keyCriteria: [
      'Non-EU citizens applying through Ministry diplomatic channel',
      'Includes mandatory Romanian preparatory language year',
    ],
    annualDeadline: 'May 31, 2026',
    advisoryNote: 'Covers full tuition fees, free student dormitory accommodation, and monthly maintenance allowance.',
    officialPortalUrl: 'https://arice.gov.ro',
  },
  {
    id: 'sch-erasmus',
    name: 'Erasmus Mundus Joint Master Degrees (EMJM)',
    provider: 'European Commission Education Executive Agency',
    country: 'Europe',
    countryCode: 'eu',
    countryFlag: '🇪🇺',
    partnerLogo: '/images/partners/erasmus-1.png',
    fundingBadge: 'EU Flagship Grant',
    authorityType: 'European Union',
    isVerified: true,
    motto: 'Study in 2+ European Countries with Complete EU Financial Backing.',
    fundingValue: '€1,400 / month + Full Tuition',
    monthlyStipend: '€1,400 / mo',
    tuitionCoverage: '100% Waived',
    travelAllowance: '€3,000 / yr Travel',
    targetLevel: 'Joint Master Degrees',
    keyCriteria: [
      'Study across at least 2 distinct European universities',
      'Joint or multiple European master degree awarded',
    ],
    annualDeadline: 'February 15, 2027',
    advisoryNote: 'Students study in at least 2 distinct EU countries. Full tuition, travel costs, and monthly living allowance.',
    officialPortalUrl: 'https://erasmus-plus.ec.europa.eu',
  },
  {
    id: 'sch-hec-bilateral',
    name: 'HEC Overseas Scholarships & Bilateral Agreements',
    provider: 'Higher Education Commission of Pakistan',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇵🇰',
    partnerLogo: '/images/partners/higher-education-commission-pakistan-logo.png',
    fundingBadge: 'Bilateral Fellowship',
    authorityType: 'National Agency',
    isVerified: true,
    motto: 'Bilateral Government Scholarships for Top Pakistani Scholars.',
    fundingValue: 'Full Tuition, Airfare & Stipend',
    monthlyStipend: '€1,200 / mo',
    tuitionCoverage: '100% Waived',
    travelAllowance: 'Return Flight',
    targetLevel: 'PhD & Postdoc',
    keyCriteria: [
      'Pakistani nationals with minimum 16 years of education',
      'HAT/GRE qualification and departmental nomination',
    ],
    annualDeadline: 'April 30, 2026',
    advisoryNote: 'Direct HEC coordination with DAAD Germany and Campus France for fully funded research positions.',
    officialPortalUrl: 'https://www.hec.gov.pk',
  },
];

const PROFESSORS_OPPORTUNITIES: ProfessorResearchOpportunity[] = [
  {
    id: 'prof-meier',
    professorName: 'Prof. Dr. Klaus Meier',
    title: 'Chair of Autonomous Perception Systems',
    department: 'Department of Informatics & Robotics',
    university: 'Technical University of Munich',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    disciplineBadge: 'AI & Robotics',
    roleBadge: 'Doctoral Chair',
    isVerified: true,
    motto: 'Pioneering Neuromorphic Vision and Edge Intelligence.',
    specializationDisplay: 'Artificial Intelligence & Computer Vision',
    openTopicsCount: 3,
    categoryTag: 'ai',
    openTopics: ['Autonomous Perception Systems in Extreme Weather', 'Neuromorphic Sensor Fusion for Edge Robotics'],
    labName: 'Munich AI & Robotics Exploration Lab',
    degreeLevels: ['PhD Research', 'Master Thesis'],
    languages: ['100% English Supervision'],
    advisoryNote: 'Open to Pakistani master thesis candidates and prospective PhD scholars with strong Python & C++ backgrounds.',
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
    disciplineBadge: 'Automotive & Mobility',
    roleBadge: 'Lead Director',
    isVerified: true,
    motto: 'Designing Resilient Electric Powertrains & Active Chassis.',
    specializationDisplay: 'Electric Powertrains & Dynamics',
    openTopicsCount: 2,
    categoryTag: 'automotive',
    openTopics: ['Battery Thermal Optimization in Fast-Charging EV', 'Vehicle Stability Control for Autonomous Driving'],
    labName: 'PoliMi Meccatronica Research Group',
    degreeLevels: ['Master Thesis', 'Doctorate Track'],
    languages: ['English Tracks'],
    advisoryNote: 'Funded industrial research projects in collaboration with leading European EV manufacturers.',
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
    disciplineBadge: 'Mathematics & Data',
    roleBadge: 'Research Fellow',
    isVerified: true,
    motto: 'Mathematical Rigor for Deep Statistical Inference.',
    specializationDisplay: 'Data Science & Quantitative Algorithms',
    openTopicsCount: 4,
    categoryTag: 'ai',
    openTopics: ['Stochastic Optimization in High Dimensions', 'Statistical Machine Learning for Climate Modeling'],
    labName: 'Laboratoire de Probabilités et Modèles Aléatoires',
    degreeLevels: ['PhD Fellowship', 'Master Stage'],
    languages: ['English & French'],
    advisoryNote: 'Supervises Eiffel scholars and international postgraduates in stochastic mathematical optimization.',
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
    disciplineBadge: 'Clean Energy & Power',
    roleBadge: 'Institute Head',
    isVerified: true,
    motto: 'Power Electronics for Decentralized Smart Microgrids.',
    specializationDisplay: 'Clean Energy & Power Electronics',
    openTopicsCount: 2,
    categoryTag: 'energy',
    openTopics: ['Green Hydrogen Electrolyzer Control Systems', 'Decentralized Smart Microgrid Synchronization'],
    labName: 'Institute for Power Generation & Energy Systems',
    degreeLevels: ['Dr.-Ing. Position', 'M.Sc. Thesis'],
    languages: ['English Supervision'],
    advisoryNote: 'State-of-the-art laboratory testing facilities for renewable power grid synchronization.',
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
    disciplineBadge: 'Cybersecurity & Cloud',
    roleBadge: 'Department Head',
    isVerified: true,
    motto: 'Zero-Trust Architectures for Distributed Systems.',
    specializationDisplay: 'Cybersecurity & Cloud Architectures',
    openTopicsCount: 3,
    categoryTag: 'ai',
    openTopics: ['Zero-Trust Cloud Virtualization Protocols', 'Post-Quantum Cryptographic Key Exchange'],
    labName: 'Centre for Advanced Distributed Technologies',
    degreeLevels: ['Doctorate', 'Master of Science'],
    languages: ['English Tracks'],
    advisoryNote: 'Direct partnership with European research alliances on cryptographic validation and cloud security.',
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
    disciplineBadge: 'Economics & Policy',
    roleBadge: 'Dean of Studies',
    isVerified: true,
    motto: 'Evidence-Based Global Health and Comparative Welfare.',
    specializationDisplay: 'International Economics & Health Systems',
    openTopicsCount: 2,
    categoryTag: 'economics',
    openTopics: ['European Healthcare Subsidies & Equity', 'Cross-Border Labor Migration Economics'],
    labName: 'Centre for Economic Studies & Policy',
    degreeLevels: ['PhD in Public Policy', 'Master Level'],
    languages: ['English Tracks'],
    advisoryNote: 'Advises European health organizations and conducts comparative studies on migration healthcare economics.',
  },
];

// Stylized Skyline Watermark Illustration
const SkylineWatermark: React.FC = () => (
  <svg
    viewBox="0 0 140 45"
    fill="currentColor"
    aria-hidden="true"
    style={{
      position: 'absolute',
      right: '24px',
      bottom: 0,
      height: '38px',
      width: 'auto',
      opacity: 0.16,
      color: '#245B42',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <path d="M0,45 L0,32 L6,32 L6,25 L12,25 L12,38 L16,38 L16,20 L22,20 L22,14 L25,8 L28,14 L28,38 L34,38 L34,28 L40,28 L40,45 L46,45 L46,24 L52,24 L52,18 L56,12 L60,18 L60,38 L68,38 L68,26 L74,26 L74,45 L82,45 L82,16 L88,16 L88,10 L91,4 L94,10 L94,36 L100,36 L100,24 L106,24 L106,45 L114,45 L114,18 L122,18 L122,34 L130,34 L130,45 Z" />
  </svg>
);

// Organic Wave Cutout at the bottom of the photo header
const HeaderWaveTransition: React.FC = () => (
  <svg
    viewBox="0 0 500 36"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{
      position: 'absolute',
      bottom: -1,
      left: 0,
      width: '100%',
      height: '32px',
      pointerEvents: 'none',
      display: 'block',
      zIndex: 2,
    }}
  >
    <path
      d="M0,20 C140,38 320,4 500,22 L500,36 L0,36 Z"
      fill="#FFFFFF"
    />
  </svg>
);

// Organic decorative wave watermark inside the floating stats capsule
const CapsuleWaveWatermark: React.FC = () => (
  <svg
    viewBox="0 0 160 80"
    fill="none"
    aria-hidden="true"
    style={{
      position: 'absolute',
      right: '-10px',
      bottom: '-10px',
      width: '140px',
      height: '70px',
      opacity: 0.16,
      pointerEvents: 'none',
    }}
  >
    <path
      d="M0,80 C40,40 100,20 160,50 L160,80 Z"
      fill="url(#capsule-wave-grad)"
    />
    <defs>
      <linearGradient id="capsule-wave-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#245B42" />
        <stop offset="100%" stopColor="#D7EE83" />
      </linearGradient>
    </defs>
  </svg>
);

export const ExploreOpportunitiesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'universities' | 'scholarships' | 'professors'>('universities');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedResearchTag, setSelectedResearchTag] = useState<string>('all');

  // Interactive Saved / Share Toast State
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = (id: string, _title?: string) => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

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
        padding: '5.5rem 1.5rem',
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
              <Building2 size={13} aria-hidden="true" />
              <span>Explore Opportunities Worldwide</span>
            </div>

            <h2
              id="explore-opportunities-heading"
              style={{
                fontSize: 'clamp(2.1rem, 3.4vw, 2.9rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 1rem',
                letterSpacing: '-0.025em',
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

        {/* Master Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Explore Opportunities Sections"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: '1px solid',
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
            marginBottom: '2.5rem',
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

        {/* =========================================================================
            TAB 1: UNIVERSITIES DISCOVERY EXPERIENCE (REFERENCE COMPLIANT CARD)
            ========================================================================= */}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              {filteredUniversities.map((uni) => {
                const isBookmarked = bookmarkedIds.has(uni.id);
                const isCopied = copiedId === uni.id;

                return (
                  <div
                    key={uni.id}
                    className="opportunity-card-hover"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '28px',
                      border: '1px solid #E5EBE3',
                      boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 240ms ease',
                    }}
                  >
                    {/* Top Architectural Photo Header with Landmark & Badges */}
                    <div
                      style={{
                        position: 'relative',
                        height: '240px',
                        overflow: 'hidden',
                        backgroundColor: '#0C2F24',
                      }}
                    >
                      <img
                        src={uni.backgroundImage}
                        alt={`${uni.name} campus architecture in ${uni.city}, ${uni.country}`}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 450ms ease',
                        }}
                        className="opportunity-card-img"
                      />

                      {/* Dark Gradient Overlay for optimal contrast */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(8, 28, 20, 0.45) 0%, rgba(8, 28, 20, 0.15) 30%, rgba(8, 28, 20, 0.8) 75%, rgba(6, 24, 18, 0.96) 100%)',
                        }}
                      />

                      {/* Top Badges Row: Trophy/QS Rank, Public, and Verified */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.95rem',
                          left: '1rem',
                          right: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          zIndex: 3,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.32rem 0.7rem',
                              borderRadius: 'var(--radius-pill, 9999px)',
                              backgroundColor: 'rgba(12, 38, 28, 0.72)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            <Trophy size={13} style={{ color: '#E8D466' }} />
                            <span>{uni.qsRank}</span>
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.32rem 0.7rem',
                              borderRadius: 'var(--radius-pill, 9999px)',
                              backgroundColor: 'rgba(255, 255, 255, 0.94)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              color: '#19261F',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            <Landmark size={13} style={{ color: 'var(--action-primary, #245B42)' }} />
                            <span>{uni.institutionType}</span>
                          </span>
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.32rem 0.7rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            color: '#19261F',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: 'var(--action-primary, #245B42)' }} />
                          <span>Verified</span>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#8DBE3B',
                              display: 'inline-block',
                            }}
                          />
                        </span>
                      </div>

                      {/* University Identity (Logo, Name, Country, Tagline) */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1.25rem',
                          left: '1.15rem',
                          right: '1.15rem',
                          zIndex: 3,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '16px',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                              flexShrink: 0,
                              padding: '4px',
                              border: '1px solid rgba(255,255,255,0.8)',
                            }}
                          >
                            <UniversityLogoBadge universityId={uni.id} name={uni.name} size={50} />
                          </div>

                          <div style={{ overflow: 'hidden' }}>
                            <h3
                              style={{
                                fontSize: '1.28rem',
                                fontWeight: 800,
                                color: '#FFFFFF',
                                lineHeight: 1.2,
                                margin: '0 0 0.25rem',
                                letterSpacing: '-0.02em',
                                textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                              }}
                            >
                              {uni.name}
                            </h3>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                color: '#FFFFFF',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                              }}
                            >
                              <MapPin size={14} style={{ color: '#FFFFFF' }} />
                              <span>{uni.city}, {uni.country}</span>
                              <CountryFlagIcon countryCode={uni.countryCode} width={20} height={14} />
                            </div>
                          </div>
                        </div>

                        {/* Citron Accent Line & Tagline */}
                        <div style={{ marginTop: '0.55rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '2.5px',
                              backgroundColor: 'var(--brand-citron, #D7EE83)',
                              borderRadius: '2px',
                              marginBottom: '0.35rem',
                            }}
                          />
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255, 255, 255, 0.92)',
                              margin: 0,
                              fontWeight: 500,
                              lineHeight: 1.3,
                              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                            }}
                          >
                            {uni.motto}
                          </p>
                        </div>
                      </div>

                      <HeaderWaveTransition />
                    </div>

                    {/* Card Body */}
                    <div
                      style={{
                        padding: '1.25rem 1.35rem 1.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Floating Stats Capsule (Tuition & Programmes) */}
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E1E8DE',
                            borderRadius: '20px',
                            padding: '0.85rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                            marginBottom: '1rem',
                          }}
                        >
                          <CapsuleWaveWatermark />

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--action-primary, #245B42)',
                              }}
                            >
                              <GraduationCap size={22} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.78rem', color: '#5E7266', fontWeight: 600 }}>
                                Tuition
                              </div>
                              <div
                                style={{
                                  fontSize: '1.18rem',
                                  fontWeight: 800,
                                  color: 'var(--color-foreground, #19261F)',
                                  letterSpacing: '-0.02em',
                                  lineHeight: 1.2,
                                }}
                              >
                                {uni.tuitionDisplay}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '1px',
                              height: '36px',
                              backgroundColor: '#E1E8DE',
                              margin: '0 0.5rem',
                              zIndex: 1,
                            }}
                          />

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--action-primary, #245B42)',
                              }}
                            >
                              <LayoutGrid size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.78rem', color: '#5E7266', fontWeight: 600 }}>
                                Programmes
                              </div>
                              <div
                                style={{
                                  fontSize: '1.18rem',
                                  fontWeight: 800,
                                  color: 'var(--color-foreground, #19261F)',
                                  letterSpacing: '-0.02em',
                                  lineHeight: 1.2,
                                }}
                              >
                                {uni.programsCount}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tag Chips Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginBottom: '1rem',
                          }}
                        >
                          {uni.degreeLevels.map((lvl, lIdx) => (
                            <span
                              key={lIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.32rem 0.8rem',
                                borderRadius: 'var(--radius-pill, 9999px)',
                                backgroundColor: '#EEF5EF',
                                color: 'var(--color-foreground, #19261F)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: '1px solid #E1E8DE',
                              }}
                            >
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  backgroundColor: '#8DBE3B',
                                  display: 'inline-block',
                                }}
                              />
                              <span>{lvl}</span>
                            </span>
                          ))}

                          {uni.languages.map((lang, gIdx) => (
                            <span
                              key={gIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.32rem 0.8rem',
                                borderRadius: 'var(--radius-pill, 9999px)',
                                backgroundColor: '#EEF5EF',
                                color: 'var(--color-foreground, #19261F)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: '1px solid #E1E8DE',
                              }}
                            >
                              <Globe size={13} style={{ color: '#58695E' }} />
                              <span>{lang}</span>
                            </span>
                          ))}
                        </div>

                        {/* Information / Advisory Callout Box (Unclipped, Full Text Display) */}
                        <div
                          style={{
                            backgroundColor: '#EDF5EE',
                            borderRadius: '16px',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: '1.25rem',
                            minHeight: '68px',
                          }}
                        >
                          <SkylineWatermark />

                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--action-primary, #245B42)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '0.1rem',
                              zIndex: 1,
                            }}
                          >
                            <Info size={14} />
                          </div>

                          <div style={{ flex: 1, zIndex: 1, paddingRight: '2.5rem' }}>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: '#314438',
                                lineHeight: 1.45,
                                margin: 0,
                                fontWeight: 500,
                              }}
                            >
                              {uni.advisoryNote}
                            </p>
                          </div>

                          <div style={{ zIndex: 1, flexShrink: 0, color: 'var(--action-primary, #245B42)', marginTop: '0.1rem' }}>
                            <ArrowUpRight size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #F0F4EF',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(uni.id)}
                            aria-label={`Bookmark ${uni.name}`}
                            title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark university'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isBookmarked ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isBookmarked ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Bookmark size={17} fill={isBookmarked ? 'var(--action-primary, #245B42)' : 'none'} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(uni.id, uni.name)}
                            aria-label={`Share ${uni.name}`}
                            title={isCopied ? 'Link copied!' : 'Share link'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isCopied ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isCopied ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {isCopied ? <Check size={16} /> : <Share2 size={17} />}
                          </button>

                          {uni.officialPortalUrl && (
                            <a
                              href={uni.officialPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Visit official website for ${uni.name}`}
                              title="Visit official institution portal"
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                border: '1px solid #E1E8DE',
                                backgroundColor: '#FFFFFF',
                                color: '#4A5D52',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                transition: 'all 150ms ease',
                              }}
                            >
                              <ExternalLink size={17} />
                            </a>
                          )}
                        </div>

                        <div style={{ width: '1px', height: '28px', backgroundColor: '#E1E8DE' }} />

                        <Link
                          to={`${ROUTES.UNIVERSITIES}?country=${encodeURIComponent(uni.country)}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: '#0C3826',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(12, 56, 38, 0.28)',
                            transition: 'all 180ms ease',
                            whiteSpace: 'nowrap',
                          }}
                          className="opportunity-cta-btn"
                        >
                          <span>View Details</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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

        {/* =========================================================================
            TAB 2: SCHOLARSHIPS DISCOVERY (DISTINCT GRANT CERTIFICATE DESIGN)
            ========================================================================= */}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              {filteredScholarships.map((sch) => {
                const isBookmarked = bookmarkedIds.has(sch.id);
                const isCopied = copiedId === sch.id;

                return (
                  <div
                    key={sch.id}
                    className="opportunity-card-hover"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '24px',
                      border: '1px solid #DFE7DD',
                      boxShadow: '0 10px 30px -8px rgba(36, 91, 66, 0.08), 0 3px 10px rgba(0, 0, 0, 0.02)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 240ms ease',
                    }}
                  >
                    {/* Prestigious Grant Authority Certificate Header (Distinct from University) */}
                    <div
                      style={{
                        padding: '1.4rem 1.4rem 1.15rem',
                        background: 'linear-gradient(135deg, #F2F8F4 0%, #FFFFFF 100%)',
                        borderBottom: '1px solid #E4EDE2',
                        position: 'relative',
                      }}
                    >
                      {/* Top Row: Provider Emblem & Funding Ribbon Badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* Official Agency Logo / Crest */}
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '14px',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                              padding: '5px',
                              border: '1px solid #E1E8DE',
                              flexShrink: 0,
                            }}
                          >
                            {sch.partnerLogo ? (
                              <img
                                src={sch.partnerLogo}
                                alt={`${sch.provider} emblem`}
                                style={{
                                  maxHeight: '38px',
                                  maxWidth: '44px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                }}
                              />
                            ) : (
                              <Award size={26} style={{ color: 'var(--action-primary, #245B42)' }} />
                            )}
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--action-primary, #245B42)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              <span>{sch.authorityType}</span>
                              <span>•</span>
                              <CountryFlagIcon countryCode={sch.countryCode} width={16} height={11} />
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#58695E', fontWeight: 600 }}>
                              {sch.country}
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Funding Value Ribbon */}
                        <span
                          style={{
                            padding: '0.35rem 0.8rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: 'var(--brand-citron, #D7EE83)',
                            color: '#19261F',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Sparkles size={12} style={{ color: '#19261F' }} />
                          <span>{sch.fundingBadge}</span>
                        </span>
                      </div>

                      {/* Grant Title */}
                      <h3
                        style={{
                          fontSize: '1.18rem',
                          fontWeight: 800,
                          color: 'var(--color-foreground, #19261F)',
                          lineHeight: 1.3,
                          margin: '0 0 0.4rem',
                          letterSpacing: '-0.015em',
                        }}
                      >
                        {sch.name}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: '#58695E',
                          margin: 0,
                          lineHeight: 1.45,
                        }}
                      >
                        {sch.motto}
                      </p>
                    </div>

                    {/* Scholarship Distinct Body */}
                    <div
                      style={{
                        padding: '1.25rem 1.4rem 1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Financial Coverage Matrix Strip (Tuition, Stipend, Travel) */}
                        <div
                          style={{
                            backgroundColor: '#F6F9F6',
                            border: '1px solid #E1EAE0',
                            borderRadius: '16px',
                            padding: '0.85rem 1rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.5rem',
                            textAlign: 'center',
                            marginBottom: '1.15rem',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#6A7D71', fontWeight: 600 }}>
                              Tuition
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#19261F', marginTop: '0.15rem' }}>
                              {sch.tuitionCoverage}
                            </div>
                          </div>

                          <div style={{ borderLeft: '1px solid #E1E8DE', borderRight: '1px solid #E1E8DE' }}>
                            <div style={{ fontSize: '0.72rem', color: '#6A7D71', fontWeight: 600 }}>
                              Stipend
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--action-primary, #245B42)', marginTop: '0.15rem' }}>
                              {sch.monthlyStipend}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#6A7D71', fontWeight: 600 }}>
                              Travel
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#19261F', marginTop: '0.15rem' }}>
                              {sch.travelAllowance}
                            </div>
                          </div>
                        </div>

                        {/* Grant Target Level & Direct Coverage Text */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E3ECE4',
                            borderRadius: '12px',
                            padding: '0.65rem 0.9rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <GraduationCap size={16} style={{ color: 'var(--action-primary, #245B42)' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#19261F' }}>
                              {sch.targetLevel}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--action-primary, #245B42)',
                            }}
                          >
                            {sch.fundingValue}
                          </span>
                        </div>

                        {/* Statutory Criteria Bullet List */}
                        <div style={{ marginBottom: '1.15rem' }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#58695E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                            Eligibility Criteria
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {sch.keyCriteria.map((crit, cIdx) => (
                              <div
                                key={cIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.45rem',
                                  fontSize: '0.78rem',
                                  color: '#384C40',
                                  lineHeight: 1.4,
                                }}
                              >
                                <CheckCircle size={13} style={{ color: '#245B42', flexShrink: 0, marginTop: '0.15rem' }} />
                                <span>{crit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Annual Deadline Warning Strip */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '10px',
                            backgroundColor: '#FFF8E6',
                            border: '1px solid #F5E5B8',
                            color: '#7A5400',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            marginBottom: '1.25rem',
                          }}
                        >
                          <Calendar size={14} style={{ color: '#996B00', flexShrink: 0 }} />
                          <span>Next Application Deadline: <strong>{sch.annualDeadline}</strong></span>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          paddingTop: '0.65rem',
                          borderTop: '1px solid #F0F4EF',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(sch.id)}
                            aria-label={`Bookmark ${sch.name}`}
                            title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark grant'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isBookmarked ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isBookmarked ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Bookmark size={17} fill={isBookmarked ? 'var(--action-primary, #245B42)' : 'none'} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(sch.id, sch.name)}
                            aria-label={`Share ${sch.name}`}
                            title={isCopied ? 'Link copied!' : 'Share grant'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isCopied ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isCopied ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {isCopied ? <Check size={16} /> : <Share2 size={17} />}
                          </button>

                          {sch.officialPortalUrl && (
                            <a
                              href={sch.officialPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Visit official portal for ${sch.name}`}
                              title="Visit official authority portal"
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                border: '1px solid #E1E8DE',
                                backgroundColor: '#FFFFFF',
                                color: '#4A5D52',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                transition: 'all 150ms ease',
                              }}
                            >
                              <ExternalLink size={17} />
                            </a>
                          )}
                        </div>

                        <div style={{ width: '1px', height: '28px', backgroundColor: '#E1E8DE' }} />

                        <Link
                          to={`${ROUTES.SCHOLARSHIPS}?country=${encodeURIComponent(sch.country)}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: '#0C3826',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(12, 56, 38, 0.28)',
                            transition: 'all 180ms ease',
                            whiteSpace: 'nowrap',
                          }}
                          className="opportunity-cta-btn"
                        >
                          <span>Explore Grant</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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

        {/* =========================================================================
            TAB 3: PROFESSORS & RESEARCH (DISTINCT ACADEMIC FACULTY LAB DESIGN)
            ========================================================================= */}
        {activeTab === 'professors' && (
          <motion.div
            key="tab-professors"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Field Filter Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '2rem',
              }}
              role="tablist"
              aria-label="Filter professors by research specialization"
            >
              {researchTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedResearchTag === tag.id}
                  onClick={() => setSelectedResearchTag(tag.id)}
                  style={{
                    padding: '0.35rem 0.95rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: selectedResearchTag === tag.id ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                    backgroundColor: selectedResearchTag === tag.id ? 'var(--action-primary, #245B42)' : '#FFFFFF',
                    color: selectedResearchTag === tag.id ? '#FFFFFF' : 'var(--color-foreground-muted, #58695E)',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
              }}
            >
              {filteredProfessors.map((prof) => {
                const isBookmarked = bookmarkedIds.has(prof.id);
                const isCopied = copiedId === prof.id;

                return (
                  <div
                    key={prof.id}
                    className="opportunity-card-hover"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '24px',
                      border: '1px solid #DFE7DD',
                      boxShadow: '0 10px 30px -8px rgba(36, 91, 66, 0.08), 0 3px 10px rgba(0, 0, 0, 0.02)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 240ms ease',
                    }}
                  >
                    {/* Faculty Chair Header with Prominent Avatar Crest (Distinct from University) */}
                    <div
                      style={{
                        padding: '1.4rem 1.4rem 1.15rem',
                        background: 'linear-gradient(135deg, #122B1E 0%, #1E4632 100%)',
                        color: '#FFFFFF',
                        position: 'relative',
                      }}
                    >
                      {/* Top Badges Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.28rem 0.65rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: 'rgba(215, 238, 131, 0.15)',
                            border: '1px solid rgba(215, 238, 131, 0.35)',
                            color: 'var(--brand-citron, #D7EE83)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <Atom size={12} />
                          <span>{prof.disciplineBadge}</span>
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            style={{
                              padding: '0.28rem 0.65rem',
                              borderRadius: 'var(--radius-pill, 9999px)',
                              backgroundColor: 'rgba(255, 255, 255, 0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {prof.roleBadge}
                          </span>
                          <CountryFlagIcon countryCode={prof.countryCode} width={18} height={12} />
                        </div>
                      </div>

                      {/* Professor Profile: Avatar + Name + University */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
                        {/* Vector Avatar in Crest */}
                        <div
                          style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            padding: '2px',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ProfessorVectorAvatar professorId={prof.id} name={prof.professorName} size={64} />
                        </div>

                        <div style={{ overflow: 'hidden' }}>
                          <h3
                            style={{
                              fontSize: '1.24rem',
                              fontWeight: 800,
                              color: '#FFFFFF',
                              lineHeight: 1.2,
                              margin: '0 0 0.25rem',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {prof.professorName}
                          </h3>

                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255, 255, 255, 0.85)',
                              lineHeight: 1.3,
                              fontWeight: 500,
                            }}
                          >
                            {prof.university} • {prof.city}
                          </div>
                        </div>
                      </div>

                      {/* Tagline / Research Mission */}
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic' }}>
                          "{prof.motto}"
                        </p>
                      </div>
                    </div>

                    {/* Professor Distinct Body */}
                    <div
                      style={{
                        padding: '1.25rem 1.4rem 1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Laboratory Callout Strip */}
                        <div
                          style={{
                            backgroundColor: '#F3F8F5',
                            border: '1px solid #DFEDE5',
                            borderRadius: '14px',
                            padding: '0.75rem 0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            marginBottom: '1.15rem',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(36, 91, 66, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--action-primary, #245B42)',
                              flexShrink: 0,
                            }}
                          >
                            <FlaskConical size={18} />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.7rem', color: '#58695E', fontWeight: 600, textTransform: 'uppercase' }}>
                              Research Lab
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#19261F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prof.labName}
                            </div>
                          </div>
                        </div>

                        {/* Specialization & Open Topics Count Badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E1E8DE',
                            borderRadius: '12px',
                            padding: '0.65rem 0.9rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#19261F' }}>
                            {prof.specializationDisplay}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--action-primary, #245B42)',
                              backgroundColor: 'rgba(36, 91, 66, 0.08)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-pill, 9999px)',
                            }}
                          >
                            {prof.openTopicsCount} Open Tracks
                          </span>
                        </div>

                        {/* Active Open Research Topics (Distinct Feature) */}
                        <div style={{ marginBottom: '1.15rem' }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#58695E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                            Active Supervision Topics
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {prof.openTopics.map((top, tIdx) => (
                              <div
                                key={tIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.45rem',
                                  fontSize: '0.78rem',
                                  color: '#26382E',
                                  lineHeight: 1.35,
                                  backgroundColor: '#F9FBF9',
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '8px',
                                  border: '1px solid #EAF0E9',
                                }}
                              >
                                <BookOpen size={13} style={{ color: '#245B42', flexShrink: 0, marginTop: '0.15rem' }} />
                                <span>{top}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Supervision Terms & Advisory Strip */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginBottom: '1.25rem',
                          }}
                        >
                          {prof.degreeLevels.map((lvl, lIdx) => (
                            <span
                              key={lIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: 'var(--radius-pill, 9999px)',
                                backgroundColor: '#EEF5EF',
                                color: '#19261F',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8DBE3B' }} />
                              <span>{lvl}</span>
                            </span>
                          ))}

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-pill, 9999px)',
                              backgroundColor: '#EEF5EF',
                              color: '#19261F',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <Globe size={12} style={{ color: '#58695E' }} />
                            <span>{prof.languages[0]}</span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          paddingTop: '0.65rem',
                          borderTop: '1px solid #F0F4EF',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(prof.id)}
                            aria-label={`Bookmark ${prof.professorName}`}
                            title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark faculty'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isBookmarked ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isBookmarked ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <Bookmark size={17} fill={isBookmarked ? 'var(--action-primary, #245B42)' : 'none'} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(prof.id, prof.professorName)}
                            aria-label={`Share ${prof.professorName}`}
                            title={isCopied ? 'Link copied!' : 'Share profile'}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              border: '1px solid #E1E8DE',
                              backgroundColor: isCopied ? 'rgba(36, 91, 66, 0.1)' : '#FFFFFF',
                              color: isCopied ? 'var(--action-primary, #245B42)' : '#4A5D52',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {isCopied ? <Check size={16} /> : <Share2 size={17} />}
                          </button>
                        </div>

                        <div style={{ width: '1px', height: '28px', backgroundColor: '#E1E8DE' }} />

                        <Link
                          to={`${ROUTES.PROGRAMS}?country=${encodeURIComponent(prof.country)}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: '#0C3826',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(12, 56, 38, 0.28)',
                            transition: 'all 180ms ease',
                            whiteSpace: 'nowrap',
                          }}
                          className="opportunity-cta-btn"
                        >
                          <span>Explore Faculty</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
