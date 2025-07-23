import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  dest: 'public', // Output directory for service worker files
  // You can add more Serwist options here, e.g., runtimeCaching for specific routes
  // runtimeCaching: [
  //   {
  //     urlPattern: /^https?.*/,
  //     handler: 'NetworkFirst',
  //     options: {
  //       cacheName: 'https-calls',
  //       expiration: {
  //         maxEntries: 150,
  //         maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  //       },
  //       cacheableResponse: {
  //         statuses: [0, 200],
  //       },
  //     },
  //   },
  // ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config
};

export default withSerwist(nextConfig);
