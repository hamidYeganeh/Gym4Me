import { IsEnum } from 'class-validator';
import { BannerPlacement } from '../../common/enums';

export class ListBannersQueryDto {
  @IsEnum(BannerPlacement)
  placement!: BannerPlacement;
}
