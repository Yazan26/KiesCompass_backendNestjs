import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Presentation Layer - JWT Auth Guard
 * Protects routes requiring authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
