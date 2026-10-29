# adapter-node-sea

This SvelteKit adapter bundles a complete application, assets included, into a single executable using [Node.js SEA (Single Executable Application)](https://nodejs.org/api/single-executable-applications.html).

Want to know more about SEA? Check out my article: [Bundling a SvelteKit app into a single binary](https://gautier.dev/articles/sveltekit-sea).

## Attribution

This adapter contains code adapted from different sources:

- [@sveltejs/adapter-node](https://github.com/sveltejs/kit/tree/main/packages/adapter-node): the server itself is built by this official adapter, and reads its files from the SEA assets mounted as a [virtual file system](https://nodejs.org/api/vfs.html#use-with-single-executable-applications)
- [totalist](https://github.com/lukeed/totalist): recursively list files in a directory
