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
    expect(videoFramesButton).toHaveClass('border-slate-500');
  });

  it('calls onChange when option is clicked', () => {
    render(<SourceSelector {...defaultProps} />);

    const imagesButton = screen.getByText('Uploaded images').closest('button');
    fireEvent.click(imagesButton!);

    expect(defaultProps.onChange).toHaveBeenCalledWith(THUMBNAIL_SOURCE_TYPES.IMAGES);
  });

  it('shows validation message for video frames when no video uploaded', () => {
    render(<SourceSelector {...defaultProps} />);

    expect(screen.getByText('Upload a video first to use video frames')).toBeInTheDocument();
  });

  it('shows validation message for images when no images uploaded', () => {
    render(<SourceSelector {...defaultProps} value={THUMBNAIL_SOURCE_TYPES.IMAGES} />);

    expect(screen.getByText('Upload at least one image first')).toBeInTheDocument();
  });

  it('does not show validation message when assets are available', () => {
    render(
      <SourceSelector
        {...defaultProps}
        hasVideoUploaded={true}
        hasImagesUploaded={true}
      />
    );

    expect(screen.queryByText('Upload a video first')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload at least one image first')).not.toBeInTheDocument();
  });
});
