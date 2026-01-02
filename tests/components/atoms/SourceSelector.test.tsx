import { render, screen, fireEvent } from '@testing-library/react';
import { SourceSelector } from '@/components/atoms/SourceSelector';
import { THUMBNAIL_SOURCE_TYPES } from '@/constants/video';

describe('SourceSelector', () => {
  const defaultProps = {
    value: THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES,
    onChange: jest.fn(),
    hasVideoUploaded: false,
    hasImagesUploaded: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders source selection options', () => {
    render(<SourceSelector {...defaultProps} />);

    expect(screen.getByText('Video frames')).toBeInTheDocument();
    expect(screen.getByText('Uploaded images')).toBeInTheDocument();
  });

  it('shows selected option correctly', () => {
    render(<SourceSelector {...defaultProps} />);

    const videoFramesButton = screen.getByText('Video frames').closest('button');
    expect(videoFramesButton).toHaveClass('border-slate-600');
  });

  it('calls onChange when option is clicked', () => {
    render(<SourceSelector {...defaultProps} hasVideoUploaded={true} hasImagesUploaded={true} />);

    const imagesButton = screen.getByText('Uploaded images').closest('button');
    fireEvent.click(imagesButton!);

    expect(defaultProps.onChange).toHaveBeenCalledWith(THUMBNAIL_SOURCE_TYPES.IMAGES);
  });

  it('calls onValidationChange with validation message for video frames when no video uploaded', () => {
    const mockOnValidationChange = jest.fn();
    render(<SourceSelector {...defaultProps} onValidationChange={mockOnValidationChange} />);

    expect(mockOnValidationChange).toHaveBeenCalledWith('Upload a video first to use video frames');
  });

  it('calls onValidationChange with validation message for images when no images uploaded', () => {
    const mockOnValidationChange = jest.fn();
    render(
      <SourceSelector
        {...defaultProps}
        value={THUMBNAIL_SOURCE_TYPES.IMAGES}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(mockOnValidationChange).toHaveBeenCalledWith('Upload at least one image first');
  });

  it('calls onValidationChange with null when assets are available', () => {
    const mockOnValidationChange = jest.fn();
    render(
      <SourceSelector
        {...defaultProps}
        hasVideoUploaded={true}
        hasImagesUploaded={true}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(mockOnValidationChange).toHaveBeenCalledWith(null);
  });
});
