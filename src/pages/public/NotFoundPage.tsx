import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';
import { Compass, Home, Building2 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <Card padding="lg">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--accent-peach-bg)',
            color: 'var(--action-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
          aria-hidden="true"
        >
          <Compass size={32} />
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-charcoal)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Page Not Found (404)
        </h1>

        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.5rem',
          }}
        >
          The destination URL you requested does not exist or was malformed. Protected dashboards and operational desks cannot be accessed through arbitrary or concatenated addresses.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to={ROUTES.HOME} style={{ textDecoration: 'none' }}>
            <Button variant="primary" leftIcon={<Home size={16} />}>
              Back to Home
            </Button>
          </Link>

          <Link to={ROUTES.UNIVERSITIES} style={{ textDecoration: 'none' }}>
            <Button variant="outline" leftIcon={<Building2 size={16} />}>
              Explore Universities
            </Button>
          </Link>

          <Link to={ROUTES.CONTACT} style={{ textDecoration: 'none' }}>
            <Button variant="secondary">
              Contact Desk
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
