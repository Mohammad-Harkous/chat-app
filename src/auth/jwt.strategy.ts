import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the JwtStrategy with configuration parameters.
   * 
   * @param configService - The configuration service to retrieve environment variables.
   */
  constructor(private readonly configService: ConfigService) {
    // Call the parent constructor with strategy options
    super({
      // Extract JWT from the authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Do not ignore expiration of the token
      ignoreExpiration: false,
      // Use the secret key from configuration for verifying the token signature
      secretOrKey: configService.get('JWT_SECRET'), // 🔐 same as in JwtModule
    });
  }

  /**
   * Validates the payload of the JWT token.
   * 
   * @param payload - The payload of the JWT token which contains user details.
   * @returns An object containing the validated user's ID.
   */
  async validate(payload: any) {
    // Extract and return the userId from the token's payload
    return { userId: payload.sub };
  }
}