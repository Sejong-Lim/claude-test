const { test } = require('node:test');
const assert = require('node:assert');

test('basic assertion', () => {
  assert.strictEqual(1 + 1, 2);
});

test('string check', () => {
  const msg = 'Hello from Node.js!';
  assert.ok(msg.includes('Node.js'));
});
