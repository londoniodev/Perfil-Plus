import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    transpilePackages: ["@alvarosky/ui", "@alvarosky/database-management"],
};

export default nextConfig;
