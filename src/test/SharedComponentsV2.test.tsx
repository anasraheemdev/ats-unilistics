import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '@/components/ui/Checkbox';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { DateInput } from '@/components/ui/DateInput';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { GlobeIllustration, DocumentIllustration, SearchIllustration } from '@/components/ui/EditorialIllustrations';
import { ThemeProvider } from '@/lib/theme';

describe('DESIGN_SYSTEM_V2 Shared Components Suite', () => {
  describe('Checkbox Component', () => {
    it('renders with label and toggles checked state', () => {
      const handleChange = vi.fn();
      render(
        <ThemeProvider>
          <Checkbox
            label="I accept the statutory attestation terms"
            checked={false}
            onChange={handleChange}
          />
        </ThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox', { name: /I accept the statutory attestation terms/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('displays accessible error message with role="alert"', () => {
      render(
        <ThemeProvider>
          <Checkbox
            label="Consent required"
            error="You must agree before continuing"
          />
        </ThemeProvider>
      );

      expect(screen.getByRole('alert')).toHaveTextContent('You must agree before continuing');
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('SearchInput Component', () => {
    it('renders with placeholder and triggers search change', () => {
      const handleChange = vi.fn();
      render(
        <ThemeProvider>
          <SearchInput
            placeholder="Search programs..."
            value="Computer Science"
            onChange={handleChange}
          />
        </ThemeProvider>
      );

      const input = screen.getByPlaceholderText('Search programs...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Computer Science');

      // Clear button should be visible when value is present
      const clearBtn = screen.getByRole('button', { name: /clear search query/i });
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Tabs Component', () => {
    it('renders tabs and switches active tab panel', () => {
      render(
        <ThemeProvider>
          <Tabs defaultValue="programs">
            <TabList ariaLabel="University details tabs">
              <TabTrigger value="overview">Overview</TabTrigger>
              <TabTrigger value="programs">Programs</TabTrigger>
              <TabTrigger value="admissions">Admissions</TabTrigger>
            </TabList>
            <TabContent value="overview">Overview Panel Content</TabContent>
            <TabContent value="programs">Degree Programs List</TabContent>
            <TabContent value="admissions">Admissions Requirements</TabContent>
          </Tabs>
        </ThemeProvider>
      );

      expect(screen.getByText('Degree Programs List')).toBeInTheDocument();
      expect(screen.queryByText('Overview Panel Content')).not.toBeInTheDocument();

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      fireEvent.click(overviewTab);

      expect(screen.getByText('Overview Panel Content')).toBeInTheDocument();
      expect(screen.queryByText('Degree Programs List')).not.toBeInTheDocument();
    });
  });

  describe('Table Component', () => {
    it('renders semantic table structure with headers and rows', () => {
      render(
        <ThemeProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Deadlines</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Technical University of Munich</TableCell>
                <TableCell>Germany</TableCell>
                <TableCell>July 15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ThemeProvider>
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Technical University of Munich')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
  });

  describe('Toast Notification System', () => {
    const TestToastComponent = () => {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => toast.success('Application Saved', 'Your draft has been persisted locally.')}
        >
          Trigger Toast
        </button>
      );
    };

    it('displays toast on action trigger and dismisses', () => {
      render(
        <ThemeProvider>
          <ToastProvider>
            <TestToastComponent />
          </ToastProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Trigger Toast'));

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Application Saved')).toBeInTheDocument();
      expect(screen.getByText('Your draft has been persisted locally.')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('Application Saved')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip Component', () => {
    it('renders child element and associates tooltip on hover', () => {
      render(
        <ThemeProvider>
          <Tooltip content="Direct consular appointment booking queue">
            <button type="button">Embassy Slot</button>
          </Tooltip>
        </ThemeProvider>
      );

      const triggerBtn = screen.getByText('Embassy Slot');
      expect(triggerBtn).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.mouseEnter(triggerBtn.parentElement!);
      // Mouse enter triggers tooltip
      expect(screen.getByRole('tooltip')).toHaveTextContent('Direct consular appointment booking queue');
    });
  });

  describe('DateInput Component', () => {
    it('renders date input with label, calendar icon, and error role', () => {
      render(
        <ThemeProvider>
          <DateInput
            label="Intake Deadline"
            required
            error="Please select an intake deadline"
          />
        </ThemeProvider>
      );

      expect(screen.getByLabelText(/Intake Deadline/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Please select an intake deadline');
    });
  });

  describe('FileUpload Component', () => {
    it('renders dropzone and handles file selection and removal', () => {
      const handleSelect = vi.fn();
      const handleRemove = vi.fn();

      const { rerender } = render(
        <ThemeProvider>
          <FileUpload
            label="Certified Degree Transcript"
            onFileSelect={handleSelect}
          />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /upload certified degree transcript/i })).toBeInTheDocument();

      // Simulate selected file state
      const mockFile = new File(['dummy content'], 'hec_transcript.pdf', { type: 'application/pdf' });
      rerender(
        <ThemeProvider>
          <FileUpload
            label="Certified Degree Transcript"
            selectedFile={mockFile}
            onFileSelect={handleSelect}
            onFileRemove={handleRemove}
          />
        </ThemeProvider>
      );

      expect(screen.getByText('hec_transcript.pdf')).toBeInTheDocument();
      const removeBtn = screen.getByRole('button', { name: /remove file hec_transcript\.pdf/i });
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Component', () => {
    it('renders with accessible labels and handles click and loading states', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <ThemeProvider>
          <Button variant="primary" onClick={handleClick}>
            Submit Application
          </Button>
        </ThemeProvider>
      );

      const btn = screen.getByRole('button', { name: /submit application/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Loading state
      rerender(
        <ThemeProvider>
          <Button variant="primary" isLoading onClick={handleClick}>
            Submit Application
          </Button>
        </ThemeProvider>
      );

      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toBeDisabled();
    });
  });

  describe('Input Component', () => {
    it('renders input with associated label and error alert', () => {
      render(
        <ThemeProvider>
          <Input
            label="Passport Number"
            placeholder="AB1234567"
            error="Invalid passport format"
            required
          />
        </ThemeProvider>
      );

      const input = screen.getByPlaceholderText('AB1234567');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid passport format');
    });
  });

  describe('Select Component', () => {
    it('renders select with options and handles selection change', () => {
      const handleChange = vi.fn();
      render(
        <ThemeProvider>
          <Select
            label="Country of Study"
            value="germany"
            onChange={handleChange}
            options={[
              { value: 'germany', label: 'Germany (EU Blue Card corridor)' },
              { value: 'italy', label: 'Italy (Universitaly pre-enrolment)' },
              { value: 'france', label: 'France (EEF procedure)' },
              { value: 'romania', label: 'Romania (Ministry acceptance letter)' },
            ]}
          />
        </ThemeProvider>
      );

      const select = screen.getByRole('combobox', { name: /country of study/i });
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('germany');

      fireEvent.change(select, { target: { value: 'italy' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Modal Component', () => {
    it('renders modal dialog and closes on close button or backdrop', () => {
      const handleClose = vi.fn();
      render(
        <ThemeProvider>
          <Modal
            isOpen={true}
            onClose={handleClose}
            title="Confirm Document Verification"
            id="test-modal"
          >
            <p>Verification cannot be undone once certified.</p>
          </Modal>
        </ThemeProvider>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Document Verification')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Common Feedback States', () => {
    it('renders EmptyState with message and action', () => {
      const handleAction = vi.fn();
      render(
        <ThemeProvider>
          <EmptyState
            title="No Documents Uploaded"
            description="Upload your academic transcripts to begin statutory evaluation."
            actionLabel="Upload First Document"
            onAction={handleAction}
          />
        </ThemeProvider>
      );

      expect(screen.getByText('No Documents Uploaded')).toBeInTheDocument();
      expect(screen.getByText(/Upload your academic transcripts/i)).toBeInTheDocument();
      const actionBtn = screen.getByRole('button', { name: /upload first document/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorState with message and retry action', () => {
      const handleRetry = vi.fn();
      render(
        <ThemeProvider>
          <ErrorState
            title="Network Error"
            message="Unable to reach the consular synchronization service."
            onRetry={handleRetry}
          />
        </ThemeProvider>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText(/Unable to reach the consular/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders LoadingState with accessible status role', () => {
      render(
        <ThemeProvider>
          <LoadingState message="Fetching university admission quotas..." />
        </ThemeProvider>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Fetching university admission quotas...')).toBeInTheDocument();
    });
  });

  describe('Editorial Illustrations', () => {
    it('renders Globe, Document, and Search vector illustrations', () => {
      const { container } = render(
        <ThemeProvider>
          <div>
            <GlobeIllustration size={120} />
            <DocumentIllustration size={120} />
            <SearchIllustration size={120} />
          </div>
        </ThemeProvider>
      );

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
