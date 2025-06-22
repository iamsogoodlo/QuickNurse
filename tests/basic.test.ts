import { describe, it, expect, vi } from 'vitest';

// Mock express to avoid requiring the real module when importing the router
vi.mock('express', () => ({ Router: () => ({ post: vi.fn() }) }));
import verifyNurseOnline from '../api/utils/verifyNurseOnline';

describe('math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('verifyNurseOnline', () => {
  it('returns false when nurse not found', async () => {
    const mockModel = { findOne: vi.fn().mockResolvedValue(null) };
    const result = await verifyNurseOnline('nurse1', mockModel);
    expect(mockModel.findOne).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
