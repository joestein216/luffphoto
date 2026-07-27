/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    if (fileLoaderRule) {
      config.module.rules.push(
        // Re-apply the existing asset loader only if the SVG is imported from CSS/SASS
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: { not: /components/ }, // exclude component queries if any
        },
        // Convert SVGs to React Components when imported in JS/TS files
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: { not: [/url/] }, // exclude if you explicitly want a URL string
          use: ['@svgr/webpack'],
        },
      )

      // Modify the original file loader rule to ignore SVGs processed above
      fileLoaderRule.exclude = /\.svg$/i
    }

    return config
  },
}

module.exports = nextConfig
