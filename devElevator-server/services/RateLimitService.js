class RateLimitService {
  constructor() {
    this.store = new Map();
    this.limits = {
      linkedin: {
        maxRequests: 5,
        windowMs: 12 * 60 * 60 * 1000, // 12 hours
      },
      readme: {
        maxRequests: 10,
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
      },
      // Add more services as needed
    };

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  checkLimit(userId, service) {
    const key = `${userId}-${service}`;
    const now = Date.now();
    const limit = this.limits[service];

    if (!limit) {
      throw new Error(`Unknown service: ${service}`);
    }

    const userLimit = this.store.get(key);

    if (!userLimit || now >= userLimit.resetAt) {
      // First request or window expired
      const resetAt = now + limit.windowMs;
      this.store.set(key, {
        count: 0,
        resetAt: resetAt,
      });
      return {
        limited: false,
        remaining: limit.maxRequests,
        resetAt: resetAt,
      };
    }

    // Check if limit exceeded
    if (userLimit.count >= limit.maxRequests) {
      return {
        limited: true,
        remaining: 0,
        resetAt: userLimit.resetAt,
      };
    }

    return {
      limited: false,
      remaining: limit.maxRequests - userLimit.count,
      resetAt: userLimit.resetAt,
    };
  }

  updateLimit(userId, service) {
    const key = `${userId}-${service}`;
    const userLimit = this.store.get(key);

    if (userLimit) {
      userLimit.count += 1;
      this.store.set(key, userLimit);
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now >= value.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

module.exports = new RateLimitService();
