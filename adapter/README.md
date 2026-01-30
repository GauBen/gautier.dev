# adapter-node-sea

This SvelteKit adapter bundles a complete application, assets included, into a single executable using [Node.js SEA (Single Executable Application)](https://nodejs.org/api/single-executable-applications.html).

Want to know more about SEA? Check out my article: [Bundling a SvelteKit app into a single binary](https://gautier.dev/articles/sveltekit-sea).

## Attribution

This adapter contains code adapted from different sources:

- [@sveltejs/adapter-node](https://github.com/sveltejs/kit/tree/main/packages/adapter-node): most of the code structure and logic is adapted from this official adapter
- [sirv](https://github.com/lukeed/sirv): serve static files, adapted to serve SEA assets
- [totalist](https://github.com/lukeed/totalist): recursively list files in a directory
- [@rollup/plugin-virtual](https://github.com/rollup/plugins/tree/master/packages/virtual): create virtual modules during the build step
