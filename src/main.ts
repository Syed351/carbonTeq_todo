// src/main.ts
import { Command } from "commander";
import { serve } from "./commands/serve";
import { seed } from "./commands/seed"


const program = new Command();

program
  .name("dms-cli")
  .description("Document Management CLI")
  .version("1.0.0");

program
  .command("serve")
  .description("Start the Express server")
  .action(() => {
    serve(); 
  });

program
  .command("seed")
  .description("Seed the database with initial roles and permissions")
  .action(async () => {
    await seed();
    process.exit(0);
  });

program.parse();
