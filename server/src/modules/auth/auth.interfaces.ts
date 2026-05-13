import { Role } from 'src/permissions/role.emum'

export interface AccessTokenPayload {
  id: string
  pid: string
  name: string
  roles: Role[]
}

export interface RefreshTokenPayload {
  pid: string
  roles: Role[]
}
