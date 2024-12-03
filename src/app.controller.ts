import { Controller, Get, Res } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly utilService: UtilsService

  ) { }

  @Get()
  getHello(@Res() res: Response) {
    this.utilService.generateResponse(null, 'Health check passed - Mohandes API', res);
  }
}
