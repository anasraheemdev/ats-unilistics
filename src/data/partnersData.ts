/**
 * Canonical Partners & Institutional Network Data
 * Logos located at public/images/partners/
 */

export interface PartnerLogoItem {
  id: string;
  name: string;
  logoUrl: string;
  altText: string;
  country?: string;
  websiteUrl?: string;
}

export const PARTNER_LOGOS: PartnerLogoItem[] = [
  {
    id: 'daad',
    name: 'DAAD',
    logoUrl: '/images/partners/Daad.png',
    altText: 'DAAD - German Academic Exchange Service',
    country: 'Germany',
    websiteUrl: 'https://www.daad.de',
  },
  {
    id: 'uni-assist',
    name: 'uni-assist',
    logoUrl: '/images/partners/uniAssist.png',
    altText: 'uni-assist - Working Agency for Study Applications',
    country: 'Germany',
    websiteUrl: 'https://www.uni-assist.de',
  },
  {
    id: 'campus-france',
    name: 'Campus France',
    logoUrl: '/images/partners/logo-campus-france.png',
    altText: 'Campus France - French Agency for Higher Education',
    country: 'France',
    websiteUrl: 'https://www.campusfrance.org',
  },
  {
    id: 'mur-italy',
    name: 'MUR Italy',
    logoUrl: '/images/partners/MUR-logo.png',
    altText: 'Ministero dell\'Università e della Ricerca (MUR Italy)',
    country: 'Italy',
    websiteUrl: 'https://www.universitaly.it',
  },
  {
    id: 'ro-edu',
    name: 'Ministerul Educației România',
    logoUrl: '/images/partners/Sigiliu-guvernamental-si-identitate-ministeriala-RO.png',
    altText: 'Guvernul României - Ministerul Educației',
    country: 'Romania',
    websiteUrl: 'https://edu.gov.ro',
  },
  {
    id: 'erasmus',
    name: 'Erasmus+',
    logoUrl: '/images/partners/erasmus-1.png',
    altText: 'Erasmus+ Mobility Programme',
    country: 'European Union',
    websiteUrl: 'https://erasmus-plus.ec.europa.eu',
  },
  {
    id: 'hec-pakistan',
    name: 'HEC Pakistan',
    logoUrl: '/images/partners/higher-education-commission-pakistan-logo.png',
    altText: 'Higher Education Commission Pakistan',
    country: 'Pakistan',
    websiteUrl: 'https://www.hec.gov.pk',
  },
  {
    id: 'minister-de',
    name: 'Federal Education Authority',
    logoUrl: '/images/partners/minister.png',
    altText: 'Federal Higher Education & Ministerial Authority',
    country: 'Germany',
  },
  {
    id: 'budapest-met',
    name: 'Budapest Metropolitan University',
    logoUrl: '/images/partners/Budapest_Metropolitan_University.png',
    altText: 'Budapest Metropolitan University',
    country: 'Hungary',
    websiteUrl: 'https://www.metropolitan.hu',
  },
  {
    id: 'beykoz-uni',
    name: 'Beykoz University',
    logoUrl: '/images/partners/Turkey_Beykoz-University.png',
    altText: 'Beykoz University',
    country: 'Turkey',
    websiteUrl: 'https://www.beykoz.edu.tr',
  },
  {
    id: 'edufi',
    name: 'EDUFI',
    logoUrl: '/images/partners/edufi.png',
    altText: 'EDUFI - Finnish National Agency for Education',
    country: 'Finland',
    websiteUrl: 'https://www.oph.fi/en',
  },
  {
    id: 'united-health',
    name: 'United Health Insurance',
    logoUrl: '/images/partners/united-health-insurance.png',
    altText: 'United Health International Student Insurance',
    country: 'International',
  },
  {
    id: 'eu-flag',
    name: 'European Union Higher Education',
    logoUrl: '/images/partners/Flag_map_of_the_European_Union.png',
    altText: 'European Higher Education Area',
    country: 'European Union',
  },
];

// Backward-compatibility alias
export const PARTNERS_DATA = PARTNER_LOGOS;
