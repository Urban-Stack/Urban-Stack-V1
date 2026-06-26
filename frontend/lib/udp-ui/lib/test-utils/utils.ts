import { render, RenderResult } from '@testing-library/react';
import React from 'react';

/* v8 ignore start */
export const setEnvVarsToAny: (envNames: string[], val?: string) => void = (
  envNames,
  val = 'dummy-value',
) => {
  envNames.forEach((envName) => {
    process.env[envName] = val;
  });
};

export const setEnvVars: (env: Record<string, string>) => void = (env) => {
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

export const clearEnvVars: () => void = () => {
  process.env = { NODE_ENV: 'test' };
};
/* v8 ignore end */

/**
 * Returns a function for rendering a component
 * that allows the given default properties to be overridden.
 * <p>
 * Note: `defaultProps` needs to provide any required property of `Component`.
 * Individual props can then be overridden for the actual rendering
 * by passing them to the returned function.
 * <pre>
 *   const renderComp = createRender(MyComponent, { key: "value-default" });
 *   renderComp({ key: "value-overridden" });
 * </pre>
 *
 * @param Component    type of the component to render
 * @param defaultProps default properties for the component
 * @return a render function that allows to override the given default values
 */
export const createRender: <P>(
  Component: React.ComponentType<P>,
  defaultProps: DefaultProps<P>,
) => (overrides?: Partial<P>) => RenderResult =
  <P>(Component: React.ComponentType<P>, defaultProps: DefaultProps<P>) =>
  (overrides = {}) => {
    const props = {
      ...defaultProps,
      ...overrides,
    } as P;
    return render(
      React.createElement(Component as React.JSXElementConstructor<P>, props),
    );
  };

type DefaultProps<T> = Pick<T, RequiredKeys<T>> &
  Partial<Pick<T, OptionalKeys<T>>>;

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];
