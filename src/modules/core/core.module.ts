import { Module } from '@nestjs/common';
import { OrgaosModule } from './orgaos/orgaos.module';

@Module({
  imports: [OrgaosModule],
  exports: [OrgaosModule],
})
export class CoreModule {}
