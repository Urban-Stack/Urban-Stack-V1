import { describe, expect, it } from 'vitest';
import { Breakpoint, Viewport } from '@/lib/tailwind/classes.ts';

describe('Breakpoint', () => {
  it('record contains correct entries', () => {
    expect(Breakpoint).toEqual({
      sm: {
        name: 'sm',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      md: {
        name: 'md',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      lg: {
        name: 'lg',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      xl: {
        name: 'xl',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      '2xl': {
        name: '2xl',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
    });
  });

  it('breakpoints have correct string representation', () => {
    expect(Breakpoint['sm'].toString()).toEqual('sm');
    expect(Breakpoint['md'].toString()).toEqual('md');
    expect(Breakpoint['lg'].toString()).toEqual('lg');
    expect(Breakpoint['xl'].toString()).toEqual('xl');
    expect(Breakpoint['2xl'].toString()).toEqual('2xl');
  });

  it('breakpoints have correct numerical value', () => {
    expect(Breakpoint['sm'].valueOf()).toEqual(1);
    expect(Breakpoint['md'].valueOf()).toEqual(2);
    expect(Breakpoint['lg'].valueOf()).toEqual(3);
    expect(Breakpoint['xl'].valueOf()).toEqual(4);
    expect(Breakpoint['2xl'].valueOf()).toEqual(5);
  });
});

describe('Viewport', () => {
  it('record contains correct entries', () => {
    expect(Viewport).toEqual({
      base: {
        name: 'base',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      sm: {
        name: 'sm',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      md: {
        name: 'md',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      lg: {
        name: 'lg',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      xl: {
        name: 'xl',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
      '2xl': {
        name: '2xl',
        toString: expect.any(Function),
        valueOf: expect.any(Function),
      },
    });
  });

  it('viewports have correct string representation', () => {
    expect(Viewport['base'].toString()).toEqual('base');
    expect(Viewport['sm'].toString()).toEqual('sm');
    expect(Viewport['md'].toString()).toEqual('md');
    expect(Viewport['lg'].toString()).toEqual('lg');
    expect(Viewport['xl'].toString()).toEqual('xl');
    expect(Viewport['2xl'].toString()).toEqual('2xl');
  });

  it('viewports have correct numerical value', () => {
    expect(Viewport['base'].valueOf()).toEqual(0);
    expect(Viewport['sm'].valueOf()).toEqual(1);
    expect(Viewport['md'].valueOf()).toEqual(2);
    expect(Viewport['lg'].valueOf()).toEqual(3);
    expect(Viewport['xl'].valueOf()).toEqual(4);
    expect(Viewport['2xl'].valueOf()).toEqual(5);
  });
});
