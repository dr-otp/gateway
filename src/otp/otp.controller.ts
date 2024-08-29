import { Body, Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { Auth, CurrentUser, User } from 'src/auth';
import { NATS_SERVICE } from 'src/config';
import { VerifyOtpDto } from './dto';

@Controller('otp')
@Auth()
export class OtpController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('health')
  healthCheck() {
    return 'OTP service is up and running (งツ)ว';
  }

  @Get('generate')
  generateOtp(@User() user: CurrentUser) {
    return this.client.send('otp.generate', { user }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('verify')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.client.send('otp.verify', verifyOtpDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
