import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        // the classic mobile design width (iPhone logical px) — what a phone shows
        column: '375px',
        // every page on desktop (md and up): a comfortable reading measure at 14px
        reading: '600px',
      },
    },
  },
  plugins: [typography],
};
