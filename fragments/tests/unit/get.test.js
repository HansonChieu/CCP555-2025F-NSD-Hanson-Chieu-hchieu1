// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn().mockImplementation(() => {
        // Mock a successful response. 
        // For GetObjectCommand, return a stream with "hello" (matches test data)
        const { Readable } = require('stream');
        const s = new Readable();
        s.push('hello'); 
        s.push(null);
        return Promise.resolve({ Body: s });
      }),
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => 
    request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  
  test('GET /fragments?expand=1 returns full metadata', async () => {
    // First create a fragment
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Test fragment');

    // Then get with expand
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    
    // With expand=1, should return objects with metadata
    if (res.body.fragments.length > 0) {
      expect(res.body.fragments[0]).toHaveProperty('id');
      expect(res.body.fragments[0]).toHaveProperty('type');
      expect(res.body.fragments[0]).toHaveProperty('size');
    }
  });
});

describe('GET /v1/fragments/:id', () => {
  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'password1');
    
    expect(res.statusCode).toBe(404);
  });

  test('returns fragment data with correct Content-Type', async () => {
    // Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a test');

    const fragmentId = postRes.body.fragment.id;

    // Get the fragment
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toBe('This is a test');
  });

  test('converts markdown to html when .html extension used', async () => {
    // Create markdown fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    const fragmentId = postRes.body.fragment.id;

    // Get as HTML
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Hello World</h1>');
  });

  test('returns 415 for unsupported conversion', async () => {
    // Create text fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Plain text');

    const fragmentId = postRes.body.fragment.id;

    // Try to convert to unsupported type
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
  });
});

describe('GET /v1/fragments/:id/info', () => {
  test('returns metadata for existing fragment', async () => {
    // Create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Test data');

    const fragmentId = postRes.body.fragment.id;

    // Get metadata
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id', fragmentId);
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
    expect(res.body.fragment).toHaveProperty('size');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
  });

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/invalid-id/info')
      .auth('user1@email.com', 'password1');
    
    expect(res.statusCode).toBe(404);
  });
});