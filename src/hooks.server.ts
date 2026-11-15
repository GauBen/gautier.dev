export const handle = ({ event, resolve }) =>
  resolve(event, { preload: () => true });
