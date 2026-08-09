import mysql from "mysql2/promise";

const RESET_TOKEN = "CONFIRMED_OPTION_2_2026_08_09";

export async function runOneTimeFactoryReset() {
  if (process.env.NODE_ENV !== "production") return;
  if ((process.env.PRIMECONTRACTOROS_FACTORY_RESET || "").trim() !== RESET_TOKEN) return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("PRIMECONTRACTOROS factory reset requested but DATABASE_URL is missing");

  const url = new URL(databaseUrl);
  const sslRequested = ["true", "1", "require"].includes(
    (url.searchParams.get("ssl") || "").toLowerCase(),
  );

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: sslRequested ? { minVersion: "TLSv1.2" } : undefined,
  });

  try {
    const [rows] = await connection.query("SHOW TABLES");
    const tableNames = (rows as any[])
      .map(row => String(Object.values(row)[0]))
      .filter(Boolean);

    // Preserve only Drizzle migration bookkeeping so the already-created schema
    // remains intact. All application/user/workspace/business/platform records
    // are removed, producing a genuinely empty application database.
    const preserved = tableNames.filter(name => /drizzle|migration/i.test(name));
    const resetTables = tableNames.filter(name => !preserved.includes(name));

    console.log(
      `[factory-reset] confirmed option 2; clearing ${resetTables.length} application tables; preserving=${JSON.stringify(preserved)}`,
    );

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    try {
      for (const table of resetTables) {
        const safe = table.replace(/`/g, "``");
        await connection.query(`DELETE FROM \`${safe}\``);
      }
    } finally {
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    const verification: Record<string, number> = {};
    for (const table of resetTables) {
      const safe = table.replace(/`/g, "``");
      const [countRows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${safe}\``);
      verification[table] = Number((countRows as any[])[0]?.count || 0);
    }

    const nonEmpty = Object.entries(verification).filter(([, count]) => count !== 0);
    if (nonEmpty.length > 0) {
      throw new Error(`[factory-reset] verification failed: ${JSON.stringify(nonEmpty)}`);
    }

    console.log(
      `[factory-reset] COMPLETE application data erased; tablesCleared=${resetTables.length}; preserved=${JSON.stringify(preserved)}`,
    );
  } finally {
    await connection.end();
  }
}
