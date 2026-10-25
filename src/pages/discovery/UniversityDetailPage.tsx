import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { UserRole } from '@/types';
import {
  MapPin,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';

function getCountryFlag(country: string): string {
  const c = country.toLowerCase();
  if (c === 'germany' || c === 'de') return '🇩🇪';
  if (c === 'france' || c === 'fr') return '🇫🇷';
  if (c === 'italy' || c === 'it') return '🇮🇹';
  if (c === 'romania' || c === 'ro') return '🇷🇴';
  return '🇪🇺';
}

function getInitials(name: string): string {
  if (!name) return 'UN';
  const parts = name.replace(/University|of|the|and|de|di|für|und|Universitatea|din/gi, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const UniversityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('visitor');

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u?.role) {
        setCurrentUserRole(u.role);
      }
    });
  }, []);

  const isVisitor = currentUserRole === 'visitor';

  const { data: uni, isLoading, error, refetch } = useQuery({
    queryKey: ['university-detail', id, currentUserRole],
    queryFn: () => (id ? api.universities.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <LoadingState message="Loading university profile..." minHeight="350px" />;
  }

  // Safe access gate for visitors attempting to view restricted non-preview institutions
  if (isVisitor && (!uni || !uni.isPreview)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-[#ebe6de] shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#B4D0B6]/30 text-[#245B42] flex items-center justify-center mx-auto mb-4">
            <Lock size={22} aria-hidden="true" />
          </div>

          <h2 className="text-xl font-extrabold text-[#133827] mb-2">
            Restricted Institution Record
          </h2>
          <p className="text-sm text-[#55635a] mb-6 leading-relaxed">
            This university profile and its faculty listings require a verified Explorer account. Sign in or create a free account to view the full catalogue.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to={`/sign-in?returnUrl=/universities/${id}`}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#133827] bg-white border border-[#ebe6de] hover:bg-[#F7F9F7] shadow-sm transition-all"
            >
              Sign In
            </Link>
            <Link
              to={`/sign-up?returnUrl=/universities/${id}`}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
            >
              Create Free Account
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-[#ebe6de]">
            <Link to="/universities" className="text-xs font-semibold text-[#245B42] hover:underline">
              &larr; Return to Preview Universities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState
          title="University not found"
          message="The requested university record does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to="/universities" className="text-sm font-semibold text-[#245B42] hover:underline">
            &larr; Back to Universities Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const flag = getCountryFlag(uni.country);
  const initials = getInitials(uni.name);
  const isPublic = (uni.institutionalType || '').toLowerCase() === 'public';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Back to Catalogue Breadcrumb */}
      <div className="mb-5">
        <Link
          to="/universities"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245B42] hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to Universities</span>
        </Link>
      </div>

      {/* Main University Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
              {flag} {uni.country.charAt(0).toUpperCase() + uni.country.slice(1)}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isPublic ? 'bg-[#B4D0B6]/40 text-[#133827]' : 'bg-[#EDE7F6] text-[#5E35B1]'
              }`}
            >
              {uni.institutionalType ? uni.institutionalType.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>

          {uni.websiteUrl && (
            <a
              href={uni.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245B42] hover:underline"
            >
              <span>Official Institutional Portal</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F9F7] border border-[#ebe6de] flex items-center justify-center font-extrabold text-lg text-[#245B42] flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827] leading-tight">
              {uni.name}
            </h1>
            {uni.originalName && (
              <p className="text-sm text-[#55635a] italic mt-1">
                {uni.originalName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-[#55635a]">
              <MapPin size={16} className="text-[#245B42]" aria-hidden="true" />
              <span>{uni.city}, {uni.country.charAt(0).toUpperCase() + uni.country.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* University Attributes & Details Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Admission Model
          </span>
          <p className="text-sm font-bold text-[#133827]">
            {isPublic ? 'State Public Higher Education' : 'Accredited Private Higher Education'}
          </p>
          <p className="text-xs text-[#55635a] mt-1">
            {uni.tuitionBracket || 'Standard statutory semester contributions apply'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Indicative Ranking
          </span>
          <p className="text-sm font-bold text-[#133827]">
            {uni.ranking ? `Top #${uni.ranking} National / Regional` : 'Not published'}
          </p>
          <p className="text-xs text-[#55635a] mt-1">
            Informational benchmark; does not affect visa eligibility.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Verification Status
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#245B42]">
            <CheckCircle2 size={16} />
            <span>Ministry Verified Institution</span>
          </div>
          <p className="text-xs text-[#55635a] mt-1">
            Recognised by the National Ministry of Education &amp; HEC Pakistan.
          </p>
        </div>
      </div>

      {/* Available Programs at this University (Two-Tone Summary Panel) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#133827]">
              Published Degree Programs
            </h2>
            <p className="text-xs sm:text-sm text-[#55635a] mt-0.5">
              Degree curriculums offered by {uni.name} in this catalogue.
            </p>
          </div>
          <Link
            to={`/programs?search=${encodeURIComponent(uni.name)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B42] hover:underline"
          >
            <span>View in Programs Filter</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl bg-[#F7F9F7] p-5 border border-[#ebe6de] space-y-3 text-xs sm:text-sm text-[#2b352f]">
          <p>
            Curriculums indexed for {uni.name} include English and bilingual degree intakes. To review ECTS module structures, application intake deadlines, and portal prerequisites (Uni-Assist, Universitaly, or Campus France), browse all indexed programs.
          </p>
          <div className="pt-2 border-t border-[#ebe6de] flex items-center justify-between text-xs text-[#55635a]">
            <span>Corridor: {uni.country.charAt(0).toUpperCase() + uni.country.slice(1)}</span>
            <span className="text-[#245B42] font-semibold">Statutory admissions support available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;
