export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
