import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@alvarosky/ui", "@alvarosky/database-management"],
};

export default nextConfig;
