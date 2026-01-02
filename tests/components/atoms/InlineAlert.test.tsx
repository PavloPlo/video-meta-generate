import { render, screen } from '@testing-library/react';
import { InlineAlert } from '@/components/atoms/InlineAlert';
import { ALERT_SCOPES, ALERT_KINDS } from '@/constants/video';

describe('InlineAlert', () => {
  it('renders info alert with correct styling and accessibility', () => {
    render(
      <InlineAlert
        scope={ALERT_SCOPES.CONTROLS}
        kind={ALERT_KINDS.INFO}
        message="Test info message"
      />
    );

    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Test info message');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('renders success alert with correct styling', () => {
    render(
      <InlineAlert
        scope={ALERT_SCOPES.GENERATE}
        kind={ALERT_KINDS.SUCCESS}
        message="Test success message"
      />
    );

    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Test success message');
    expect(alert).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('renders warning alert with correct styling', () => {
    render(
      <InlineAlert
        scope={ALERT_SCOPES.REGENERATE}
        kind={ALERT_KINDS.WARNING}
        message="Test warning message"
      />
    );

    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Test warning message');
    expect(alert).toHaveClass('bg-amber-50', 'border-amber-200', 'text-amber-800');
  });

  it('renders error alert with alert role and assertive live region', () => {
    render(
      <InlineAlert
        scope={ALERT_SCOPES.SOURCE}
        kind={ALERT_KINDS.ERROR}
        message="Test error message"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Test error message');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
