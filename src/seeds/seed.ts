import { db } from '../db';
import { Roles } from '../schema/roles.schema';
import { Permissions } from '../schema/permission.schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const adminId = uuidv4();
  const userId = uuidv4();

  await db.insert(Roles).values([
    { id: adminId, name: 'Admin' },
    { id: userId, name: 'User' }
  ]);

  const actions = ['create', 'read', 'update', 'delete'] as const;

  const adminPermissions = actions.map(action => ({
    id: uuidv4(),
    roleId: adminId,
    action,
    allowed: true
  }));

  const userPermissions = [
    { id: uuidv4(), roleId: userId, action: 'create', allowed: true },
    { id: uuidv4(), roleId: userId, action: 'read', allowed: true },
    { id: uuidv4(), roleId: userId, action: 'update', allowed: false },
    { id: uuidv4(), roleId: userId, action: 'delete', allowed: false },
  ];

  await db.insert(Permissions).values([...adminPermissions, ...userPermissions]);
}

seed().then(() => process.exit(0)).catch(console.error);
