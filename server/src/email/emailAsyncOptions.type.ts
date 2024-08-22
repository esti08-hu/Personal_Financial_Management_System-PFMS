import { ModuleMetadata } from '@nestjs/common'
import { FactoryProvider } from '@nestjs/common/interfaces/modules/provider.interface'
import EmailOptions from './emailOptions.interface'

type EmailAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<EmailOptions>, 'useFactory' | 'inject'>

export default EmailAsyncOptions
