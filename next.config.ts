import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

type RemotePatterns = NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
>;

/**
 * Storage objects live under fixed prefixes, so the patterns stay narrow:
 * `public` for the media bucket, `sign` for signed document URLs.
 */
const SUPABASE_OBJECT_PATHS = [
  '/storage/v1/object/public/**',
  '/storage/v1/object/sign/**',
];

/**
 * Derived from the Supabase URL rather than hardcoded so local, staging and
 * production each allow only their own storage host.
 */
function supabaseImagePatterns(): RemotePatterns {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    return SUPABASE_OBJECT_PATHS.map((pathname) => ({
      protocol: protocol === 'http:' ? 'http' : 'https',
      hostname,
      port,
      pathname,
    }));
  } catch {
    return [];
  }
}

// Standalone output required for Docker production images.
// Web deploys (Vercel) leave this undefined = default SSR behavior.
const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

  images: {
    remotePatterns: supabaseImagePatterns(),
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
