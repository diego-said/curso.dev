import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const defaultMigrationsOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const migrations = await migrationRunner(defaultMigrationsOptions);

    return response.status(200).json(migrations);
  }

  if (request.method === "POST") {
    const migrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });

    if (migrations.length > 0) {
      return response.status(201).json(migrations);
    }

    return response.status(200).json(migrations);
  }

  return response.status(405).end();
}
