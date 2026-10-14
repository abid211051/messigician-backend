import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${config.getOrThrow<string>('BACKEND_URI')}/auth/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Google account email is unavailable');
    }

    return this.authService.findOrCreateUser({
      email,
      fname: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value,
    });
  }
}
