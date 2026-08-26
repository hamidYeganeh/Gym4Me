import { StaffPermissionKey } from '../common/enums';
import { OwnerLifecycleController } from './owner-lifecycle.controller';

describe('OwnerLifecycleController permissions', () => {
  const userId = '507f1f77bcf86cd799439011';
  const clubId = '507f1f77bcf86cd799439012';

  function setup() {
    const lifecycle = {
      listSegments: jest.fn().mockResolvedValue({ result: [] }),
      listAtRiskMembers: jest.fn().mockResolvedValue({
        expiringSoon: [],
        lowCredits: [],
      }),
      listJourneys: jest.fn().mockResolvedValue({ result: [] }),
      enrollExpiringJourneys: jest.fn().mockResolvedValue({ enrolled: 0 }),
      advanceDueJourneys: jest.fn().mockResolvedValue({
        due: 0,
        sent: 0,
        completed: 0,
      }),
    };
    const staff = { assertStaffPermission: jest.fn().mockResolvedValue() };
    return {
      controller: new OwnerLifecycleController(
        lifecycle as never,
        staff as never,
      ),
      lifecycle,
      staff,
    };
  }

  it.each([
    ['segments', 'listSegments'],
    ['atRisk', 'listAtRiskMembers'],
    ['journeys', 'listJourneys'],
  ] as const)('requires reports.read for %s', async (method, serviceMethod) => {
    const { controller, lifecycle, staff } = setup();
    await controller[method](userId, clubId);
    expect(staff.assertStaffPermission).toHaveBeenCalledWith(
      clubId,
      userId,
      StaffPermissionKey.REPORTS_READ,
    );
    expect(lifecycle[serviceMethod]).toHaveBeenCalledWith(clubId);
  });

  it.each([
    ['enroll', 'enrollExpiringJourneys'],
    ['run', 'advanceDueJourneys'],
  ] as const)(
    'requires members.manage for %s',
    async (method, serviceMethod) => {
      const { controller, lifecycle, staff } = setup();
      await controller[method](userId, clubId);
      expect(staff.assertStaffPermission).toHaveBeenCalledWith(
        clubId,
        userId,
        StaffPermissionKey.MEMBERS_MANAGE,
      );
      if (serviceMethod === 'advanceDueJourneys') {
        expect(lifecycle[serviceMethod]).toHaveBeenCalledWith({ clubId });
      } else {
        expect(lifecycle[serviceMethod]).toHaveBeenCalledWith(clubId);
      }
    },
  );

  it('does not query lifecycle data when permission is denied', async () => {
    const { controller, lifecycle, staff } = setup();
    staff.assertStaffPermission.mockRejectedValueOnce(new Error('denied'));
    await expect(controller.atRisk(userId, clubId)).rejects.toThrow('denied');
    expect(lifecycle.listAtRiskMembers).not.toHaveBeenCalled();
  });
});
