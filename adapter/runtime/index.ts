if (process.argv[2] === "--healthcheck") {
  try {
    const { ok, status } = await fetch(
      process.argv[3] ?? `http://localhost:${process.env.PORT ?? 3000}`,
      {
        method: "HEAD",
        signal: AbortSignal.timeout(1000),
      },
    );
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
}

await import("virtual:instrumentation"); // Empty if instrumentation is not enabled
await import("./node-server.js");
