import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@alvarosky/ui", "@alvarosky/database-management", "@alvarosky/types"],
};

export default nextConfig;
