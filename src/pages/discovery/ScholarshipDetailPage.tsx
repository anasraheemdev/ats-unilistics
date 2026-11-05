import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Calendar,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Building2,
} from 'lucide-react';

function getCountryFlag(country: string): string {
  const c = country.toLowerCase();
  if (c === 'germany' || c === 'de') return '🇩🇪';
  if (c === 'france' || c === 'fr') return '🇫🇷';
  if (c === 'italy' || c === 'it') return '🇮🇹';
  if (c === 'romania' || c === 'ro') return '🇷🇴';
  return '🇪🇺';
}

export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const isStudentWorkspace = location.pathname.startsWith('/student');
  const backUrl = isStudentWorkspace ? '/student/scholarships' : '/scholarships';

  const { data: sch, isLoading, error, refetch } = useQuery({
    queryKey: ['scholarship-detail', id],
    queryFn: () => (id ? api.scholarships.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <LoadingState message="Loading scholarship profile..." minHeight="350px" />;
  }

  if (error || !sch) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState
          title="Scholarship not found"
          message="The requested scholarship scheme does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to={backUrl} className="text-sm font-semibold text-[#245B42] hover:underline">
            &larr; Back to Scholarships Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const flag = getCountryFlag(sch.country);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="mb-5">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245B42] hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to Scholarships</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
              {flag} {sch.country.charAt(0).toUpperCase() + sch.country.slice(1)}
            </span>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B4D0B6]/30 text-[#133827]">
              {sch.coverageType || 'VERIFIED GRANT'}
            </span>
          </div>

          {sch.officialUrl && (
            <a
              href={sch.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245B42] hover:underline"
            >
              <span>Official Scheme Website</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827] leading-tight mb-2">
          {sch.title}
        </h1>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#55635a]">
          <Building2 size={16} className="text-[#245B42]" aria-hidden="true" />
          <span>{sch.provider}</span>
        </div>
      </div>

      {/* Scholarship Attributes Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Funding Model &amp; Coverage
          </span>
          <p className="text-base font-bold text-[#133827]">
            {sch.coverageType}
          </p>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            Coverage guidelines are calibrated for Pakistani students applying to European partner institutions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Annual Application Window
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-[#133827]">
            <Calendar size={16} className="text-[#245B42]" />
            <span>{sch.applicationWindowText || 'Not published'}</span>
          </div>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            Applications are typically reviewed once per academic year preceding the autumn intake.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Pakistani Applicant Eligibility
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#245B42]">
            <CheckCircle2 size={16} />
            <span>Eligible for Pakistani Passport Holders</span>
          </div>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            Requires attested degree certificates and proof of university offer/admission.
          </p>
        </div>
      </div>

      {/* Eligibility Detail Panel */}
      {sch.eligibilitySummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm">
          <h2 className="text-lg font-bold text-[#133827] mb-3">
            Eligibility &amp; Selection Criteria
          </h2>
          <div className="rounded-2xl bg-[#F7F9F7] p-5 border border-[#ebe6de] text-xs sm:text-sm text-[#2b352f] leading-relaxed">
            {sch.eligibilitySummary}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipDetailPage;
