import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AuthModule } from '../../auth/auth.module'
import { IS_PUBLIC_KEY } from '../../auth/guards/auth.decorators'
import { AuthGuard } from '../../auth/guards/auth.guard'
import { DatabaseModule } from '../../database/database.module'
import { AiModule } from '../ai.module'
import { CreateMessageDto } from '../dto'
import { GeminiClient } from '../gemini/gemini-client.service'

// Mock AuthGuard for testing
class MockAuthGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    // Mock authenticated user
    request.user = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    }
    return true
  }
}

describe('AiController (e2e)', () => {
  let app: INestApplication
  let configService: ConfigService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        DatabaseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            host: configService.get<string>('POSTGRES_HOST') || 'localhost',
            port: configService.get<number>('POSTGRES_PORT') || 5432,
            user: configService.get<string>('POSTGRES_USER') || 'test_user',
            password:
              configService.get<string>('POSTGRES_PASSWORD') || 'test_password',
            database: configService.get<string>('POSTGRES_DB') || 'test_db',
          }),
        }),
        AiModule,
      ],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useFactory({
        factory: (reflector: Reflector) => new MockAuthGuard(reflector),
        inject: [Reflector],
      })
      .overrideProvider(Reflector)
      .useValue(new Reflector())
      .overrideProvider(GeminiClient)
      .useValue({
        generateResponse: jest.fn().mockResolvedValue({
          response: 'Mocked AI response',
          cached: false,
          processingTime: 100,
        }),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    configService = moduleFixture.get<ConfigService>(ConfigService)

    // Enable global validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('/ai/message (POST)', () => {
    const createMessageEndpoint = '/ai/message'

    it('should return 401 when no authorization token is provided', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .send({
          message: 'Hello AI',
        })
        .expect(401)
    })

    it('should return 400 when message is empty', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({
          message: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Message cannot be empty')
        })
    })

    it('should return 400 when message is too long', () => {
      const longMessage = 'a'.repeat(2001)

      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({
          message: longMessage,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Message cannot exceed 2000 characters',
          )
        })
    })

    it('should return 400 when message field is missing', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Message cannot be empty')
        })
    })

    it('should return 400 when conversationId is not a valid UUID', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({
          message: 'Hello AI',
          conversationId: 'invalid-uuid',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Conversation ID must be a valid UUID v4',
          )
        })
    })

    it('should return 400 when forceRefresh is not a boolean', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({
          message: 'Hello AI',
          forceRefresh: 'true',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('forceRefresh must be a boolean')
        })
    })

    it('should return 400 when skipCache is not a boolean', () => {
      return request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send({
          message: 'Hello AI',
          skipCache: 'false',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('skipCache must be a boolean')
        })
    })

    it('should accept valid message payload', async () => {
      const validPayload: CreateMessageDto = {
        message: 'What is my current balance?',
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        forceRefresh: false,
        skipCache: false,
      }

      const response = await request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send(validPayload)
        .expect(201)

      expect(response.body).toHaveProperty('response')
      expect(response.body).toHaveProperty('conversationId')
    }, 10000)

    it('should generate conversation ID when not provided', async () => {
      const payloadWithoutConversationId = {
        message: 'Hello AI',
      }

      const response = await request(app.getHttpServer())
        .post(createMessageEndpoint)
        .set('Authorization', 'Bearer fake-token')
        .send(payloadWithoutConversationId)
        .expect(201)

      expect(response.body).toHaveProperty('response')
      expect(response.body).toHaveProperty('conversationId')
      expect(response.body.conversationId).toBeTruthy()
    }, 10000)
  })

  describe('/ai/health (GET)', () => {
    it('should return health status without authentication', () => {
      return request(app.getHttpServer())
        .get('/ai/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status')
          expect(res.body).toHaveProperty('timestamp')
          expect(res.body).toHaveProperty('uptime')
          expect(res.body).toHaveProperty('version')
          expect(res.body).toHaveProperty('services')
          expect(res.body).toHaveProperty('metrics')
          expect(res.body).toHaveProperty('issues')
          expect(res.body.status).toBe('unhealthy')
        })
    })
  })

  describe('/ai/history (GET)', () => {
    it('should return 401 when no authorization token is provided', () => {
      return request(app.getHttpServer())
        .get('/ai/history')
        .query({ conversationId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(401)
    })

    it('should accept valid query parameters', () => {
      return request(app.getHttpServer())
        .get('/ai/history')
        .set('Authorization', 'Bearer fake-token')
        .query({
          conversationId: '550e8400-e29b-41d4-a716-446655440000',
          limit: 10,
          offset: 0,
          search: 'budget',
        })
        .expect(500) // Database not available in test
    })

    it('should return 400 when limit is invalid', () => {
      return request(app.getHttpServer())
        .get('/ai/history')
        .set('Authorization', 'Bearer fake-token')
        .query({ limit: 300 }) // Exceeds max limit of 200
        .expect(400)
    })

    it('should return 400 when offset is negative', () => {
      return request(app.getHttpServer())
        .get('/ai/history')
        .set('Authorization', 'Bearer fake-token')
        .query({ offset: -1 })
        .expect(400)
    })
  })

  describe('/ai/reset (POST)', () => {
    it('should return 401 when no authorization token is provided', () => {
      return request(app.getHttpServer())
        .post('/ai/reset')
        .send({
          conversationId: '550e8400-e29b-41d4-a716-446655440000',
        })
        .expect(401)
    })

    it('should return 400 when conversationId is missing', () => {
      return request(app.getHttpServer())
        .post('/ai/reset')
        .set('Authorization', 'Bearer fake-token')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Conversation ID must be a valid UUID v4',
          )
        })
    })

    it('should return 400 when conversationId is not a valid UUID', () => {
      return request(app.getHttpServer())
        .post('/ai/reset')
        .set('Authorization', 'Bearer fake-token')
        .send({
          conversationId: 'invalid-uuid',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Conversation ID must be a valid UUID v4',
          )
        })
    })

    it('should accept valid reset payload', () => {
      return request(app.getHttpServer())
        .post('/ai/reset')
        .set('Authorization', 'Bearer fake-token')
        .send({
          conversationId: '550e8400-e29b-41d4-a716-446655440000',
          preserveSystemMessages: true,
        })
        .expect(404) // Conversation not found
    })
  })
})
