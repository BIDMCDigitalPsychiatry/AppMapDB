import * as React from 'react';
import { useTheme } from '@mui/material';

/**
 * Hand-drawn owl mascot for the search assistant (placeholder character
 * until the team settles on a persona). Body renders in currentColor so it
 * adapts to its container (white on the primary FAB and panel header);
 * eyes/beak pick up the theme's primary.dark for contrast.
 */
export default function AssistantIcon({ size = 28 }: { size?: number }) {
  const { palette } = useTheme() as any;
  const accent = palette.primary.dark;
  return (
    <svg width={size} height={size} viewBox='0 0 48 48' fill='none' aria-hidden focusable='false'>
      {/* ear tufts */}
      <path d='M11 16 C9 9 12 5 17 8 C14 10 12.5 13 12.5 16 Z' fill='currentColor' />
      <path d='M37 16 C39 9 36 5 31 8 C34 10 35.5 13 35.5 16 Z' fill='currentColor' />
      {/* body */}
      <ellipse cx='24' cy='27' rx='15.5' ry='16.5' fill='currentColor' />
      {/* wings */}
      <path d='M10.5 25 C7.5 30 8.5 36 12.5 39.5 C11 34.5 11 29.5 12.5 25.5 Z' fill={accent} opacity='0.25' />
      <path d='M37.5 25 C40.5 30 39.5 36 35.5 39.5 C37 34.5 37 29.5 35.5 25.5 Z' fill={accent} opacity='0.25' />
      {/* eyes */}
      <circle cx='17.5' cy='24' r='5.2' fill={accent} />
      <circle cx='30.5' cy='24' r='5.2' fill={accent} />
      <circle cx='19' cy='22.5' r='1.8' fill='currentColor' />
      <circle cx='32' cy='22.5' r='1.8' fill='currentColor' />
      {/* beak */}
      <path d='M24 29 L20.8 33.2 L24 36.6 L27.2 33.2 Z' fill={accent} />
      {/* belly speckles */}
      <circle cx='19' cy='38.5' r='1.1' fill={accent} opacity='0.35' />
      <circle cx='24' cy='40.5' r='1.1' fill={accent} opacity='0.35' />
      <circle cx='29' cy='38.5' r='1.1' fill={accent} opacity='0.35' />
    </svg>
  );
}
