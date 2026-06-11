import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTenantFeatures } from '../../utils/tenant';

describe('getTenantFeatures', () => {
  it('should return an empty set when x-tenant-features header is missing', () => {
    const headers = new Headers();
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.size, 0);
  });

  it('should parse valid JSON array with known features', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', '["SHOP", "BLOG"]');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.has('SHOP'), true);
    assert.strictEqual(features.has('BLOG'), true);
    assert.strictEqual(features.size, 2);
  });

  it('should parse valid CSV with known features', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', 'SHOP,BLOG');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.has('SHOP'), true);
    assert.strictEqual(features.has('BLOG'), true);
    assert.strictEqual(features.size, 2);
  });

  it('should filter out unknown or invalid features', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', 'SHOP,INVALID_FEATURE,BLOG');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.has('SHOP'), true);
    assert.strictEqual(features.has('BLOG'), true);
    // @ts-expect-error - testing invalid feature
    assert.strictEqual(features.has('INVALID_FEATURE'), false);
    assert.strictEqual(features.size, 2);
  });

  it('should sanitize and format features (trim and uppercase)', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', ' shop , bLoG ');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.has('SHOP'), true);
    assert.strictEqual(features.has('BLOG'), true);
    assert.strictEqual(features.size, 2);
  });

  it('should handle malformed JSON and fallback to CSV logic correctly', () => {
    const headers = new Headers();
    // Starts with [ and ends with ] but is invalid JSON: JSON.parse throws, goes to catch, splits by `,`.
    // '["SHOP", "BLOG]' -> split by `,` -> '["SHOP"' and ' "BLOG]' -> trimmed to '["SHOP"' and '"BLOG]'
    // which won't match the valid features
    headers.set('x-tenant-features', '["SHOP", "BLOG]');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.size, 0); // They both get filtered out because of the quotes/brackets
  });

  it('should handle empty string header', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', '');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.size, 0);
  });

  it('should handle whitespace-only string', () => {
    const headers = new Headers();
    headers.set('x-tenant-features', '   ');
    const features = getTenantFeatures(headers);
    assert.strictEqual(features.size, 0);
  });
});
