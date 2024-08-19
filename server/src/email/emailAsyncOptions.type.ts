import { ModuleMetadata } from '@nestjs/common';
import EmailOptions from './emailOptions.interface';
import { FactoryProvider } from '@nestjs/common/interfaces/modules/provider.interface';

type EmailAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<EmailOptions>, 'useFactory' | 'inject'>;

export default EmailAsyncOptions;
