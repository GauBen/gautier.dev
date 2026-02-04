/** @returns {import("@sveltejs/kit").Adapter} */
export default function adapter({ precompress, envPrefix }?: {
    precompress?: boolean | undefined;
    envPrefix?: string | undefined;
}): import("@sveltejs/kit").Adapter;
