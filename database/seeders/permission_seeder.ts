import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'

export default class extends BaseSeeder {
  async run() {
    // Create roles
    const adminRole = await Role.firstOrCreate(
      { slug: 'admin' },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Acceso completo al sistema (administrador)',
        isDefault: false,
      }
    )

    const holderRole = await Role.firstOrCreate(
      { slug: 'holder' },
      {
        name: 'Holder',
        slug: 'holder',
        description: 'Usuario que posee credenciales',
        isDefault: true,
      }
    )

    const issuerRole = await Role.firstOrCreate(
      { slug: 'issuer' },
      {
        name: 'Issuer',
        slug: 'issuer',
        description: 'Usuario que emite credenciales',
        isDefault: false,
      }
    )

    // Create permissions for users resource
    const viewUsers = await Permission.firstOrCreate(
      { slug: 'users:view' },
      {
        name: 'View Users',
        slug: 'users:view',
        resource: 'users',
        action: 'view',
        description: 'Ver lista de usuarios',
      }
    )

    const createUsers = await Permission.firstOrCreate(
      { slug: 'users:create' },
      {
        name: 'Create Users',
        slug: 'users:create',
        resource: 'users',
        action: 'create',
        description: 'Crear nuevos usuarios',
      }
    )

    const updateUsers = await Permission.firstOrCreate(
      { slug: 'users:update' },
      {
        name: 'Update Users',
        slug: 'users:update',
        resource: 'users',
        action: 'update',
        description: 'Actualizar cualquier usuario',
      }
    )

    const deleteUsers = await Permission.firstOrCreate(
      { slug: 'users:delete' },
      {
        name: 'Delete Users',
        slug: 'users:delete',
        resource: 'users',
        action: 'delete',
        description: 'Eliminar usuarios',
      }
    )

    const assignRoles = await Permission.firstOrCreate(
      { slug: 'roles:assign' },
      {
        name: 'Assign Roles',
        slug: 'roles:assign',
        resource: 'roles',
        action: 'assign',
        description: 'Asignar roles a usuarios',
      }
    )

    // Create system permissions
    const viewAdmin = await Permission.firstOrCreate(
      { slug: 'admin:view' },
      {
        name: 'View Admin Panel',
        slug: 'admin:view',
        resource: 'admin',
        action: 'view',
        description: 'Acceso al panel de administración',
      }
    )

    const manageRoles = await Permission.firstOrCreate(
      { slug: 'roles:manage' },
      {
        name: 'Manage Roles',
        slug: 'roles:manage',
        resource: 'roles',
        action: 'manage',
        description: 'Gestionar roles y permisos',
      }
    )

    // Assign all permissions to admin
    await adminRole
      .related('permissions')
      .sync([
        viewUsers.id,
        createUsers.id,
        updateUsers.id,
        deleteUsers.id,
        assignRoles.id,
        viewAdmin.id,
        manageRoles.id,
      ])

    // Holder gets no special permissions (basic access only)
    await holderRole.related('permissions').sync([])

    // Issuer can view users (to issue credentials)
    await issuerRole.related('permissions').sync([viewUsers.id])

    console.log('✅ Roles and permissions seeded successfully')
    console.log('   - Admin role: all permissions')
    console.log('   - Holder role: no special permissions')
    console.log('   - Issuer role: users:view')
  }
}
