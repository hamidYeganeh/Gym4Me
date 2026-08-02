import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { LocationKind } from '../../common/enums';
import { LocationService } from './location.service';

@ApiTags('basics')
@Public()
@Controller('basics/location')
export class LocationController {
  constructor(private readonly locations: LocationService) {}

  @Get('country')
  @ApiOperation({ summary: 'List countries' })
  listCountries() {
    return this.locations.listByKind(LocationKind.COUNTRY);
  }

  @Get('country/:id')
  @ApiOperation({ summary: 'Get a country' })
  getCountry(@Param('id') id: string) {
    return this.locations.getById(id);
  }

  @Get('country/:id/provinces')
  @ApiOperation({ summary: 'List provinces of a country' })
  listProvinces(@Param('id') id: string) {
    return this.locations.listChildren(id);
  }

  @Get('province/:id')
  @ApiOperation({ summary: 'Get a province' })
  getProvince(@Param('id') id: string) {
    return this.locations.getById(id);
  }

  @Get('province/:id/cities')
  @ApiOperation({ summary: 'List cities of a province' })
  listCities(@Param('id') id: string) {
    return this.locations.listChildren(id);
  }

  @Get('city/:id')
  @ApiOperation({ summary: 'Get a city' })
  getCity(@Param('id') id: string) {
    return this.locations.getById(id);
  }

  @Get('city/:id/districts')
  @ApiOperation({ summary: 'List districts of a city' })
  listDistricts(@Param('id') id: string) {
    return this.locations.listChildren(id);
  }

  @Get('district/:id')
  @ApiOperation({ summary: 'Get a district' })
  getDistrict(@Param('id') id: string) {
    return this.locations.getById(id);
  }
}
