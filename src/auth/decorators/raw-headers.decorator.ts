import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const RawHeaders = req.rawHeaders;

    if (!RawHeaders)
      throw new InternalServerErrorException(
        'RawHeaders not found in (request)',
      );

    return RawHeaders;
  },
);
