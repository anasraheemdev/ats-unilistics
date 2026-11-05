/**
 * Student Ambassadors Video Testimonials Data
 * Authentic video-format insights from student ambassadors across Germany, France, Italy, and Romania.
 * 
 * Strict Synthetic Mandate: All student names, portraits, and transcripts
 * are realistic synthetic demonstration data and not real individual PII.
 */

export interface AmbassadorVideo {
  id: string;
  name: string;
  homeCity: string;
  destinationCountry: 'Germany' | 'France' | 'Italy' | 'Romania';
  countryFlag: string;
  university: string;
  roleTitle: string;
  videoTitle: string;
  topicTag: string;
  duration: string;
  thumbnailUrl: string;
  featuredQuote: string;
  transcriptExcerpt: string;
  keyAdvice: string[];
}

export const AMBASSADOR_VIDEOS: AmbassadorVideo[] = [
  {
    id: 'video-bilal-munich',
    name: 'Muhammad Bilal',
    homeCity: 'Lahore',
    destinationCountry: 'Germany',
    countryFlag: '🇩🇪',
    university: 'Technical University of Munich',
    roleTitle: 'TUM Student Ambassador • Informatics M.Sc.',
    videoTitle: 'Navigating the German APS Process & Settling in Munich',
    topicTag: 'APS & Consular Verification',
    duration: '3:45',
    thumbnailUrl: '/images/hero_student_europe.jpg',
    featuredQuote: 'The APS certificate was the biggest hurdle for everyone applying from Pakistan. Here is my exact timeline and how I organized my HEC files.',
    transcriptExcerpt: 'When the German embassy made APS mandatory for Pakistani applicants in 2023, everyone was panicking about timeline delays. My biggest advice is: do not send random photocopies. Make sure your HEC attestation tickets are resolved in order, translate any Urdu birth or matric certificates with verified stamps, and track your parcel tracking number immediately. Once my APS arrived, the visa appointment in Islamabad was straightforward.',
    keyAdvice: [
      'Submit your HEC verification 2 months before semester deadlines',
      'Use the official Bavarian formula calculator for GPA matching',
      'Apply for Studentenwerk dormitories the day you get your offer',
    ],
  },
  {
    id: 'video-ayesha-paris',
    name: 'Ayesha Siddiqui',
    homeCity: 'Karachi',
    destinationCountry: 'France',
    countryFlag: '🇫🇷',
    university: 'Sorbonne University, Paris',
    roleTitle: 'Campus France Fellow • Data Analytics',
    videoTitle: 'The Campus France Interview: Exactly What They Asked Me',
    topicTag: 'Campus France EEF Interview',
    duration: '2:50',
    thumbnailUrl: '/images/student_library_explorer.jpg',
    featuredQuote: 'The interview at Alliance Française was respectful and conversational. They care deeply about your coherent academic project.',
    transcriptExcerpt: 'In Pakistan, students often think the Campus France interview is an interrogation or an English exam. It is not. It is an academic project review. They asked me: Why France instead of the UK? Which professors at Sorbonne do research related to your thesis? How will you finance your living costs? Having my dossier audited beforehand gave me complete confidence.',
    keyAdvice: [
      'Memorize your course modules and 2 specific professors in your department',
      'Bring clear evidence of financial autonomy (blocked account or sponsor)',
      'Highlight how the French academic ecosystem fits your 5-year career goal',
    ],
  },
  {
    id: 'video-daniyal-milan',
    name: 'Daniyal Qureshi',
    homeCity: 'Islamabad',
    destinationCountry: 'Italy',
    countryFlag: '🇮🇹',
    university: 'Politecnico di Milano',
    roleTitle: 'PoliMi Ambassador • Automotive Systems',
    videoTitle: 'Securing the Italian DSU Scholarship & Free Housing in Milan',
    topicTag: 'DSU Grant & CIMEA',
    duration: '3:15',
    thumbnailUrl: '/images/student_campus_portrait.jpg',
    featuredQuote: 'Milan is vibrant, but rent can be high. Getting the regional DSU scholarship covered my university fees and gave me a dorm room.',
    transcriptExcerpt: 'Italian regional scholarships like DSU in Lombardy or EDISU in Piedmont are based on family economic indicators (ISEE Parificato). You have to get your FBR tax returns and family registration certificate (FRC) translated into Italian and verified with the Italian consular chancery. If you submit before the July deadline, you can study in Italy with virtually zero debt.',
    keyAdvice: [
      'Start family income sworn translations in May, not August',
      'Apply via Universitaly as soon as the portal opens for the intake',
      'Request your CIMEA Statement of Comparability early to avoid consular bottlenecks',
    ],
  },
  {
    id: 'video-sara-bucharest',
    name: 'Dr. Sara Khan',
    homeCity: 'Peshawar',
    destinationCountry: 'Romania',
    countryFlag: '🇷🇴',
    university: 'Carol Davila Medicine, Bucharest',
    roleTitle: 'Medical Scholar • General Medicine',
    videoTitle: 'Studying Medicine in English: Realities & Clinical Practice',
    topicTag: 'Direct Ministry Medical Admission',
    duration: '4:10',
    thumbnailUrl: '/images/student_counselor_guidance.jpg',
    featuredQuote: 'Romania gave me direct entry to an EU-accredited medical degree in English without foundation years or entrance exam bottlenecks.',
    transcriptExcerpt: 'For Pakistani pre-medical students looking for internationally accredited medical universities, Romania is one of Europe’s best-kept opportunities. The entire 6-year MD curriculum is taught in English. By year three, you begin clinical rotations in teaching hospitals. The living costs in Bucharest are very affordable compared to Western Europe.',
    keyAdvice: [
      'Ensure FSc marks are above 70% for strong ministry evaluation',
      'Submit health fitness and police character certificates with MOFA stamps',
      'Budget approximately €400 to €550 monthly for living expenses in Romania',
    ],
  },
];
