import { randomUUID } from 'crypto'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { sql } from 'drizzle-orm'
import { Auth, google } from 'googleapis'
import * as jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken'
import { DrizzleService } from 'src/database/drizzle.service'
import { Role } from 'src/permissions/role.emum'
import { User } from 'src/modules/users/users.dto'
import { UsersService } from 'src/modules/users/users.service'
import { AuthService } from '../services/auth.service'

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly drizzle: DrizzleService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID')
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET')

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret)
  }
  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo

    this.oauthClient.setCredentials({
      access_token: token,
    })

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    })
    return userInfoResponse.data
  }

  async getCookiesForUser(user: User) {
    const { cookie: accessTokenCookie, token: accessToken } =
      this.authService.getCookieWithJwtAccessToken(user)
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user)

    await this.usersService.setRefreshToken(user.pid, refreshToken, [Role.USER])

    return {
      accessToken,
      refreshToken,
    }
  }

  async handleRegisteredUser(user: User) {
    if (!user.isRegisteredWithGoogle) {
      await this.drizzle.db.execute(sql`
        UPDATE "Users"
        SET "isRegisteredWithGoogle" = true, "isEmailConfirmed" = true
        WHERE "id" = ${user.id}
      `)
    }

    const { accessToken, refreshToken } = await this.getCookiesForUser(user)
    return {
      accessToken,
      refreshToken,
      user,
    }
  }

  async googleRegister(decodedToken: any): Promise<any> {
    console.log('Registering user with google')
    const userId = randomUUID()
    const pid = `USR-${Math.floor(100000 + Math.random() * 900000)}`
    await this.drizzle.db.execute(sql`
        INSERT INTO "Users" ("id", "pid", "name", "email","profilePicture", "isRegisteredWithGoogle", "isEmailConfirmed")
        VALUES (${userId}, ${pid}, ${decodedToken.name || decodedToken.email.split('@')[0]}, ${decodedToken.email}, ${decodedToken.picture || null}, ${true}, ${true});
    `)
    const user = await this.usersService.findUserByEmail(decodedToken.email)
    if (!user) throw new InternalServerErrorException()

    const { accessToken, refreshToken } = await this.getCookiesForUser(user)

    return {
      accessToken,
      refreshToken,
      user,
    }
  }

  async authenticate(token: string, isSignup: string): Promise<any> {
    if (!token) throw new UnauthorizedException('Google auth token is required')

    // Decode the token
    const decodedToken = jwt.decode(token) as JwtPayload

    if (!decodedToken || typeof decodedToken === 'string') {
      throw new UnauthorizedException('Invalid token')
    }

    // Validate the 'aud' and 'iss' properties
    const configuredClientId = this.configService.get('GOOGLE_AUTH_CLIENT_ID') || process.env.GOOGLE_AUTH_CLIENT_ID
    const isValidAudience =
      !configuredClientId ||
      configuredClientId === 'your_google_client_id_here' ||
      decodedToken.aud === configuredClientId ||
      decodedToken.aud === 'pfms-fea3f' ||
      decodedToken.firebase?.project_id === 'pfms-fea3f'

    if (!isValidAudience) {
      throw new UnauthorizedException('Invalid audience')
    }

    const isValidIssuer =
      decodedToken.iss === 'https://accounts.google.com' ||
      decodedToken.iss === 'accounts.google.com' ||
      (typeof decodedToken.iss === 'string' && decodedToken.iss.startsWith('https://securetoken.google.com/'))

    if (!isValidIssuer) {
      throw new UnauthorizedException('Invalid issuer')
    }

    const email = decodedToken.email

    const user = await this.usersService.findUserByEmail(email)

    if (user) {
      if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
        const now = new Date()
        const timeDefference = user.accountLockedUntil.getTime() - now.getTime()

        const minutes = Math.floor(timeDefference / 1000 / 60)
        throw new UnauthorizedException(
          `Account locked. Try again in ${minutes} minutes.`,
        )
      }
      return this.handleRegisteredUser(user)
    }

    // If user is not found, automatically register them with Google
    return this.googleRegister(decodedToken)
  }
}
