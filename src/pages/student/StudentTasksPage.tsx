import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TaskChecklist } from '@/components/domain/TaskChecklist';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Info, PlusCircle, X } from 'lucide-react';

export const StudentTasksPage: React.FC = () => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState<'student' | 'counsellor'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['student-all-tasks'],
    queryFn: () => api.student.getTasks(),
  });

  const handleToggle = async (taskId: string) => {
    await api.student.toggleTask(taskId);
    refetch();
  };

  const handleDelete = async (taskId: string) => {
    await api.student.deleteTask(taskId);
    refetch();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await api.student.createTask({
        caseId: 'case-demo-pk-de-089',
        title: newTitle,
        description: newDesc || undefined,
        dueDate: newDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        assignedToRole: newAssignee,
        createdAt: new Date().toISOString(),
      });
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setIsAddingTask(false);
      refetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Case Action Tasks & Country Checklists</h1>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Interactive case-specific checklist assigned by your educational counsellor to ensure timely dossier compilation and visa filing.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddingTask(true)}
          leftIcon={<PlusCircle size={15} />}
        >
          Add Case-Specific Action
        </Button>
      </div>

      <Card padding="md" style={{ backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-info)', fontWeight: 600, fontSize: '0.875rem' }}>
          <Info size={16} aria-hidden="true" />
          <span>Task Accountability Protocol</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground)', marginTop: '0.25rem' }}>
          Tasks marked with a student badge require your direct physical or digital action (e.g., dispatching courier packets,
          depositing blocked funds). Tasks marked with a counsellor badge are executed by staff on external portals.
          Case-specific checklists remain editable and tailored to your target country requirements.
        </p>
      </Card>

      {/* Add Task Modal */}
      {isAddingTask && (
        <Card padding="lg" style={{ border: '2px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Add Case-Specific Checklist Task</h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Action Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Schedule German Embassy Islamabad slot via VFS Global"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Target Due Date"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />

              <Select
                label="Assignee"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value as any)}
                options={[
                  { value: 'student', label: 'Student Direct Action' },
                  { value: 'counsellor', label: 'Counsellor Portal Execution' },
                ]}
              />
            </div>

            <Textarea
              label="Detailed Instructions / Requirements"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Specify requirements, links, or documents to bring..."
              rows={3}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || !newTitle.trim()}>
                {isSubmitting ? 'Saving...' : 'Add to Checklist'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <LoadingState message="Loading action checklists..." />}
      {error && <ErrorState message="Could not load case tasks." onRetry={() => refetch()} />}

      {!isLoading && !error && tasks && (
        <TaskChecklist
          tasks={tasks}
          onToggleTask={handleToggle}
          onDeleteTask={handleDelete}
          title="All Action Items for Active Intake"
        />
      )}
    </div>
  );
};
