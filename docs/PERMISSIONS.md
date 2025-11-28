# Sistema de Roles y Permisos

Este documento describe el sistema de autorización implementado en la aplicación usando `@adonisjs/bouncer`.

## Tabla de Contenidos

- [Roles](#roles)
- [Permisos](#permisos)
- [Uso en el Backend](#uso-en-el-backend)
- [Uso en el Frontend](#uso-en-el-frontend)
- [Agregar Nuevos Recursos](#agregar-nuevos-recursos)

## Roles

La aplicación cuenta con 3 roles predefinidos:

| Rol        | Slug     | Descripción                                                                                               | Por Defecto |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| **Admin**  | `admin`  | Acceso completo al sistema. Los admins bypasean todas las verificaciones de autorización automáticamente. | No          |
| **Holder** | `holder` | Usuario que posee credenciales. Acceso básico sin permisos especiales.                                    | **Sí**      |
| **Issuer** | `issuer` | Usuario que emite credenciales. Puede ver la lista de usuarios.                                           | No          |

### Características Importantes

- **Admin Override**: Los usuarios con rol `admin` bypasean automáticamente TODAS las verificaciones de permisos y policies.
- **Rol por Defecto**: El rol `holder` se asigna automáticamente a nuevos usuarios.
- **Múltiples Roles**: Un usuario puede tener múltiples roles simultáneamente.

## Permisos

Los permisos siguen el formato `{resource}:{action}` (ej: `users:view`, `credentials:create`).

### Permisos Actuales

#### Recurso: Users

| Permiso      | Slug           | Descripción                  | Roles         |
| ------------ | -------------- | ---------------------------- | ------------- |
| View Users   | `users:view`   | Ver lista de usuarios        | Admin, Issuer |
| Create Users | `users:create` | Crear nuevos usuarios        | Admin         |
| Update Users | `users:update` | Actualizar cualquier usuario | Admin         |
| Delete Users | `users:delete` | Eliminar usuarios            | Admin         |

#### Recurso: Roles

| Permiso      | Slug           | Descripción                | Roles |
| ------------ | -------------- | -------------------------- | ----- |
| Assign Roles | `roles:assign` | Asignar roles a usuarios   | Admin |
| Manage Roles | `roles:manage` | Gestionar roles y permisos | Admin |

#### Recurso: Admin

| Permiso          | Slug         | Descripción                       | Roles |
| ---------------- | ------------ | --------------------------------- | ----- |
| View Admin Panel | `admin:view` | Acceso al panel de administración | Admin |

### Asignación de Permisos por Rol

- **Admin**: TODOS los permisos
- **Holder**: Ningún permiso especial
- **Issuer**: `users:view`

## Uso en el Backend

### Proteger Rutas con Middleware

#### Middleware de Roles

Requiere que el usuario tenga al menos uno de los roles especificados:

```typescript
// start/routes.ts
router
  .get('/admin/dashboard', ...)
  .middleware([
    middleware.auth(),
    middleware.verifyEmail(),
    middleware.role({ roles: ['admin'] })
  ])
```

#### Middleware de Permisos

Requiere que el usuario tenga al menos uno de los permisos especificados:

```typescript
router
  .get('/analytics', ...)
  .middleware([
    middleware.auth(),
    middleware.permission({ permissions: ['analytics:view'] })
  ])
```

### Usar Abilities en Controladores

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class AnalyticsController {
  async index({ bouncer, inertia }: HttpContext) {
    // Lanza error 403 si no tiene permiso
    await bouncer.authorize('viewAdmin')

    // Verificación condicional
    if (await bouncer.denies('viewAdmin')) {
      return inertia.render('errors/forbidden')
    }

    return inertia.render('analytics/index')
  }
}
```

### Usar Policies para Recursos

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async update({ bouncer, params, request }: HttpContext) {
    const user = await User.findOrFail(params.id)

    // Verifica si el usuario actual puede actualizar ESTE usuario específico
    await bouncer.with('UserPolicy').authorize('update', user)

    // Actualizar usuario...
  }
}
```

### Métodos Helper del Modelo User

```typescript
const user = await User.find(1)

// Verificar rol
await user.hasRole('admin') // => boolean
await user.hasAnyRole(['admin', 'issuer']) // => boolean
await user.isAdmin() // => boolean

// Verificar permiso
await user.hasPermission('users:view') // => boolean

// Obtener todos los permisos
const permissions = await user.getPermissions() // => Permission[]
```

## Uso en el Frontend

### Composable `useAuthorization`

```vue
<script setup lang="ts">
import { useAuthorization } from '~/composables/useAuthorization'

const { can, hasRole, isAdmin, isIssuer, user } = useAuthorization()
</script>

<template>
  <div>
    <!-- Mostrar solo a admins -->
    <Link v-if="isAdmin" href="/admin/dashboard"> Panel de Administración </Link>

    <!-- Mostrar según permiso -->
    <Button v-if="can('users:create')" @click="createUser"> Crear Usuario </Button>

    <!-- Verificar múltiples permisos -->
    <div v-if="canAny(['analytics:view', 'reports:view'])">
      Contenido visible con cualquiera de los permisos
    </div>

    <!-- Mostrar roles del usuario -->
    <div v-if="user">
      <p>Roles: {{ user.roles.map((r) => r.name).join(', ') }}</p>
    </div>
  </div>
</template>
```

### API del Composable

```typescript
const {
  user, // Computed<AuthUser | null>
  can, // (permission: string) => boolean
  canAny, // (permissions: string[]) => boolean
  canAll, // (permissions: string[]) => boolean
  hasRole, // (roleSlug: string) => boolean
  hasAnyRole, // (roleSlugs: string[]) => boolean
  isAdmin, // Computed<boolean>
  isHolder, // Computed<boolean>
  isIssuer, // Computed<boolean>
} = useAuthorization()
```

## Agregar Nuevos Recursos

Cuando agregues un nuevo recurso (ej: `credentials`, `verifications`), sigue estos pasos:

### 1. Crear Permisos

Edita `database/seeders/permission_seeder.ts` y agrega los permisos:

```typescript
// Crear permisos para credentials resource
const viewCredentials = await Permission.firstOrCreate(
  { slug: 'credentials:view' },
  {
    name: 'View Credentials',
    slug: 'credentials:view',
    resource: 'credentials',
    action: 'view',
    description: 'Ver credenciales',
  }
)

const createCredentials = await Permission.firstOrCreate(
  { slug: 'credentials:create' },
  {
    name: 'Create Credentials',
    slug: 'credentials:create',
    resource: 'credentials',
    action: 'create',
    description: 'Crear credenciales',
  }
)

// Asignar a roles
await issuerRole.related('permissions').attach([viewCredentials.id, createCredentials.id])
```

Ejecuta el seeder:

```bash
node ace db:seed
```

### 2. Crear Policy para el Recurso

Crea `app/policies/credential_policy.ts`:

```typescript
import User from '#models/user'
import Credential from '#models/credential'
import BasePolicy from '#policies/base_policy'

export default class CredentialPolicy extends BasePolicy {
  async view(user: User, credential: Credential) {
    // El propietario puede ver, o quien tenga permiso
    return credential.userId === user.id || (await user.hasPermission('credentials:view'))
  }

  async create(user: User) {
    return user.hasPermission('credentials:create')
  }

  async update(user: User, credential: Credential) {
    return credential.userId === user.id || (await user.hasPermission('credentials:update'))
  }

  async delete(user: User, credential: Credential) {
    return credential.userId === user.id || (await user.hasPermission('credentials:delete'))
  }
}
```

Registra la policy en `app/policies/main.ts`:

```typescript
import CredentialPolicy from '#policies/credential_policy'

export const policies = {
  UserPolicy,
  CredentialPolicy, // <- Agregar
}
```

### 3. Agregar Abilities (Opcional)

Si necesitas abilities generales (no atadas a un recurso específico), edita `app/abilities/main.ts`:

```typescript
export const manageCredentials = Bouncer.ability(async (user: User) => {
  return user.hasPermission('credentials:manage')
})
```

### 4. Proteger Rutas

En `start/routes.ts`:

```typescript
router
  .group(() => {
    router.get('/', [CredentialsController, 'index'])
    router.post('/', [CredentialsController, 'create'])
  })
  .prefix('/credentials')
  .middleware([middleware.auth(), middleware.permission({ permissions: ['credentials:view'] })])
```

### 5. Usar en Controladores

```typescript
export default class CredentialsController {
  async update({ bouncer, params }: HttpContext) {
    const credential = await Credential.findOrFail(params.id)

    // Usa la policy
    await bouncer.with('CredentialPolicy').authorize('update', credential)

    // ... actualizar credential
  }
}
```

### 6. Usar en Frontend

```vue
<template>
  <Button v-if="can('credentials:create')" @click="create"> Crear Credencial </Button>
</template>

<script setup>
const { can } = useAuthorization()
</script>
```

## Constantes de Permisos (Opcional pero Recomendado)

Para evitar hardcodear strings de permisos, crea `app/constants/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Roles
  ROLES_ASSIGN: 'roles:assign',
  ROLES_MANAGE: 'roles:manage',

  // Credentials
  CREDENTIALS_VIEW: 'credentials:view',
  CREDENTIALS_CREATE: 'credentials:create',
  CREDENTIALS_UPDATE: 'credentials:update',
  CREDENTIALS_DELETE: 'credentials:delete',

  // Admin
  ADMIN_VIEW: 'admin:view',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
```

Úsalas en tu código:

```typescript
import { PERMISSIONS } from '#constants/permissions'

// En middleware
.middleware([middleware.permission({ permissions: [PERMISSIONS.USERS_VIEW] })])

// En controllers
await user.hasPermission(PERMISSIONS.USERS_VIEW)

// En frontend
can(PERMISSIONS.CREDENTIALS_CREATE)
```

## Seguridad y Mejores Prácticas

1. **No permitas auto-modificación**: Los usuarios no deben poder cambiar sus propios roles (implementado en `AdminUsersController.assignRoles`)

2. **Admin siempre presente**: Asegúrate de que siempre exista al menos un usuario admin en el sistema

3. **Auditoría**: Usa los campos `assigned_by` y `assigned_at` en la tabla pivot `role_user` para trackear cambios

4. **OAuth users**: Los usuarios que inician sesión via Logto también funcionan con el sistema de roles normalmente

5. **Performance**: Los permisos se cargan una sola vez mediante `getPermissions()` que usa un Set para evitar duplicados

6. **No mezclar capas**: Usa middleware para proteger rutas O usa bouncer en controllers, no ambos para la misma verificación

## Archivos Clave

### Backend

- `app/models/user.ts` - Métodos helper de roles y permisos
- `app/models/role.ts` - Modelo de roles
- `app/models/permission.ts` - Modelo de permisos
- `app/abilities/main.ts` - Definición de abilities
- `app/policies/` - Policies por recurso
- `app/middleware/permission_middleware.ts` - Middleware de permisos
- `app/middleware/role_middleware.ts` - Middleware de roles
- `app/middleware/initialize_bouncer_middleware.ts` - Inicializa bouncer (incluye admin override)
- `database/seeders/permission_seeder.ts` - Seed inicial de roles y permisos

### Frontend

- `inertia/composables/useAuthorization.ts` - Composable Vue para verificar permisos
- `config/inertia.ts` - Comparte roles y permisos con frontend

### Configuración

- `start/routes.ts` - Definición de rutas protegidas
- `start/kernel.ts` - Registro de middleware

## Soporte

Para más información sobre Bouncer, consulta la [documentación oficial de AdonisJS](https://docs.adonisjs.com/guides/security/authorization).
