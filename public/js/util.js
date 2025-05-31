/**
 * Utility functions for ambient canvas animations
 */

const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
const HALF_PI = 0.5 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const floor = (n) => n | 0;
const rand = (n) => n * random();
const randIn = (min, max) => rand(max - min) + min;
const randRange = (n) => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
  let hm = 0.5 * m;
  return abs(((t + hm) % m) - hm) / hm;
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

// Math utilities
const MathUtils = {
  // Linear interpolation
  lerp: (a, b, t) => (1 - t) * a + t * b,

  // Map a value from one range to another
  map: (value, start1, stop1, start2, stop2) =>
    start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1)),

  // Distance between two points
  distance: (x1, y1, x2, y2) =>
    Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),

  // Random between min and max
  random: (min, max) => Math.random() * (max - min) + min,

  // Random integer between min and max (inclusive)
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  // Constrain a value between min and max
  constrain: (value, min, max) => Math.min(Math.max(value, min), max),

  // Normalize angle to 0-2PI range
  normalizeAngle: (angle) => {
    while (angle < 0) angle += Math.PI * 2;
    while (angle > Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  }
};

// Vector class for 2D operations
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  limit(max) {
    if (this.magnitude() > max) {
      this.normalize();
      this.multiply(max);
    }
    return this;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  static fromAngle(angle) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }
}

// Animation frame polyfill
const requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

// Canvas utilities
const CanvasUtils = {
  // Get canvas context with proper settings
  getContext: (canvas, contextType = "2d") => {
    const ctx = canvas.getContext(contextType);
    if (contextType === "2d") {
      // Set default composite operation for better performance
      ctx.globalCompositeOperation = "lighter";
    }
    return ctx;
  },

  // Resize canvas to match display size
  resizeCanvas: (canvas, pixelRatio = window.devicePixelRatio || 1) => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const needResize =
      canvas.width !== displayWidth * pixelRatio ||
      canvas.height !== displayHeight * pixelRatio;

    if (needResize) {
      canvas.width = displayWidth * pixelRatio;
      canvas.height = displayHeight * pixelRatio;

      const ctx = canvas.getContext("2d");
      ctx.scale(pixelRatio, pixelRatio);
    }

    return needResize;
  },

  // Clear canvas with optional background
  clear: (ctx, width, height, background = null) => {
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }
};

// Color utilities
const ColorUtils = {
  // Convert HSL to RGB
  hslToRgb: (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },

  // Create gradient string
  createGradient: (ctx, x1, y1, x2, y2, colors) => {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }
};

// Export utilities
if (typeof window !== "undefined") {
  window.MathUtils = MathUtils;
  window.Vector2D = Vector2D;
  window.requestAnimFrame = requestAnimFrame;
  window.CanvasUtils = CanvasUtils;
  window.ColorUtils = ColorUtils;
}
