import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  BannerAspectRatio,
  BannerLinkKind,
  BannerPlacement,
  BannerRadius,
  PublishStatus,
} from '../common/enums';
import { BannersService } from './banners.service';

describe('BannersService', () => {
  const adminId = new Types.ObjectId().toString();
  const request = {} as never;

  function serviceWith(model: Record<string, unknown>) {
    return new BannersService(
      model as never,
      {
        assertExists: jest.fn().mockResolvedValue(undefined),
      } as never,
      { log: jest.fn() } as never,
    );
  }

  it('generates a unique slug from the banner label on create', async () => {
    const create = jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      label: 'باشگاه‌های دوروبر',
      slug: 'bashgah-haye-dorobar',
      placement: BannerPlacement.DISCOVERY_HOME,
      ratio: BannerAspectRatio.RATIO_16_9,
      radius: BannerRadius.SURFACE,
      slides: [],
      publishStatus: PublishStatus.DRAFT,
      schedule: {},
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const findOne = jest
      .fn()
      .mockResolvedValueOnce({ _id: new Types.ObjectId() })
      .mockResolvedValueOnce(null);

    const service = serviceWith({
      create,
      findOne,
    });

    await service.create(
      {
        label: 'باشگاه‌های دوروبر',
        placement: BannerPlacement.DISCOVERY_HOME,
        ratio: BannerAspectRatio.RATIO_4_3,
        radius: BannerRadius.SURFACE,
        slides: [
          {
            mediaId: new Types.ObjectId().toString(),
            linkKind: BannerLinkKind.NONE,
          },
        ],
      },
      adminId,
      request,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'باشگاه‌های دوروبر',
        slug: 'bashgah-haye-dorobar-1',
        ratio: BannerAspectRatio.RATIO_4_3,
        radius: BannerRadius.SURFACE,
      }),
    );
  });

  it('applies one shared ratio to every slide in the public payload', async () => {
    const bannerId = new Types.ObjectId();
    const service = serviceWith({
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: bannerId,
              label: 'Pool promo',
              slug: 'pool-promo',
              placement: BannerPlacement.DISCOVERY_HOME,
              ratio: BannerAspectRatio.RATIO_2_1,
              radius: BannerRadius.SURFACE,
              slides: [
                {
                  mediaId: new Types.ObjectId(),
                  linkKind: BannerLinkKind.NONE,
                  gradient: false,
                },
                {
                  mediaId: new Types.ObjectId(),
                  linkKind: BannerLinkKind.NONE,
                  gradient: true,
                },
              ],
              publishStatus: PublishStatus.PUBLISHED,
              schedule: {},
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });

    const [banner] = await service.listActive({
      placement: BannerPlacement.DISCOVERY_HOME,
    });

    expect(banner).toMatchObject({
      slug: 'pool-promo',
      label: 'Pool promo',
      ratio: BannerAspectRatio.RATIO_2_1,
      radius: BannerRadius.SURFACE,
    });
    expect(banner.slides).toHaveLength(2);
    expect(banner.slides.every((slide) => !('ratio' in slide))).toBe(true);
  });

  it('throws when slug allocation is exhausted', async () => {
    const service = serviceWith({
      findOne: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    });

    await expect(
      service.create(
        {
          label: 'Promo',
          placement: BannerPlacement.DISCOVERY_HOME,
          slides: [
            {
              mediaId: new Types.ObjectId().toString(),
              linkKind: BannerLinkKind.NONE,
            },
          ],
        },
        adminId,
        request,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
