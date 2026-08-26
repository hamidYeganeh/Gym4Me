import { createApiClient } from '../client';
import { createAdminDataRightsApi } from './data-rights.client';

describe('admin data-rights client', () => {
  it('sends bounded pagination and status filters to the read-only queue', async () => {
    const fetchImpl = jest.fn(async (url: string) => {
      expect(url).toBe(
        'https://api.example/api/v1/admin/data-rights/account-deletions?page=2&page_size=40&status=cooling_off%2Ccancelled',
      );
      return new Response(
        JSON.stringify({
          message: 'common.success',
          result: [],
          pagination: {
            page: 2,
            page_size: 40,
            next: null,
            prev: 1,
            count: 0,
            total: 0,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const client = createApiClient({
      baseUrl: 'https://api.example/api/v1',
      fetch: fetchImpl as unknown as typeof fetch,
    });

    await createAdminDataRightsApi(client).listAccountDeletions({
      page: 2,
      page_size: 40,
      status: ['cooling_off', 'cancelled'],
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
