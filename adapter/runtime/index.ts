if (process.argv[2] === "--healthcheck") {
  const origin = process.argv[3];

  if (!origin) {
    console.error("Origin URL is required for health check");
    process.exit(1);
  }

  try {
    const { ok, status } = await fetch(origin, {
      method: "HEAD",
      signal: AbortSignal.timeout(1000),
    });
    if (ok) {
      console.log("Health check successful");
      process.exit(0);
    } else {
      console.error(`Health check failed with status: ${status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Health check error: ${(error as Error).message}`);
    process.exit(1);
  }
} else {
  await import("./node-server.js");
}
