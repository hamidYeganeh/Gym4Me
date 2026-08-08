import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqItem, FaqItemSchema } from '../schemas/faq-item.schema';
import {
  SupportTicket,
  SupportTicketSchema,
} from '../schemas/support-ticket.schema';
import {
  SupportTicketMessage,
  SupportTicketMessageSchema,
} from '../schemas/support-ticket-message.schema';
import { AccountSupportController } from './account-support.controller';
import { AdminSupportController } from './admin-support.controller';
import { AdminSupportService } from './admin-support.service';
import { FaqService } from './faq.service';
import { SupportController } from './support.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: SupportTicketMessage.name, schema: SupportTicketMessageSchema },
      { name: FaqItem.name, schema: FaqItemSchema },
    ]),
  ],
  controllers: [
    SupportController,
    AccountSupportController,
    AdminSupportController,
  ],
  providers: [SupportTicketsService, AdminSupportService, FaqService],
  exports: [SupportTicketsService, FaqService],
})
export class SupportModule {}
