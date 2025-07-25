import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Kalau kamu ada config lain, taruh di sini juga
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false
});

export default pwaConfig(nextConfig);
