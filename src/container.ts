// container.ts
import "reflect-metadata";
import { PinoLogger } from './logger/consol.logger';
import { container } from 'tsyringe';
import { DrizzleDocumentRepository } from './repositories/drizzleDocumentRepository';
import { DrizzlePermissionRepository } from './repositories/drizzlePermissionRepository';
import { DrizzleUserRepository } from './repositories/drizzleUserRepository';
import { DrizzleRoleRepository } from './repositories/drizzleRoleRepository';
import { RbacService } from "./services/Rbac.service";
import { AuthService } from "./services/Auth.service";
import { IUserRepository } from './interface/user.repository';
import { IDocumentRepository } from './interface/document.repository';
import { IPermissionRepository } from './interface/permission.repository';
import { IRoleRepository } from './interface/userRole.repository';
import { IAuthService } from "./interface/authInterface";
import { IRbacService } from "./interface/rbacInterface";
import { TOKENS } from './token'; 


container.register<IUserRepository>(TOKENS.IUserRepository, {
  useClass: DrizzleUserRepository,
});

container.register<IRoleRepository>(TOKENS.IRoleRepository, DrizzleRoleRepository);

container.register<IDocumentRepository>(TOKENS.IDocumentRepository, {
  useClass: DrizzleDocumentRepository,
});

container.register<IPermissionRepository>(TOKENS.IPermissionRepository, {
  useClass: DrizzlePermissionRepository,
});

container.register(TOKENS.ILogger, {
  useClass: PinoLogger,
});

container.register(TOKENS.IAuthService, {
  useClass: AuthService,
});

container.register(TOKENS.IRbacService,{
  useClass: RbacService,
})