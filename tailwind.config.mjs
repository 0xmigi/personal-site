import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        // the classic mobile design width (iPhone logical px) — desktop shows
        // exactly what a phone shows
        column: '375px',
      },
    },
  },
  plugins: [typography],
};
