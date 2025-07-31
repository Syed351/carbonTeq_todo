// src/main.ts
import { Command } from "commander";
import { serve } from "./commands/serve";


const program = new Command();

program
  .name("dms-cli")
  .description("Document Management CLI")
  .version("1.0.0");

program
  .command("serve")
  .description("Start the Express server")
  .action(() => {
    serve(); // Start Express app
  });

program.parse();
