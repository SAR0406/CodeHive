import type { SVGProps } from 'react';

export function CodeHiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="url(#icon-gradient)"></polygon>
      <polyline points="2 17 12 22 22 17" stroke="url(#icon-gradient)"></polyline>
      <polyline points="2 12 12 17 22 12" stroke="url(#icon-gradient)"></polyline>
    </svg>
  );
}
