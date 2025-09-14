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
  safelist: [
    // Useful if you build classes via Liquid/Front-matter (dynamic pieces)
    { pattern: /^(pt|pb|pl|pr|px|py|mt|mb|ml|mr)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32)$/ },
    { pattern: /^grid-cols-(1|2|3|4|6|12)$/ },
    { pattern: /^(text|bg|border|from|to|via)-(slate|gray|zinc|neutral|stone|blue|cyan|emerald|green|yellow|orange|red|rose)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^max-w-(screen|xs|sm|md|lg|xl|2xl)$/ },
    { pattern: /^rounded(-(lg|xl|2xl))?$/ },
    { pattern: /^shadow(-(sm|md|lg))?$/ },
    'container', 'prose'
  ]
}
