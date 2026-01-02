import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HookTextControls } from '@/components/molecules/HookTextControls';
import { HOOK_TONES, VALIDATION_RULES } from '@/constants/video';

describe('HookTextControls', () => {
  const defaultProps = {
    hookText: '',
    onHookTextChange: jest.fn(),
    tone: HOOK_TONES.VIRAL,
    onToneChange: jest.fn(),
    showToneSelector: true,
    inlineAlert: null,
    onAlertDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hook text input and tone selector', () => {
    render(<HookTextControls {...defaultProps} />);

    expect(screen.getByLabelText('Hook text')).toBeInTheDocument();
    expect(screen.getByText('Viral')).toBeInTheDocument();
    expect(screen.getByText('Curiosity')).toBeInTheDocument();
    expect(screen.getByText('Educational')).toBeInTheDocument();
  });

  it('calls onHookTextChange when text is entered', () => {
    render(<HookTextControls {...defaultProps} />);

    const input = screen.getByLabelText('Hook text');
    fireEvent.change(input, { target: { value: 'Test hook text' } });

    expect(defaultProps.onHookTextChange).toHaveBeenCalledWith('Test hook text');
  });

  it('enforces character limit', () => {
    const longText = 'a'.repeat(VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH + 10);
    const truncatedText = longText.slice(0, VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH);

    render(<HookTextControls {...defaultProps} />);

    const input = screen.getByLabelText('Hook text');
    fireEvent.change(input, { target: { value: longText } });

    // The component uses local state, so we check that the input value is truncated
    expect(input).toHaveValue(truncatedText);
    expect(defaultProps.onHookTextChange).toHaveBeenCalledWith(truncatedText);
  });

  it('shows character count', () => {
    render(<HookTextControls {...defaultProps} hookText="Test text" />);

    expect(screen.getByText('9/200')).toBeInTheDocument();
  });

  it('calls onToneChange when tone is selected', () => {
    render(<HookTextControls {...defaultProps} />);

    const curiosityRadio = screen.getByRole('radio', { name: /curiosity/i });
    fireEvent.click(curiosityRadio);

    expect(defaultProps.onToneChange).toHaveBeenCalledWith(HOOK_TONES.CURIOSITY);
  });


  it('highlights selected tone', () => {
    render(<HookTextControls {...defaultProps} tone={HOOK_TONES.CURIOSITY} />);

    const curiosityRadio = screen.getByRole('radio', { name: /curiosity/i });
    expect(curiosityRadio).toBeChecked();
    
    const curiosityLabel = curiosityRadio.closest('label');
    expect(curiosityLabel).toHaveClass('border-slate-800', 'bg-slate-50');
  });
});
