declare module "virtual:manifest" {
  export const manifest: import("@sveltejs/kit").SSRManifest;
  export const prerendered: import("@sveltejs/kit").Builder["prerendered"];
}

declare module "virtual:server" {
  export const Server: typeof import("@sveltejs/kit").Server;
  export const options: { version_hash: string };
}

declare const BUILD_ISO_DATE: string;
declare const ENV_PREFIX: string;
