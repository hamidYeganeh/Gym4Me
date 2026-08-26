import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { createHash } from 'node:crypto';
import { CoachLeadStage } from '../../common/enums';
import { CoachingService } from './coaching.service';

describe('CoachingService lead idempotency', () => {
  const coachUserId = new Types.ObjectId().toString();
  const dto = {
    idempotencyKey: 'lead-request-0001',
    contact: { name: 'مراجع تست', phone: '+989121234567' },
    stage: CoachLeadStage.NEW,
    notes: 'پیگیری',
    source: 'website',
  };

  function setup(fingerprint: string) {
    const stored = {
      _id: new Types.ObjectId(),
      coachUserId: new Types.ObjectId(coachUserId),
      contact: dto.contact,
      stage: dto.stage,
      notes: dto.notes,
      source: dto.source,
      idempotencyFingerprint: fingerprint,
      createdAt: new Date('2026-08-26T00:00:00.000Z'),
      updatedAt: new Date('2026-08-26T00:00:00.000Z'),
      toObject() {
        return this;
      },
    };
    const leadModel = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(stored),
      }),
      create: jest.fn(),
    };
    const audit = { log: jest.fn() };
    const service = Object.create(CoachingService.prototype) as CoachingService;
    Object.assign(service, { leadModel, audit });
    return { audit, leadModel, service };
  }

  it('returns the original lead without a second write or audit', async () => {
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          contact: dto.contact,
          stage: dto.stage,
          notes: dto.notes,
          source: dto.source,
        }),
      )
      .digest('hex');
    const { audit, leadModel, service } = setup(fingerprint);

    const result = await service.createLead(coachUserId, dto);

    expect(result.id).toBeDefined();
    expect(leadModel.create).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('rejects reuse of a key with a different payload', async () => {
    const { service } = setup('different-fingerprint');

    await expect(service.createLead(coachUserId, dto)).rejects.toThrow(
      ConflictException,
    );
  });
});
