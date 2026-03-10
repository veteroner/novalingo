// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { chunk, pickRandom, shuffle, unique } from '../array';

describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(5);
  });

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('pickRandom', () => {
  it('picks correct count', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(pickRandom(arr, 3)).toHaveLength(3);
  });

  it('elements come from original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const picked = pickRandom(arr, 2);
    picked.forEach((item) => {
      expect(arr).toContain(item);
    });
  });

  it('does not exceed array length', () => {
    const arr = [1, 2];
    expect(pickRandom(arr, 5).length).toBeLessThanOrEqual(5);
  });
});

describe('chunk', () => {
  it('splits into correct sized chunks', () => {
    const result = chunk([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('single chunk when size >= length', () => {
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
  });

  it('empty array → empty result', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('each item of size 1', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});

describe('unique', () => {
  it('removes duplicates from primitives', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('uses keyFn for objects', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
    ];
    const result = unique(items, (item) => String(item.id));
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual([1, 2]);
  });

  it('empty array stays empty', () => {
    expect(unique([])).toEqual([]);
  });
});
