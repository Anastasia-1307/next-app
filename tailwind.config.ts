import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}", // Dacă folosești App Router (Next.js 13+)
        "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Dacă folosești Pages Router
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",

    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
export default config;