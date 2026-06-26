import { SettingsFallbackIcon, UdpFallback } from 'udp-ui/components';
import React from 'react';
import { SettingsTestIds } from '@/app/settings/_common/testIds';

export type FallbackContext = {
  readonly predicate: () => boolean;
  readonly title: string;
  readonly description: string;
};

interface SettingsFallbackProps {
  fallbacks: FallbackContext[];
  children: React.ReactNode;
}

/**
 * Wrapper for providing multiple possible fallbacks for an inner component.
 * <p>
 * This will either render the given `children`, if no fallback is needed,
 * or a `UdpFallback` component, otherwise.
 * The fallback component is filled in accordance with the first given `fallbacks`
 * the `predicate` of which is evaluated to `true`.
 *
 * @param fallbacks contexts for the individual possible fallbacks
 * @param children  component to show if no fallback component is needed
 * @constructor
 */
const SettingsFallbackWrapper: React.FC<SettingsFallbackProps> = ({
  fallbacks,
  children,
}) => {
  const context = fallbacks.find((ctx) => ctx.predicate());
  return context ? (
    <UdpFallback
      icon={SettingsFallbackIcon}
      title={context.title}
      description={context.description}
      className='h-full justify-center'
      data-testid={SettingsTestIds.fallback}
    />
  ) : (
    children
  );
};

export default SettingsFallbackWrapper;
