/** @type {import('next').NextConfig} */
const nextConfig = {
  // Biarkan binary ffmpeg dan sharp dibundel apa adanya di serverless
  serverExternalPackages: ["sharp", "ffmpeg-static"],
};

export default nextConfig;
