import {
  createTheme,
  Progress,
  ProgressColor,
  progressTheme,
  ProgressTheme,
} from 'flowbite-react';
import { twMerge } from 'tailwind-merge';

export const UdpProgressBarTestId = 'udp-progress-bar';

const theme = createTheme<ProgressTheme>({
  ...progressTheme,
  color: {
    default: 'bg-primary-700',
  } as ProgressColor,
});

const UdpProgressBar = ({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) => (
  <Progress
    progress={progress}
    size='md'
    className={twMerge('min-w-20', className)}
    theme={theme}
    data-testid={UdpProgressBarTestId}
  />
);

export default UdpProgressBar;
