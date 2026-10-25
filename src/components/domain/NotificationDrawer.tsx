import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { InAppNotification, NotificationPreference } from '@/types';
import {
  Bell,
  Check,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Clock,
  FileCheck2,
  AlertCircle,
  Globe,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // 1. Fetch In-App Notifications
  const { data: notifications } = useQuery({
    queryKey: ['in-app-notifications'],
    queryFn: () => api.notifications.getInAppNotifications(),
    refetchInterval: 15000,
  });

  // 2. Fetch User Preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.notifications.getPreferences(),
  });

  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreference>>({});

  // Sync initial prefs
  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  // Handle Escape key to close notifications popover
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.notifications.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] });
    },
  });

  // Save preferences
  const savePrefsMutation = useMutation({
    mutationFn: async () => api.notifications.updatePreferences(localPrefs),
    onSuccess: () => {
      setFeedback('Notification and timezone preferences updated.');
      setIsPreferencesOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const unreadCount = (notifications || []).filter((n: InAppNotification) => !n.isRead).length;
  const currentTimezone = preferences?.userTimezone || 'Asia/Karachi';

  const getEventIcon = (eventType?: string | null) => {
    switch (eventType) {
      case 'document_review':
        return <FileCheck2 size={14} style={{ color: 'var(--color-success)' }} aria-hidden="true" />;
      case 'task_due':
        return <Clock size={14} style={{ color: 'var(--color-warning)' }} aria-hidden="true" />;
      case 'stage_change':
        return <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />;
      default:
        return <AlertCircle size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`View notifications (${unreadCount} unread)`}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-foreground)',
          borderRadius: 'var(--radius-full)',
          minWidth: '44px',
          minHeight: '44px',
        }}
      >
        <Bell size={20} strokeWidth={2} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--color-destructive)',
              color: 'var(--color-destructive-foreground, #ffffff)',
              borderRadius: '50%',
              fontSize: '0.625rem',
              fontWeight: 800,
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              padding: '0 3px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-panel)',
            boxShadow: 'var(--shadow-floating)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-hover)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground)' }}>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="primary" size="sm">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(true)}
                title="Configure notification and timezone preferences"
                aria-label="Configure notification and timezone preferences"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-foreground-muted)',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications popover"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-foreground-muted)',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {feedback && (
            <div style={{ padding: '0.5rem 1rem' }}>
              <Alert variant="success">{feedback}</Alert>
            </div>
          )}

          {/* Timezone Indicator Banner */}
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary-light)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              color: 'var(--color-foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Globe size={13} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <span>
              Displaying times in <strong>{currentTimezone}</strong>
            </span>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {!notifications || notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-foreground-muted)', fontSize: '0.8125rem' }}>
                No notifications in your inbox.
              </div>
            ) : (
              notifications.map((n: InAppNotification) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(36, 91, 66, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {getEventIcon(n.eventType)}
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--color-foreground)' }}>{n.title}</strong>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(n.id)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-primary)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground)', margin: 0, lineHeight: 1.4 }}>
                    {n.body}
                  </p>

                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', marginTop: '2px' }}>
                    {formatUtcInTimezone(n.createdAt, currentTimezone)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {isPreferencesOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 21, 17, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
          onClick={() => setIsPreferencesOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-panel)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-floating)',
              border: '1px solid var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={18} strokeWidth={2} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground)', fontFamily: 'var(--font-family-base)' }}>
                  Notification Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                aria-label="Close preferences"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)', padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mandatory Account Security Exemption Alert */}
            <Alert variant="info" title="Essential Security Guarantee">
              Account-security alerts (such as email activation links, verification codes, and password recoveries) are mandatory and will always be delivered to your verified email address regardless of these toggles.
            </Alert>

            {/* Preferences Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Checkbox
                label="Email Notifications (Transactional Summaries)"
                checked={localPrefs.emailNotifications !== false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, emailNotifications: e.target.checked })}
              />

              <Checkbox
                label="In-App Notification Alerts"
                checked={localPrefs.inAppNotifications !== false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, inAppNotifications: e.target.checked })}
              />

              <Checkbox
                label="Action Task & Attestation Reminders"
                checked={localPrefs.taskReminders !== false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, taskReminders: e.target.checked })}
              />

              <Checkbox
                label="Case Stage Updates & Admission Decisions"
                checked={localPrefs.caseUpdates !== false}
                onChange={(e) => setLocalPrefs({ ...localPrefs, caseUpdates: e.target.checked })}
              />

              {/* Timezone Selector */}
              <div style={{ marginTop: '0.5rem' }}>
                <Select
                  label="Display Timezone"
                  value={localPrefs.userTimezone || 'Asia/Karachi'}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, userTimezone: e.target.value })}
                  options={[
                    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT, UTC+5)' },
                    { value: 'Europe/Berlin', label: 'Central European Time (Berlin/Munich, CET/CEST)' },
                    { value: 'Europe/Paris', label: 'Central European Time (Paris, CET/CEST)' },
                    { value: 'Europe/Rome', label: 'Central European Time (Rome, CET/CEST)' },
                    { value: 'Europe/Bucharest', label: 'Eastern European Time (Bucharest, EET/EEST)' },
                    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
                  ]}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Institution deadlines are preserved in their official destination timezone date semantics.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" size="sm" onClick={() => setIsPreferencesOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => savePrefsMutation.mutate()}
                disabled={savePrefsMutation.isPending}
              >
                {savePrefsMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
