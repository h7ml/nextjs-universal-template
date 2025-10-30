// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-006] 测试安全工具函数;
// 应用的原则: 安全测试, 边界条件验证;
// }}
import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  generateSecureToken,
  constantTimeCompare,
  verifyCsrfToken,
  validateSqlIdentifier,
  sanitizeObject,
} from '../security';

describe('security', () => {
  describe('sanitizeHtml', () => {
    it('should remove dangerous tags', () => {
      const dirty = '<script>alert("XSS")</script><p>Hello</p>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Hello</p>');
    });

    it('should allow safe tags', () => {
      const dirty = '<b>Bold</b> <i>Italic</i>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe(dirty);
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<p>Hello <b>World</b></p>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Hello World');
    });

    it('should remove script tags', () => {
      const dirty = '<script>alert("XSS")</script>Text';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Text');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      const url = 'https://example.com/path';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should reject javascript: protocol', () => {
      const url = 'javascript:alert("XSS")';
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
    });

    it('should reject data: protocol', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>';
      const result = sanitizeUrl(url);
      expect(result).toBeNull();
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('constantTimeCompare', () => {
    it('should return true for equal strings', () => {
      expect(constantTimeCompare('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(constantTimeCompare('hello', 'world')).toBe(false);
    });

    it('should return false for different lengths', () => {
      expect(constantTimeCompare('hello', 'hello!')).toBe(false);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify valid token', () => {
      const token = 'test-token';
      expect(verifyCsrfToken(token, token)).toBe(true);
    });

    it('should reject invalid token', () => {
      expect(verifyCsrfToken('wrong', 'token')).toBe(false);
    });

    it('should reject null token', () => {
      expect(verifyCsrfToken(null, 'token')).toBe(false);
    });
  });

  describe('validateSqlIdentifier', () => {
    it('should accept valid identifiers', () => {
      expect(validateSqlIdentifier('user_name')).toBe(true);
      expect(validateSqlIdentifier('table123')).toBe(true);
    });

    it('should reject invalid characters', () => {
      expect(validateSqlIdentifier('user-name')).toBe(false);
      expect(validateSqlIdentifier('user.name')).toBe(false);
      expect(validateSqlIdentifier('user name')).toBe(false);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string fields', () => {
      const obj = {
        name: '<b>John</b>',
        bio: '<script>alert("XSS")</script>',
      };

      const result = sanitizeObject(obj);
      expect(result.name).toBe('John');
      expect(result.bio).not.toContain('<script>');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: '<b>John</b>',
        },
      };

      const result = sanitizeObject(obj);
      expect(result.user.name).toBe('John');
    });

    it('should handle arrays', () => {
      const obj = {
        tags: ['<b>tag1</b>', '<b>tag2</b>'],
      };

      const result = sanitizeObject(obj);
      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('tag2');
    });
  });
});
