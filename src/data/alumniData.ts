/**
 * Synthetic Alumni Success Stories Data
 * Represents peer journeys of Pakistani students who successfully enrolled
 * in Germany, France, Italy, and Romania through structured casework.
 * 
 * Strict Synthetic Mandate: All student names, portraits, and quotes
 * are realistic synthetic demonstration data and not real individual PII.
 */

export interface AlumniProfile {
  id: string;
  name: string;
  homeCity: string;
  destinationCountry: 'Germany' | 'France' | 'Italy' | 'Romania';
  countryCode: 'de' | 'fr' | 'it' | 'ro';
  countryFlag: string;
  university: string;
  degreeTitle: string;
  degreeLevel: 'Bachelor' | 'Master' | 'Medicine';
  intakeTerm: string;
  photoUrl: string;
  verifiedBadge: string;
  tuitionModel: string;
  scholarshipOrGrant?: string;
  quote: string;
  fullStory: string;
  keyStats: { label: string; value: string }[];
}

export const ALUMNI_STORIES: AlumniProfile[] = [
  {
    id: 'alumni-zainab',
    name: 'Zainab Malik',
    homeCity: 'Lahore',
    destinationCountry: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    university: 'Technical University of Munich (TUM)',
    degreeTitle: 'M.Sc. Informatics',
    degreeLevel: 'Master',
    intakeTerm: 'Winter Semester 2025/26',
    photoUrl: '/images/student_campus_portrait.jpg',
    verifiedBadge: 'APS 1.2 Passed • TUM Admitted',
    tuitionModel: '€0 Statutory Tuition (€152 semester fee)',
    scholarshipOrGrant: 'Working Student Research Assistantship',
    quote: 'The procedural audit cleared my HEC degree attestation and APS queue without a single rejected document.',
    fullStory: 'Coming from FAST-NUCES in Lahore, I was overwhelmed by the German APS requirements and conflicting Facebook group advice. Unilistics audited my transcript, calculated my exact Bavarian Formula GPA (1.2), and ensured my HEC attestations followed the required sequence. I received my TUM offer within 4 weeks of portal submission.',
    keyStats: [
      { label: 'Bavarian GPA', value: '1.2' },
      { label: 'Tuition Fee', value: '€0 / year' },
      { label: 'APS Processing', value: 'Verified' },
    ],
  },
  {
    id: 'alumni-hamza',
    name: 'Hamza Raza',
    homeCity: 'Karachi',
    destinationCountry: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    university: 'Sorbonne University, Paris',
    degreeTitle: 'Master in Applied Data Analytics & AI',
    degreeLevel: 'Master',
    intakeTerm: 'Autumn Intake 2025',
    photoUrl: '/images/hero_student_europe.jpg',
    verifiedBadge: 'Eiffel Scholar • EEF Verified',
    tuitionModel: 'Full Tuition Exemption',
    scholarshipOrGrant: 'Eiffel Excellence Grant (€1,181/month)',
    quote: 'From my Campus France interview in Islamabad to securing the Eiffel scholarship in Paris, every step was planned.',
    fullStory: 'Securing an Eiffel Excellence scholarship requires early submission and academic alignment. Unilistics guided my Études en France (EEF) dossier, helped me articulate my research intent for Sorbonne professors, and practiced my consular interview questions. Living in Paris with full funding felt impossible until the acceptance letter arrived.',
    keyStats: [
      { label: 'Monthly Stipend', value: '€1,181' },
      { label: 'Tuition Status', value: '100% Exempt' },
      { label: 'Visa Track', value: 'EEF Pre-Consular' },
    ],
  },
  {
    id: 'alumni-areeba',
    name: 'Areeba Siddiqui',
    homeCity: 'Islamabad',
    destinationCountry: 'Italy',
    countryCode: 'it',
    countryFlag: '🇮🇹',
    university: 'Politecnico di Milano',
    degreeTitle: 'M.Sc. Mechanical & Automotive Systems',
    degreeLevel: 'Master',
    intakeTerm: 'Autumn Intake 2025',
    photoUrl: '/images/student_library_explorer.jpg',
    verifiedBadge: 'DSU Grantee • CIMEA Verified',
    tuitionModel: '€0 Tuition via Regional DSU Waiver',
    scholarshipOrGrant: 'DSU Full Lodging & Food Grant (€7,200/year)',
    quote: 'Italian DSU paperwork can be intimidating, but our translated income declaration was accepted on first submission.',
    fullStory: 'Studying automotive engineering at PoliMi was my dream. The challenge was navigating Universitaly pre-enrollment and compiling the Italian DSU financial dossier from Pakistan. Unilistics reviewed my family income certificates, oversaw the sworn Italian translation and Apostille, and secured my subsidized accommodation in Milan.',
    keyStats: [
      { label: 'DSU Regional Grant', value: '€7,200/yr' },
      { label: 'Accommodations', value: 'Subsidized' },
      { label: 'CIMEA Comparability', value: 'Validated' },
    ],
  },
  {
    id: 'alumni-usama',
    name: 'Usama Farooq',
    homeCity: 'Peshawar',
    destinationCountry: 'Romania',
    countryCode: 'ro',
    countryFlag: '🇷🇴',
    university: 'Carol Davila University of Medicine & Pharmacy',
    degreeTitle: 'Doctor of Medicine (M.D.)',
    degreeLevel: 'Medicine',
    intakeTerm: 'Autumn Intake 2025',
    photoUrl: '/images/student_counselor_guidance.jpg',
    verifiedBadge: 'Ministry Letter Issued • PMC/WHO Indexed',
    tuitionModel: '€6,000 / year (Standard Fixed Rate)',
    scholarshipOrGrant: 'Ministry English-Medium Clinical Track',
    quote: 'Romania offered direct European medical licensing in English without intermediate foundation delays.',
    fullStory: 'After completing FSc Pre-Medical in Peshawar, public MDCAT competition felt congested. Unilistics showed me that Romanian medical universities are accredited across the EU and recognized by the Pakistan Medical and Dental Council. My educational file was submitted to the Ministry of Education in Bucharest, and I received my official Scrisoare de Acceptare.',
    keyStats: [
      { label: 'Program Language', value: '100% English' },
      { label: 'Clinical Rotations', value: 'Bucharest Univ Hospital' },
      { label: 'EU Medical License', value: 'Directly Recognized' },
    ],
  },
  {
    id: 'alumni-bilawal',
    name: 'Bilawal Shah',
    homeCity: 'Rawalpindi',
    destinationCountry: 'Germany',
    countryCode: 'de',
    countryFlag: '🇩🇪',
    university: 'RWTH Aachen University',
    degreeTitle: 'M.Sc. Electrical & Sustainable Power',
    degreeLevel: 'Master',
    intakeTerm: 'Winter Semester 2025/26',
    photoUrl: '/images/auth_split_student.jpg',
    verifiedBadge: 'APS Certified • Uni-assist VPD Validated',
    tuitionModel: '€0 Tuition (€310 semester contribution with NRW rail)',
    scholarshipOrGrant: 'Fraunhofer Institute Research Trainee',
    quote: 'Knowing my university in Aachen gave me free state-wide train travel made living in Germany affordable from day one.',
    fullStory: 'RWTH Aachen has strict prerequisites for credit equivalence in mathematics and electrical circuits. With Unilistics, we mapped my BS Electrical Engineering transcript from NUST against the RWTH module catalogue to prove prerequisite alignment before paying the uni-assist processing fee. Today I conduct lab research on renewable grids in North Rhine-Westphalia.',
    keyStats: [
      { label: 'Course Credits', value: '120 ECTS' },
      { label: 'Transit Pass', value: 'NRW State Ticket' },
      { label: 'Living Benchmark', value: '€992 / mo' },
    ],
  },
  {
    id: 'alumni-mahnoor',
    name: 'Mahnoor Tariq',
    homeCity: 'Faisalabad',
    destinationCountry: 'France',
    countryCode: 'fr',
    countryFlag: '🇫🇷',
    university: 'Sciences Po Paris',
    degreeTitle: 'Master in International Public Management',
    degreeLevel: 'Master',
    intakeTerm: 'Fall Intake 2025',
    photoUrl: '/images/guidance_intro_visual.jpg',
    verifiedBadge: 'Émile Boutmy Awardee • Campus France Cleared',
    tuitionModel: 'Tuition Grant Co-Financed',
    scholarshipOrGrant: 'Émile Boutmy Merit Award (€12,200/year)',
    quote: 'Crafting a competitive French personal statement requires an academic philosophy that Unilistics helped me refine.',
    fullStory: 'Sciences Po is ranked top 3 globally for politics and international studies. With Unilistics counsellors reviewing my CV and drafting guidance for the Émile Boutmy scholarship essay, I presented a clear narrative about Pakistan’s public administration challenges. I arrived in Paris with an established network and housing support.',
    keyStats: [
      { label: 'Merit Award', value: '€12,200 / yr' },
      { label: 'Global Rank', value: '#3 Politics' },
      { label: 'EEF Approval', value: '100% Verified' },
    ],
  },
];
