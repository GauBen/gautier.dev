declare module "virtual:manifest" {
  export const manifest: import("@sveltejs/kit").SSRManifest;
  export const prerendered: import("@sveltejs/kit").Builder["prerendered"];
  export const last_modified: string;
  export const env_prefix: string;
  export const precompress: boolean;
}

declare module "virtual:server" {
  export const Server: typeof import("@sveltejs/kit").Server;
  export const options: { version_hash: string };
}
