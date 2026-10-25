import { OutboxEmailItem } from '@/types';
import { supabase } from '@/lib/supabase';

const LOCAL_EMAIL_SINK_STORAGE = 'unilistics_local_email_sink';

export function getLocalSinkEmails(): OutboxEmailItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EMAIL_SINK_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalSinkEmail(email: OutboxEmailItem): void {
  try {
    const current = getLocalSinkEmails();
    const updated = [email, ...current.filter((e) => e.id !== email.id)];
    localStorage.setItem(LOCAL_EMAIL_SINK_STORAGE, JSON.stringify(updated));
  } catch {
    // Ignore quota issues
  }
}

export function updateLocalSinkEmailStatus(
  id: string,
  deliveryStatus: 'queued' | 'sent' | 'failed' | 'simulated',
  deliveryError?: string
): void {
  try {
    const current = getLocalSinkEmails();
    const updated = current.map((e) =>
      e.id === id ? { ...e, deliveryStatus, deliveryError, retryCount: e.retryCount + 1 } : e
    );
    localStorage.setItem(LOCAL_EMAIL_SINK_STORAGE, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

/**
 * Retrieves outbox emails from live Supabase if connected, or local dev sink.
 */
export async function fetchOutboxEmails(): Promise<OutboxEmailItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('outbox_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          requestId: d.request_id,
          userId: d.user_id,
          recipientEmail: d.recipient_email,
          emailType: d.email_type,
          subject: d.subject,
          bodyText: d.body_text,
          linkUrl: d.link_url,
          deliveryStatus: d.delivery_status,
          deliveryError: d.delivery_error,
          retryCount: d.retry_count || 0,
          lastAttemptAt: d.last_attempt_at,
          createdAt: d.created_at,
        }));
      }
    } catch {
      // Fallback to local sink
    }
  }

  return getLocalSinkEmails();
}
