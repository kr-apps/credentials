import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) =>
      ctx.inertia.always(async () => {
        await ctx.auth.check()

        if (!ctx.auth.user) return null

        const user = ctx.auth.user

        // Load roles and permissions
        await user.load('roles', (query) => {
          query.preload('permissions')
        })

        const permissions = await user.getPermissions()

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerifiedAt: user.emailVerifiedAt?.toISO(),
          createdAt: user.createdAt.toISO(),
          roles: user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            slug: role.slug,
          })),
          permissions: permissions.map((permission) => permission.slug),
        }
      }),
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    success: (ctx) => ctx.session?.flashMessages.get('success'),
    error: (ctx) => ctx.session?.flashMessages.get('error'),
    info: (ctx) => ctx.session?.flashMessages.get('info'),
    warning: (ctx) => ctx.session?.flashMessages.get('warning'),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
