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
      <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z" stroke="url(#icon-gradient)"></path>
      <path d="M12 22v-6.5" stroke="url(#icon-gradient)"></path>
      <path d="M22 8.5l-10 6-10-6" stroke="url(#icon-gradient)"></path>
      <path d="M2 15.5l10-6 10 6" stroke="url(#icon-gradient)"></path>
      <path d="M12 2v6.5" stroke="url(#icon-gradient)"></path>
    </svg>
  );
}
