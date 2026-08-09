import mysql from "mysql2/promise";

export async function logInternalWorkspaceDiagnostic() {
  if (process.env.NODE_ENV !== "production") return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("[internal-workspace-diagnostic] DATABASE_URL not set; skipping.");
    return;
  }

  const internalEmails = [
    (process.env.OWNER_EMAIL || "dominiquereed35@gmail.com").trim().toLowerCase(),
    "reedssolutionsllc@gmail.com",
  ];

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
    for (const email of internalEmails) {
      const [users] = await connection.execute(
        "SELECT id, email, openId, role FROM users WHERE LOWER(TRIM(email)) = ? ORDER BY id",
        [email],
      );

      if (!Array.isArray(users) || users.length === 0) {
        console.log(`[internal-workspace-diagnostic] email=${email} user=missing`);
        continue;
      }

      for (const user of users as any[]) {
        const [owned] = await connection.execute(
          "SELECT id, name, companyName, ownerId, status FROM workspaces WHERE ownerId = ? ORDER BY id",
          [user.id],
        );
        const [memberships] = await connection.execute(
          "SELECT wm.workspaceId, wm.role, w.name, w.companyName, w.ownerId, w.status FROM workspaceMembers wm JOIN workspaces w ON w.id = wm.workspaceId WHERE wm.userId = ? ORDER BY wm.workspaceId",
          [user.id],
        );

        console.log(
          `[internal-workspace-diagnostic] email=${email} userId=${user.id} role=${user.role} openId=${user.openId || "none"} owned=${JSON.stringify(owned)} memberships=${JSON.stringify(memberships)}`,
        );
      }
    }

    const [allUsers] = await connection.execute(
      "SELECT id, name, email, openId, role FROM users ORDER BY id LIMIT 100",
    );
    console.log(`[internal-workspace-diagnostic] allUsers=${JSON.stringify(allUsers)}`);

    const [allWorkspaces] = await connection.execute(
      "SELECT id, name, companyName, ownerId, status FROM workspaces ORDER BY id LIMIT 100",
    );
    console.log(`[internal-workspace-diagnostic] allWorkspaces=${JSON.stringify(allWorkspaces)}`);

    const [allMemberships] = await connection.execute(
      "SELECT workspaceId, userId, role FROM workspaceMembers ORDER BY workspaceId, userId LIMIT 200",
    );
    console.log(`[internal-workspace-diagnostic] allMemberships=${JSON.stringify(allMemberships)}`);
  } catch (error) {
    console.error("[internal-workspace-diagnostic] failed", error);
  } finally {
    await connection.end();
  }
}
