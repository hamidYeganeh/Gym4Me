import { createApiClient } from '../client';
import { createMediaApi } from './media.client';

describe('media client', () => {
  it('uploads private media and downloads it with authentication', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'media-a' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Blob(['image']), {
          status: 200,
          headers: { 'Content-Type': 'image/webp' },
        }),
      );
    const client = createApiClient({
      baseUrl: 'https://api.example/api/v1',
      fetch: fetchImpl as unknown as typeof fetch,
      getAccessToken: () => 'access-token',
    });
    const media = createMediaApi(client);

    await media.upload(new Blob(['image']), 'progress.webp', {
      visibility: 'private',
      purpose: 'progress_photo',
    });
    await media.download('media-a');

    const uploadBody = fetchImpl.mock.calls[0]?.[1]?.body as FormData;
    expect(uploadBody.get('visibility')).toBe('private');
    expect(uploadBody.get('purpose')).toBe('progress_photo');
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://api.example/api/v1/media/media-a/file',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    expect(
      (fetchImpl.mock.calls[1]?.[1]?.headers as Headers).get('Authorization'),
    ).toBe('Bearer access-token');
  });
});
