import React from 'react';
import { CaseTask } from '@/types';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Calendar, UserCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { ContextualHelp } from '@/components/domain/ContextualHelp';

interface TaskChecklistProps {
  tasks: CaseTask[];
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  title?: string;
}

const inferTaskContext = (title: string, desc?: string) => {
  const text = `${title} ${desc || ''}`.toLowerCase();
  if (text.includes('attestation') || text.includes('hec') || text.includes('ibcc') || text.includes('mofa')) {
    return { stage: 'attestation', docCat: 'hec_attestation' };
  }
  if (text.includes('blocked') || text.includes('sperrkonto') || text.includes('bank') || text.includes('financial')) {
    return { stage: 'visa_prep', docCat: 'blocked_account_proof' };
  }
  if (text.includes('vpd') || text.includes('uni-assist') || text.includes('admission') || text.includes('dossier')) {
    return { stage: 'submission', docCat: 'university_admission_letter' };
  }
  if (text.includes('visa') || text.includes('appointment') || text.includes('consular')) {
    return { stage: 'visa_prep', docCat: 'visa_application_dossier' };
  }
  return null;
};

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  title = 'Active Action Items & Attestation Tasks',
}) => {
  return (
    <Card padding="md" style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{title}</h3>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
          {tasks.filter((t) => t.status === 'completed').length} of {tasks.length} Completed
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task) => {
          const isDone = task.status === 'completed';
          const isStudent = task.assignedToRole === 'student';
          const ctx = inferTaskContext(task.title, task.description);

          return (
            <li
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.5rem',
                backgroundColor: isDone ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              {/* Accessible Checkbox */}
              <input
                type="checkbox"
                id={`task-check-${task.id}`}
                checked={isDone}
                onChange={() => onToggleTask?.(task.id)}
                style={{
                  marginTop: '0.25rem',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)',
                }}
                aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <label
                    htmlFor={`task-check-${task.id}`}
                    style={{
                      display: 'block',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: isDone ? 'var(--color-foreground-muted)' : 'var(--color-foreground)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      cursor: 'pointer',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {task.title}
                  </label>

                  {onDeleteTask && task.id.startsWith('task-custom-') && (
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-foreground-muted)',
                        padding: '2px',
                      }}
                      title="Delete case-specific task"
                      aria-label={`Delete custom task ${task.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {task.description && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-foreground-muted)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {task.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    fontSize: '0.75rem',
                    color: 'var(--color-foreground-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Assignee Badge */}
                    <Badge variant={isStudent ? 'info' : 'primary'} size="sm">
                      {isStudent ? (
                        <UserCheck size={12} aria-hidden="true" />
                      ) : (
                        <ShieldAlert size={12} aria-hidden="true" />
                      )}
                      <span>{isStudent ? 'Student Task' : 'Counsellor Action'}</span>
                    </Badge>

                    {/* Due Date */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} aria-hidden="true" />
                      <span>Due: {task.dueDate}</span>
                    </span>

                    {/* Status Badge */}
                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  {/* Contextual Procedural Help beside unfamiliar task */}
                  {ctx && (
                    <ContextualHelp
                      stage={ctx.stage}
                      documentCategory={ctx.docCat}
                      inlineVariant="button"
                      currentRole="managed_student"
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
