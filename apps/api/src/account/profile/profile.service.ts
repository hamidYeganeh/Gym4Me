import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  Role,
  VerificationStatus,
} from '../../common/enums';
import type { JwtUser } from '../../common/types';
import {
  assertCanMutateAsRole,
  assertHasRole,
} from '../../common/utils/role-assert.util';
import {
  AthleteProfile,
  AthleteProfileDocument,
} from '../../schemas/athlete-profile.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import { UsersService } from '../../users/users.service';
import {
  SubmitCoachVerificationDto,
  UpdateAthleteProfileDto,
  UpdateCoachProfileDto,
  UpdateMeDto,
} from './dto/update-me.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(AthleteProfile.name)
    private readonly athleteModel: Model<AthleteProfileDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async getMe(userId: string) {
    const user = await this.users.findById(userId);
    return this.users.toPublic(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto, jwt: JwtUser) {
    const user = await this.users.findById(userId);

    if (dto.name) {
      if (dto.name.first !== undefined) user.name.first = dto.name.first;
      if (dto.name.last !== undefined) user.name.last = dto.name.last;
      user.markModified('name');
    }

    if (dto.avatar) {
      user.avatar.mediaId = dto.avatar.mediaId
        ? new Types.ObjectId(dto.avatar.mediaId)
        : undefined;
      user.markModified('avatar');
    }

    if (dto.demographics) {
      if (dto.demographics.gender !== undefined) {
        user.demographics.gender = dto.demographics.gender;
      }
      if (dto.demographics.birthDate !== undefined) {
        user.demographics.birthDate = new Date(dto.demographics.birthDate);
      }
      user.markModified('demographics');
    }

    if (dto.address) {
      const address = dto.address;
      if (address.provinceId !== undefined) {
        user.address.provinceId = address.provinceId
          ? new Types.ObjectId(address.provinceId)
          : undefined;
      }
      if (address.city !== undefined) user.address.city = address.city;
      if (address.street !== undefined) user.address.street = address.street;
      if (address.apartment !== undefined) {
        user.address.apartment = address.apartment;
      }
      if (address.postalCode !== undefined) {
        user.address.postalCode = address.postalCode;
      }
      if (address.point !== undefined) {
        user.address.point = address.point
          ? {
              type: 'Point',
              coordinates: [address.point.lng, address.point.lat],
            }
          : undefined;
      }
      user.markModified('address');
    }

    if (dto.code !== undefined && dto.code !== user.code) {
      const taken = await this.users
        .findByCode(dto.code)
        .then((u) => u && u._id.toString() !== userId);
      if (taken) throw new ConflictException('This code is already taken');
      user.code = dto.code;
    }

    await user.save();

    if (dto.code === undefined) {
      await this.users.refreshCodeIfAuto(user);
    }

    const publicUser = this.users.toPublic(user);
    if (this.isProfileComplete(user)) {
      await this.events.track({
        eventName: AnalyticsEventName.PROFILE_COMPLETED,
        actor: { userId, activeRole: jwt.activeRole },
      });
    }

    return publicUser;
  }

  async ensureAthleteProfile(userId: string) {
    return this.athleteModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { new: true, upsert: true },
    );
  }

  async ensureCoachProfile(userId: string) {
    return this.coachModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { new: true, upsert: true },
    );
  }

  async getAthleteProfile(jwt: JwtUser) {
    assertHasRole(jwt, Role.ATHLETE);
    const profile = await this.ensureAthleteProfile(jwt.sub);
    return this.toPublicAthlete(profile);
  }

  async updateAthleteProfile(jwt: JwtUser, dto: UpdateAthleteProfileDto) {
    assertCanMutateAsRole(jwt, Role.ATHLETE);
    const profile = await this.ensureAthleteProfile(jwt.sub);

    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.levelKey !== undefined) profile.levelKey = dto.levelKey;
    if (dto.body) {
      if (dto.body.heightCm !== undefined)
        profile.body.heightCm = dto.body.heightCm;
      if (dto.body.weightKg !== undefined)
        profile.body.weightKg = dto.body.weightKg;
      profile.markModified('body');
    }
    if (dto.privacy) {
      if (dto.privacy.metrics !== undefined) {
        profile.privacy.metrics = dto.privacy.metrics;
      }
      if (dto.privacy.photos !== undefined) {
        profile.privacy.photos = dto.privacy.photos;
      }
      profile.markModified('privacy');
    }
    if (dto.metrics?.preferredKeys !== undefined) {
      if (!profile.metrics) {
        profile.metrics = { preferredKeys: [] };
      }
      profile.metrics.preferredKeys = dto.metrics.preferredKeys;
      profile.markModified('metrics');
    }
    if (dto.sportIds !== undefined) profile.sportIds = dto.sportIds;
    if (dto.goalKeys !== undefined) profile.goalKeys = dto.goalKeys;
    if (dto.lifestyle) {
      const lifestyle = dto.lifestyle;
      if (lifestyle.bodyType !== undefined) {
        profile.lifestyle.bodyType = lifestyle.bodyType;
      }
      if (lifestyle.experience !== undefined) {
        profile.lifestyle.experience = lifestyle.experience;
      }
      if (lifestyle.sleepLevel !== undefined) {
        profile.lifestyle.sleepLevel = lifestyle.sleepLevel;
      }
      if (lifestyle.mood !== undefined) profile.lifestyle.mood = lifestyle.mood;
      if (lifestyle.diet !== undefined) profile.lifestyle.diet = lifestyle.diet;
      if (lifestyle.dailyCalories !== undefined) {
        profile.lifestyle.dailyCalories = lifestyle.dailyCalories ?? undefined;
      }
      if (lifestyle.activityKeys !== undefined) {
        profile.lifestyle.activityKeys = lifestyle.activityKeys;
      }
      profile.markModified('lifestyle');
    }
    if (dto.health) {
      const health = dto.health;
      if (health.bloodType !== undefined) {
        profile.health.bloodType = health.bloodType ?? undefined;
      }
      if (health.allergies !== undefined) {
        profile.health.allergies = health.allergies;
      }
      if (health.conditions !== undefined) {
        profile.health.conditions = health.conditions;
      }
      if (health.medications !== undefined) {
        profile.health.medications = health.medications;
      }
      if (health.note !== undefined) profile.health.note = health.note;
      profile.markModified('health');
    }

    await profile.save();
    return this.toPublicAthlete(profile);
  }

  async getCoachProfile(jwt: JwtUser) {
    assertHasRole(jwt, Role.COACH);
    const profile = await this.ensureCoachProfile(jwt.sub);
    return this.toPublicCoach(profile);
  }

  async updateCoachProfile(jwt: JwtUser, dto: UpdateCoachProfileDto) {
    assertCanMutateAsRole(jwt, Role.COACH);
    const profile = await this.ensureCoachProfile(jwt.sub);

    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.experience) {
      if (dto.experience.years !== undefined) {
        profile.experience.years = dto.experience.years;
      }
      if (dto.experience.headline !== undefined) {
        profile.experience.headline = dto.experience.headline;
      }
      profile.markModified('experience');
    }
    if (dto.serviceArea) {
      profile.serviceArea.cityId = dto.serviceArea.cityId
        ? new Types.ObjectId(dto.serviceArea.cityId)
        : undefined;
      profile.markModified('serviceArea');
    }
    if (dto.sportIds !== undefined) profile.sportIds = dto.sportIds;
    if (dto.specialtyKeys !== undefined) {
      profile.specialtyKeys = dto.specialtyKeys;
    }
    if (dto.pricing?.consultation) {
      const consultation = dto.pricing.consultation;
      if (consultation.inPerson !== undefined) {
        profile.pricing.consultation.inPerson =
          consultation.inPerson ?? undefined;
      }
      if (consultation.remote !== undefined) {
        profile.pricing.consultation.remote = consultation.remote ?? undefined;
      }
      profile.markModified('pricing');
    }

    await profile.save();
    return this.toPublicCoach(profile);
  }

  async submitCoachVerification(
    jwt: JwtUser,
    dto: SubmitCoachVerificationDto,
    request: Request,
  ) {
    assertCanMutateAsRole(jwt, Role.COACH);
    if (!dto.documentMediaIds.length) {
      throw new BadRequestException('At least one document is required');
    }

    const profile = await this.ensureCoachProfile(jwt.sub);
    const status = profile.verification?.status;
    if (status === VerificationStatus.PENDING) {
      throw new ConflictException('Verification already pending');
    }
    if (status === VerificationStatus.APPROVED) {
      throw new ConflictException('Already verified');
    }

    profile.verification = {
      status: VerificationStatus.PENDING,
      submittedAt: new Date(),
      documentMediaIds: dto.documentMediaIds.map(
        (id) => new Types.ObjectId(id),
      ),
      reviewNote: dto.note,
    };
    profile.markModified('verification');
    await profile.save();

    this.audit.log({
      action: AuditAction.COACH_VERIFICATION_SUBMITTED,
      actorId: jwt.sub,
      targetUserId: jwt.sub,
      metadata: { documentCount: dto.documentMediaIds.length },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.COACH_VERIFICATION_SUBMITTED,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
    });

    return this.toPublicCoach(profile);
  }

  private isProfileComplete(user: {
    name?: { first?: string; last?: string };
    demographics?: { gender?: string; birthDate?: Date };
  }): boolean {
    return !!(
      user.name?.first &&
      user.name?.last &&
      user.demographics?.gender &&
      user.demographics?.birthDate
    );
  }

  private toPublicAthlete(profile: AthleteProfileDocument) {
    return {
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      bio: profile.bio ?? null,
      levelKey: profile.levelKey ?? null,
      body: {
        heightCm: profile.body?.heightCm ?? null,
        weightKg: profile.body?.weightKg ?? null,
      },
      privacy: {
        metrics: profile.privacy?.metrics,
        photos: profile.privacy?.photos,
      },
      metrics: {
        preferredKeys: profile.metrics?.preferredKeys ?? [],
      },
      sportIds: profile.sportIds ?? [],
      goalKeys: profile.goalKeys ?? [],
      lifestyle: {
        bodyType: profile.lifestyle?.bodyType ?? null,
        experience: profile.lifestyle?.experience ?? null,
        sleepLevel: profile.lifestyle?.sleepLevel ?? null,
        mood: profile.lifestyle?.mood ?? null,
        diet: profile.lifestyle?.diet ?? null,
        dailyCalories: profile.lifestyle?.dailyCalories ?? null,
        activityKeys: profile.lifestyle?.activityKeys ?? [],
      },
      health: {
        bloodType: profile.health?.bloodType
          ? {
              group: profile.health.bloodType.group,
              rh: profile.health.bloodType.rh,
            }
          : null,
        allergies: profile.health?.allergies ?? [],
        conditions: profile.health?.conditions ?? null,
        medications: profile.health?.medications ?? null,
        note: profile.health?.note ?? null,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private toPublicCoach(profile: CoachProfileDocument) {
    return {
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      bio: profile.bio ?? null,
      experience: {
        years: profile.experience?.years ?? null,
        headline: profile.experience?.headline ?? null,
      },
      verification: {
        status: profile.verification?.status,
        submittedAt: profile.verification?.submittedAt ?? null,
        reviewedAt: profile.verification?.reviewedAt ?? null,
        reviewNote: profile.verification?.reviewNote ?? null,
        documentMediaIds: (profile.verification?.documentMediaIds ?? []).map(
          (id) => id.toString(),
        ),
      },
      serviceArea: {
        cityId: profile.serviceArea?.cityId?.toString() ?? null,
      },
      pricing: {
        consultation: {
          inPerson: profile.pricing?.consultation?.inPerson ?? null,
          remote: profile.pricing?.consultation?.remote ?? null,
        },
      },
      sportIds: profile.sportIds ?? [],
      specialtyKeys: profile.specialtyKeys ?? [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async getCoachProfileByUserId(userId: string) {
    const profile = await this.coachModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile) throw new NotFoundException('Coach profile not found');
    return profile;
  }
}
