import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Building2,
  ExternalLink,
  ChevronLeft,
  Bookmark,
  Sparkles,
} from 'lucide-react';

function getCountryFlag(country: string): string {
  const c = country.toLowerCase();
  if (c === 'germany' || c === 'de') return '🇩🇪';
  if (c === 'france' || c === 'fr') return '🇫🇷';
  if (c === 'italy' || c === 'it') return '🇮🇹';
  if (c === 'romania' || c === 'ro') return '🇷🇴';
  return '🇪🇺';
}

function getTuitionDisplay(tuition?: number | null): { title: string; subtitle: string } {
  if (tuition === 0) {
    return {
      title: '€0 Tuition (State Funded)',
      subtitle: 'Statutory semester contributions (approx. €150–€350) cover transit pass and student services.',
    };
  }
  if (tuition != null && tuition > 0) {
    return {
      title: `€${tuition.toLocaleString()} / academic year`,
      subtitle: 'Indicative fee schedule for third-country international applicants.',
    };
  }
  return {
    title: 'Tuition not published',
    subtitle: 'Consult the university academic department or faculty fee statute for exact rates.',
  };
}

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: prog, isLoading, error, refetch } = useQuery({
    queryKey: ['program-detail', id],
    queryFn: () => (id ? api.programs.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading degree curriculum profile..." minHeight="350px" />;
  }

  if (error || !prog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState
          title="Degree Program not found"
          message="The requested degree program does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to="/programs" className="text-sm font-semibold text-[#245B42] hover:underline">
            &larr; Back to Degree Programs
          </Link>
        </div>
      </div>
    );
  }

  const flag = getCountryFlag(prog.country);
  const tuitionInfo = getTuitionDisplay(prog.tuitionPerYearEur);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="mb-5">
        <Link
          to="/programs"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245B42] hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to Degree Programs</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
              {flag} {prog.country.charAt(0).toUpperCase() + prog.country.slice(1)}
            </span>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B4D0B6]/30 text-[#133827]">
              {prog.degreeLevel === 'bachelor' ? "Bachelor's Degree" : "Master's Degree"}
            </span>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D7EE83]/30 text-[#133827]">
              {prog.instructionLanguage ? prog.instructionLanguage.toUpperCase() : 'ENGLISH'}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => prog && bookmarkMutation.mutate(prog.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#ebe6de] bg-[#F7F9F7] text-xs font-semibold text-[#133827] hover:bg-white transition-colors"
          >
            <Bookmark size={16} className="text-[#245B42]" />
            <span>Save Program</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827] leading-tight mb-2">
          {prog.title}
        </h1>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#55635a]">
          <Building2 size={16} className="text-[#245B42]" aria-hidden="true" />
          <span>{prog.universityName}</span>
        </div>
      </div>

      {/* Program Details Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Annual Tuition Benchmark
          </span>
          <p className="text-base font-bold text-[#133827]">
            {tuitionInfo.title}
          </p>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            {tuitionInfo.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Application Protocol &amp; Portal
          </span>
          <p className="text-base font-bold text-[#133827]">
            {(prog as any).applicationPortal || 'Uni-Assist / Direct University Submission'}
          </p>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            {prog.applicationDeadlineText ? `Upcoming Deadline: ${prog.applicationDeadlineText}` : 'Deadlines follow statutory winter/summer intake rounds.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] block mb-2">
            Language Benchmark
          </span>
          <p className="text-base font-bold text-[#133827]">
            {prog.instructionLanguage ? `${prog.instructionLanguage.toUpperCase()} Medium of Instruction` : 'English Proficiency'}
          </p>
          <p className="text-xs text-[#55635a] mt-1.5 leading-relaxed">
            IELTS Academic 6.5+ / TOEFL iBT 90+ typically expected unless prior English medium certificate is verified.
          </p>
        </div>
      </div>

      {/* Admission Requirements & Summary Panel */}
      {prog.admissionRequirementsSummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#133827] mb-3">
            Academic Prerequisite Summary
          </h2>
          <div className="rounded-2xl bg-[#F7F9F7] p-5 border border-[#ebe6de] text-xs sm:text-sm text-[#2b352f] leading-relaxed">
            {prog.admissionRequirementsSummary}
          </div>
        </div>
      )}

      {/* Managed Application Support CTA Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe6de] shadow-sm">
        <div className="flex items-center gap-2 text-[#245B42] mb-2">
          <Sparkles size={20} />
          <h2 className="text-lg font-bold text-[#133827]">
            Apply to this Program with Unilistics Managed Support
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#55635a] leading-relaxed mb-6">
          Our accredited counsellors oversee your entire dossier assembly, official HEC and MOFA apostille verification, VPD/pre-evaluation checks, portal submissions, and visa interview preparation.
        </p>
        <div>
          <Link
            to="/request-support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all no-underline"
          >
            <span>Request Managed Application Case</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
