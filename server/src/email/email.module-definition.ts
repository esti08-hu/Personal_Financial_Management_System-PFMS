import { ConfigurableModuleBuilder } from '@nestjs/common';
import EmailOptions from './emailOptions.interface';

export const {
  ConfigurableModuleClass: ConfigurableEmailModule,
  MODULE_OPTIONS_TOKEN: EMAIL_CONFIG_OPTIONS,
} = new ConfigurableModuleBuilder<EmailOptions>().build();
