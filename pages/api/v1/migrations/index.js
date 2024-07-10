import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationsOptions = {
      dbClient: dbClient,
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
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
