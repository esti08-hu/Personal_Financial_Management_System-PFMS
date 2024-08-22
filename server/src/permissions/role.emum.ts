export enum Role {
  ADMIN = 'superadmin',
  SALES = 'sales',
  TEMP_USER = 'tempuser',
  USER = 'user',
}
export enum Permission {
  CREATE_USER = 'create-user',
  APPROVE_USER = 'approve-user',
  RUN_SEEDER = 'run-seeder',
}

export const ROLE_PERMISSION_ASSOCIATION = [
  {
    label: 'Super Admin',
    role: Role.ADMIN,
    permissions: [
      Permission.CREATE_USER,
      Permission.APPROVE_USER,
      Permission.RUN_SEEDER,
    ],
  },
  {
    label: 'User',
    role: Role.USER,
    permissions: [],
  },
]
