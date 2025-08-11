// container.ts
import "reflect-metadata";
import { PinoLogger } from '../../logger/pinoLogger';
import { container } from 'tsyringe';
import { DrizzleDocumentRepository } from '../../repo/document.repo';
import { DrizzlePermissionRepository } from '../../repo/Permission.repo';
import { DrizzleUserRepository } from '../../repo/user.repo';
import { DrizzleRoleRepository } from '../../repo/role.repo';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { IPermissionRepository } from '../../../domain/repositories/permission.repository';
import { IRoleRepository } from '../../../domain/repositories/userRole.repository';
import { TOKENS } from './token'; 
import { ILogger } from "../../interface/logger.interface";



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

container.register<ILogger>(TOKENS.ILogger, {
  useClass: PinoLogger,
});
 