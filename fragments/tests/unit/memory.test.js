const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('memory data functions', () => {
  const ownerId = 'user123';
  const fragmentId = 'frag-123';
  
  const fragment = {
    ownerId: ownerId,
    id: fragmentId,
    type: 'text/plain',
    size: 256,
  };

  describe('writeFragment and readFragment', () => {
    test('writes and reads a fragment', async () => {
      await writeFragment(fragment);
      const result = await readFragment(ownerId, fragmentId);
      
      expect(result).toEqual(fragment);
    });

    test('returns undefined for missing fragment', async () => {
      const result = await readFragment('bad-owner', 'bad-id');
      expect(result).toBeUndefined();
    });
  });

  describe('writeFragmentData and readFragmentData', () => {
    test('writes and reads fragment data', async () => {
      const data = Buffer.from('Hello World');
      await writeFragmentData(ownerId, fragmentId, data);
      
      const result = await readFragmentData(ownerId, fragmentId);
      expect(result.toString()).toBe('Hello World');
    });

    test('returns undefined for missing data', async () => {
      const result = await readFragmentData('bad-owner', 'bad-id');
      expect(result).toBeUndefined();
    });
  });

  describe('listFragments', () => {
    test('returns list of fragment ids', async () => {
      await writeFragment({ ownerId: ownerId, id: 'frag-1', type: 'text/plain' });
      await writeFragment({ ownerId: ownerId, id: 'frag-2', type: 'text/plain' });
      
      const result = await listFragments(ownerId);
      
      expect(result).toContain('frag-1');
      expect(result).toContain('frag-2');
    });

    test('returns empty array if no fragments', async () => {
      const result = await listFragments('user-with-nothing');
      expect(result).toEqual([]);
    });
  });

  describe('deleteFragment', () => {
    test('deletes a fragment', async () => {
      await writeFragment(fragment);
      await writeFragmentData(ownerId, fragmentId, Buffer.from('data'));
      
      await deleteFragment(ownerId, fragmentId);
      
      expect(await readFragment(ownerId, fragmentId)).toBeUndefined();
      expect(await readFragmentData(ownerId, fragmentId)).toBeUndefined();
    });
  });
});