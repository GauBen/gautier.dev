declare module "virtual:manifest" {
  export const manifest: import("@sveltejs/kit").SSRManifest;
  export const prerendered: import("@sveltejs/kit").Builder["prerendered"];
  export const base: string;
  export const buildDate: Date;
}

declare module "virtual:server" {
  const Server: typeof import("@sveltejs/kit").Server;
  export { Server };
}

declare const ENV_PREFIX: string;
