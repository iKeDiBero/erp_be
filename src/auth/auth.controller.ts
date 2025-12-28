import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  Headers,
  Ip,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login(loginDto, userAgent, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken, userAgent, ip);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req,
    @Body() body: { refreshToken?: string },
  ) {
    return this.authService.logout(req.user.id, req.user.jti, body.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(@Request() req) {
    return this.authService.logoutAllDevices(req.user.id, req.user.jti);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Request() req) {
    return this.authService.getActiveSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Request() req, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, parseInt(sessionId, 10));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
  }
}
