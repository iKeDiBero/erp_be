import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface TokenPayload {
  sub: number;
  email: string;
  jti: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly refreshTokenExpiryMs = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.dataSource.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existingUser.length > 0) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar el nuevo usuario
    const result = await this.dataSource.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
    );

    return {
      message: 'Usuario registrado exitosamente',
      userId: result.insertId,
    };
  }

  async login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string) {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const users = await this.dataSource.query(
      'SELECT id, email, password, name, is_active FROM users WHERE email = ?',
      [email],
    );

    if (users.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const user = users[0];

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user, deviceInfo, ipAddress);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshTokens(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    // Verificar el refresh token
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Verificar que el token existe en la base de datos y no está revocado
    const storedTokens = await this.dataSource.query(
      'SELECT id, user_id, is_revoked, expires_at FROM refresh_tokens WHERE token = ?',
      [refreshToken],
    );

    if (storedTokens.length === 0) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const storedToken = storedTokens[0];

    if (storedToken.is_revoked) {
      // Posible robo de token - revocar todos los tokens del usuario
      await this.revokeAllUserTokens(storedToken.user_id);
      throw new UnauthorizedException('Token revocado. Todas las sesiones han sido cerradas por seguridad.');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Obtener usuario
    const users = await this.dataSource.query(
      'SELECT id, email, name, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [payload.sub],
    );

    if (users.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado o desactivado');
    }

    const user = users[0];

    // Revocar el refresh token actual (rotación de tokens)
    await this.dataSource.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE id = ?',
      [storedToken.id],
    );

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user, deviceInfo, ipAddress);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async logout(userId: number, accessTokenJti: string, refreshToken?: string) {
    // Agregar access token a la blacklist
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await this.dataSource.query(
      'INSERT INTO token_blacklist (token_jti, user_id, expires_at) VALUES (?, ?, ?)',
      [accessTokenJti, userId, accessTokenExpiry],
    );

    // Revocar refresh token si se proporciona
    if (refreshToken) {
      await this.dataSource.query(
        'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE token = ? AND user_id = ?',
        [refreshToken, userId],
      );
    }

    return { message: 'Sesión cerrada exitosamente' };
  }

  async logoutAllDevices(userId: number, currentAccessTokenJti: string) {
    // Agregar access token actual a la blacklist
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await this.dataSource.query(
      'INSERT INTO token_blacklist (token_jti, user_id, expires_at) VALUES (?, ?, ?)',
      [currentAccessTokenJti, userId, accessTokenExpiry],
    );

    // Revocar todos los refresh tokens del usuario
    await this.revokeAllUserTokens(userId);

    return { message: 'Todas las sesiones han sido cerradas' };
  }

  async getActiveSessions(userId: number) {
    const sessions = await this.dataSource.query(
      `SELECT id, device_info, ip_address, created_at, expires_at 
       FROM refresh_tokens 
       WHERE user_id = ? AND is_revoked = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId],
    );

    return sessions;
  }

  async revokeSession(userId: number, sessionId: number) {
    const result = await this.dataSource.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE id = ? AND user_id = ?',
      [sessionId, userId],
    );

    if (result.affectedRows === 0) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    return { message: 'Sesión revocada exitosamente' };
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT id FROM token_blacklist WHERE token_jti = ?',
      [jti],
    );
    return result.length > 0;
  }

  async validateUser(userId: number) {
    const users = await this.dataSource.query(
      'SELECT id, email, name, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [userId],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  private async generateTokens(
    user: { id: number; email: string },
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const jti = uuidv4();

    // Access token (corta duración)
    const accessTokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      jti,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: this.accessTokenExpiry,
    });

    // Refresh token (larga duración)
    const refreshTokenJti = uuidv4();
    const refreshTokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      jti: refreshTokenJti,
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTokenExpiry,
    });

    // Guardar refresh token en la base de datos
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiryMs);
    await this.dataSource.query(
      `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, refreshToken, deviceInfo || null, ipAddress || null, expiresAt],
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutos en segundos
    };
  }

  private async revokeAllUserTokens(userId: number) {
    await this.dataSource.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE user_id = ? AND is_revoked = FALSE',
      [userId],
    );
  }
}
