/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'

/**
 * Admin panel access
 */
export const viewAdmin = Bouncer.ability(async (user: User) => {
  return user.hasPermission('admin:view')
})

/**
 * User management access
 */
export const manageUsers = Bouncer.ability(async (user: User) => {
  return user.hasPermission('users:view')
})

/**
 * Role assignment permission
 */
export const assignRoles = Bouncer.ability(async (user: User) => {
  return user.hasPermission('roles:assign')
})

/**
 * Role and permission management
 */
export const manageRoles = Bouncer.ability(async (user: User) => {
  return user.hasPermission('roles:manage')
})
