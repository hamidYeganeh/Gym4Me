import { Global, Module } from '@nestjs/common';
import { MongoTransactionService } from './mongo-transaction.service';

@Global()
@Module({
  providers: [MongoTransactionService],
  exports: [MongoTransactionService],
})
export class MongoTransactionModule {}
