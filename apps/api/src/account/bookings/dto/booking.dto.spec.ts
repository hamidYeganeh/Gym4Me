import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ListBookingsQueryDto } from './booking.dto';

describe('ListBookingsQueryDto', () => {
  it('accepts operational search, sorting, and repeated statuses', () => {
    const dto = plainToInstance(ListBookingsQueryDto, {
      page: '2',
      page_size: '30',
      search: 'سارا',
      sortBy: 'startsAt',
      sortOrder: 'desc',
      status: 'confirmed,checked_in',
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto).toMatchObject({
      page: 2,
      page_size: 30,
      search: 'سارا',
      sortBy: 'startsAt',
      sortOrder: 'desc',
      status: ['confirmed', 'checked_in'],
    });
  });

  it('rejects unknown booking statuses', () => {
    const dto = plainToInstance(ListBookingsQueryDto, {
      status: 'confirmed,unknown',
    });

    expect(validateSync(dto)).not.toHaveLength(0);
  });
});
