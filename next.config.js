/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    eslint : {
        ignoreDuringBuilds : true
    },
    typescript : {
        ignoreBuildErrors : true
    },
    images: {
        domains: ['pfdchat.1add51894eb6997d8bd9f30016951e9d.r2.cloudflarestorage.com']
    }
};

export default config;
