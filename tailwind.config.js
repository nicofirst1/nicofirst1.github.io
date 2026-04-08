// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    // Layouts, includes, pages
    './_layouts/**/*.{html,md,markdown,liquid}',
    './_includes/**/*.{html,md,markdown,liquid}',
    './_pages/**/*.{html,md,markdown,liquid}',
    './*.{html,md,markdown,liquid}',

    // Collections
    './_blog/**/*.{html,md,markdown,liquid}',
    './_news/**/*.{html,md,markdown,liquid}',
    './_projects/**/*.{html,md,markdown,liquid}',
    './_education/**/*.{html,md,markdown,liquid}',

    // JS/TS that might hold class strings
    './assets/**/*.{js,ts}',

    // (Do NOT scan build output)
    // './_site/**/*'  // avoid
    // './docs/**/*'   // avoid
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // No safelist needed — all Tailwind classes are hardcoded in templates,
  // so content scanning picks them up automatically.
  safelist: []
}
