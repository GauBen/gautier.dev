<h1>Self-Hosted</h1>

This website is served from my living room!

At the beginning of 2026, I made the resolution to **take back ownership of my data** before the end of the year. To that end, I bought a €150 mini PC ([Soyo M4 Plus 2, Intel N150, 16 GB RAM, 512 GB SSD](https://www.aliexpress.com/w/wholesale-soyo-m4-plus-2.html)) with the plan of turning it into a low-power server. I replaced its pre-installed Windows 11 with [Proxmox VE](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview); the [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/) project makes it easy to set up popular self-hosted applications in a few keystrokes.

Here is my progress so far:

- [x] Personal website ([gautier.dev](https://gautier.dev))

  Deployment is fully automated: pushing to my [Forgejo](https://forgejo.org/) instance ([git.gautier.dev](https://git.gautier.dev/gautier/gautier.dev)) triggers a webhook on my [Coolify](https://coolify.io/) instance.
  I've set up a two-way mirror between Forgejo and GitHub for backup and convenience.

  The site is served through a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) that takes care of HTTPS and caching.

- [x] Google Drive → [Copyparty](https://github.com/9001/copyparty)

  This is not a real replacement for Google Drive, but it does the job for now.

- [x] Gmail → [Stalwart](https://stalw.art/)

  Started as an experiment, but it works so I might as well keep it.

  Using Stalwart behind Caddy (I need Caddy to dispatch requests to the right place) took me a full day to set up. Here is the resulting Caddyfile:

  ```caddyfile
  {
    # Internal HTTPS loop
    https_port 8443

    layer4 {
      :443 {
        # Route raw :443 trafic to mail.gautier.dev
        @mail tls sni mail.gautier.dev
        route @mail {
          proxy 192.168.1.104:443 {
            proxy_protocol v2
          }
        }
        # Let Caddy process the rest with the internal HTTPS loop
        route {
          proxy 127.0.0.1:8443
        }
      }
    }
  }
  ```

  Note that it requires [caddy-l4](https://github.com/mholt/caddy-l4) to be installed on the Caddy instance. This is required for Stalwart to issue its own TLS certificates using ACME ALPN challenges (HTTP not available for .dev domains).

  On the Stalwart instance, I had to set the Caddy IP as a trusted proxy so that Stalwart can get the real client IP for security purposes.

- [x] Bitwarden → Vaultwarden
- [x] Google Photos → Immich
- [ ] Google Keep → TBD
- [ ] PDS ATProto (Bluesky)
- [ ] Notion → TBD
- [ ] TOTP Authenticator → TBD
- [ ] Google Calendar → Whenbanana
- [ ] Huawei Health → [Gadgetbridge](https://gadgetbridge.org/)
- [x] Cloudflare Analytics → [Umami](https://umami.is/)

That's a long list, wish me luck! I'll keep this page updated with my progress.
