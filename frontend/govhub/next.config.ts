import { NextConfig } from 'next';
import withFlowbiteReact from 'flowbite-react/plugin/nextjs';

const nextConfig: NextConfig = {
  transpilePackages: ['@faker-js/faker'],
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'community.data-hub.local',
      },
      {
        protocol: 'https',
        hostname: 'superset.data-hub.local',
      },
    ],
  },
};

export default withFlowbiteReact(nextConfig);
