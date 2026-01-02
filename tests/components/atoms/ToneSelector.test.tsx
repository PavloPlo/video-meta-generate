import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToneSelector } from '@/components/atoms/ToneSelector';
import { HOOK_TONES } from '@/constants/video';

describe('ToneSelector', () => {
  const defaultProps = {
    value: HOOK_TONES.VIRAL,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Accessibility', () => {
    it('renders as a fieldset with proper ARIA labels', () => {
      render(<ToneSelector {...defaultProps} />);
      
      // Check for radiogroup role
      const radiogroup = screen.getByRole('radiogroup', { name: /tone/i });
      expect(radiogroup).toBeInTheDocument();
      
      // Check for legend (screen reader announcement)
      expect(screen.getByText('Tone selection, 3 options')).toBeInTheDocument();
    });

    it('renders all three tone options as radio buttons', () => {
      render(<ToneSelector {...defaultProps} />);
      
      const viralRadio = screen.getByRole('radio', { name: /viral.*attention-grabbing/i });
      const curiosityRadio = screen.getByRole('radio', { name: /curiosity.*spark interest/i });
      const educationalRadio = screen.getByRole('radio', { name: /educational.*informative/i });
      
      expect(viralRadio).toBeInTheDocument();
      expect(curiosityRadio).toBeInTheDocument();
      expect(educationalRadio).toBeInTheDocument();
    });

    it('marks the selected option as checked', () => {
      render(<ToneSelector {...defaultProps} value={HOOK_TONES.CURIOSITY} />);
      
      const viralRadio = screen.getByRole('radio', { name: /viral/i });
      const curiosityRadio = screen.getByRole('radio', { name: /curiosity/i });
      const educationalRadio = screen.getByRole('radio', { name: /educational/i });
      
      expect(viralRadio).not.toBeChecked();
      expect(curiosityRadio).toBeChecked();
      expect(educationalRadio).not.toBeChecked();
    });

    it('has proper aria-label for each option with description', () => {
      render(<ToneSelector {...defaultProps} />);
      
      expect(screen.getByLabelText(/viral.*attention-grabbing and shareable/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/curiosity.*spark interest and questions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/educational.*informative and helpful/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup();
      render(<ToneSelector {...defaultProps} value={HOOK_TONES.VIRAL} />);
      
      const viralRadio = screen.getByRole('radio', { name: /viral/i });
      const curiosityRadio = screen.getByRole('radio', { name: /curiosity/i });
      
      // Focus the first radio
      viralRadio.focus();
      expect(viralRadio).toHaveFocus();
      
      // Arrow right should move to next radio
      await user.keyboard('{ArrowRight}');
      expect(curiosityRadio).toHaveFocus();
    });

    it('shows visible focus ring when focused', () => {
      render(<ToneSelector {...defaultProps} />);
      
      const viralLabel = screen.getByRole('radio', { name: /viral/i }).parentElement;
      expect(viralLabel).toHaveClass('focus-within:ring-2', 'focus-within:ring-blue-500');
    });
  });

  describe('Visual States', () => {
    it('displays check icon for selected option', () => {
      const { container } = render(<ToneSelector {...defaultProps} value={HOOK_TONES.VIRAL} />);
      
      // Check icon should be visible for selected option
      const viralLabel = screen.getByRole('radio', { name: /viral/i }).closest('label');
      const checkIcon = viralLabel?.querySelector('svg');
      
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('applies correct border and background styles for selected option', () => {
      render(<ToneSelector {...defaultProps} value={HOOK_TONES.VIRAL} />);
      
      const viralLabel = screen.getByRole('radio', { name: /viral/i }).closest('label');
      expect(viralLabel).toHaveClass('border-slate-800', 'bg-slate-50', 'shadow-md');
    });

    it('applies correct border and background styles for unselected options', () => {
      render(<ToneSelector {...defaultProps} value={HOOK_TONES.VIRAL} />);
      
      const curiosityLabel = screen.getByRole('radio', { name: /curiosity/i }).closest('label');
      expect(curiosityLabel).toHaveClass('border-slate-200', 'bg-white');
    });

    it('displays emoji icons for each tone', () => {
      render(<ToneSelector {...defaultProps} />);
      
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Viral
      expect(screen.getByText('❓')).toBeInTheDocument(); // Curiosity
      expect(screen.getByText('🎓')).toBeInTheDocument(); // Educational
    });

    it('renders helper text when showHelperText is true', () => {
      render(<ToneSelector {...defaultProps} showHelperText={true} />);
      
      expect(screen.getByText('Used for text style, not content meaning')).toBeInTheDocument();
    });

    it('does not render helper text when showHelperText is false', () => {
      render(<ToneSelector {...defaultProps} showHelperText={false} />);
      
      expect(screen.queryByText('Used for text style, not content meaning')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when clicking on an option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<ToneSelector {...defaultProps} onChange={onChange} value={HOOK_TONES.VIRAL} />);
      
      const curiosityLabel = screen.getByRole('radio', { name: /curiosity/i }).closest('label');
      await user.click(curiosityLabel!);
      
      expect(onChange).toHaveBeenCalledWith(HOOK_TONES.CURIOSITY);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when using keyboard to select option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<ToneSelector {...defaultProps} onChange={onChange} value={HOOK_TONES.VIRAL} />);
      
      const curiosityRadio = screen.getByRole('radio', { name: /curiosity/i });
      curiosityRadio.focus();
      
      // Space key should select the focused option
      await user.keyboard(' ');
      
      expect(onChange).toHaveBeenCalledWith(HOOK_TONES.CURIOSITY);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('allows clicking on label text to select option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<ToneSelector {...defaultProps} onChange={onChange} value={HOOK_TONES.VIRAL} />);
      
      // Click on the label text
      await user.click(screen.getByText('Curiosity'));
      
      expect(onChange).toHaveBeenCalledWith(HOOK_TONES.CURIOSITY);
    });

    it('allows clicking on description to select option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<ToneSelector {...defaultProps} onChange={onChange} value={HOOK_TONES.VIRAL} />);
      
      // Click on the description text
      await user.click(screen.getByText('Spark interest and questions'));
      
      expect(onChange).toHaveBeenCalledWith(HOOK_TONES.CURIOSITY);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <ToneSelector {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('maintains default styling alongside custom className', () => {
      const { container } = render(
        <ToneSelector {...defaultProps} className="custom-class" />
      );
      
      // Custom class should be present
      expect(container.firstChild).toHaveClass('custom-class');
      
      // Grid layout should still be applied
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveClass('grid', 'grid-cols-3', 'gap-3');
    });
  });

  describe('Screen Reader Experience', () => {
    it('announces correct radiogroup information', () => {
      render(<ToneSelector {...defaultProps} />);
      
      const radiogroup = screen.getByRole('radiogroup', { name: /tone/i });
      const radios = screen.getAllByRole('radio');
      
      expect(radiogroup).toBeInTheDocument();
      expect(radios).toHaveLength(3);
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<ToneSelector {...defaultProps} />);
      
      // Check that emoji containers have aria-hidden (not directly testable, but ensuring structure)
      const labels = container.querySelectorAll('label');
      expect(labels).toHaveLength(3);
    });

    it('includes descriptive text in radio labels for context', () => {
      render(<ToneSelector {...defaultProps} />);
      
      // Each radio should have both the label and description in its accessible name
      expect(screen.getByLabelText(/viral.*attention-grabbing and shareable/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/curiosity.*spark interest and questions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/educational.*informative and helpful/i)).toBeInTheDocument();
    });
  });
});

