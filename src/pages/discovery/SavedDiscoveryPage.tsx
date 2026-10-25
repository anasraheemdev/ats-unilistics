import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { CatalogueProgramItem } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowRight, Trash2 } from 'lucide-react';

function getCountryFlag(country: string): string {
  const c = (country || '').toLowerCase();
  if (c === 'germany' || c === 'de') return '🇩🇪';
  if (c === 'france' || c === 'fr') return '🇫🇷';
  if (c === 'italy' || c === 'it') return '🇮🇹';
  if (c === 'romania' || c === 'ro') return '🇷🇴';
  return '🇪🇺';
}

function getTuitionText(tuitionEur?: number | null): string {
  if (tuitionEur === 0) {
    return '€0 Tuition (State Funded)';
  }
  if (tuitionEur != null && tuitionEur > 0) {
    return `€${tuitionEur.toLocaleString()}/yr`;
  }
  return 'Tuition not published';
}

export const SavedDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: savedPrograms, isLoading, error, refetch } = useQuery({
    queryKey: ['saved-programs'],
    queryFn: () => api.bookmarks.getBookmarkedPrograms(),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
      queryClient.invalidateQueries({ queryKey: ['discovery-programs'] });
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827]">
          Saved Degree Programs
        </h1>
        <p className="text-sm text-[#55635a] mt-1">
          Your bookmarked programs for comparative review and managed application support requests.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading saved programs..." minHeight="250px" />
      ) : error ? (
        <ErrorState
          title="Unable to load saved programs"
          message="Could not retrieve your bookmarked programs from server storage."
          onRetry={() => refetch()}
        />
      ) : !savedPrograms || savedPrograms.length === 0 ? (
        <EmptyState
          title="No saved programs yet"
          description="You haven't bookmarked any degree programs. Use the Degree Programs catalogue to bookmark curriculums of interest."
          actionLabel="Explore Programs Catalogue"
          onAction={() => navigate('/programs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPrograms.map((prog: CatalogueProgramItem) => {
            const flag = getCountryFlag(prog.country_name || prog.country_code);
            const tuitionStr = getTuitionText(prog.annual_tuition_eur);

            return (
              <div
                key={prog.id}
                className="rounded-[24px] bg-white border border-[#ebe6de] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
                      {flag} {(prog.country_name || prog.country_code).toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeBookmarkMutation.mutate(prog.id)}
                      title="Remove bookmark"
                      aria-label="Remove bookmark"
                      className="p-1.5 rounded-full text-[#8a9890] hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-[#55635a] mb-1 line-clamp-1">
                    {prog.university_name}
                  </p>

                  <h2 className="text-base font-bold text-[#133827] leading-snug mb-3 line-clamp-2">
                    {prog.program_name}
                  </h2>

                  {/* Two-Tone Summary Panel with Quiet Dividers */}
                  <div className="rounded-2xl bg-[#F7F9F7] p-3.5 mb-4 border border-[#ebe6de] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#133827]">
                      <span className="text-[#55635a]">Degree Level:</span>
                      <span className="font-semibold">
                        {prog.degree_level === 'bachelor' ? "Bachelor's" : "Master's"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#133827] pt-1.5 border-t border-[#ebe6de]">
                      <span className="text-[#55635a]">Tuition Rate:</span>
                      <span className="font-semibold">{tuitionStr}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ebe6de] flex items-center justify-between">
                  <span className="text-xs text-[#55635a]">Saved Curriculum</span>
                  <Link
                    to={`/programs/${prog.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B42] hover:underline"
                  >
                    <span>View details</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedDiscoveryPage;
