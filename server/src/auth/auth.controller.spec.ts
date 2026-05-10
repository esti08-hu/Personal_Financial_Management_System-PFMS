import { Test, TestingModule } from '@nestjs/testing'
import { EmailConfirmationService } from 'src/emailConfirmation/emailConfirmation.service'
import { UsersService } from 'src/users/users.service'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { PasswordService } from './services/password.service'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: EmailConfirmationService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            confirmEmail: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
