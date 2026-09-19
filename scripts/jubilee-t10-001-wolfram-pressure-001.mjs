import assert from 'node:assert/strict';

const carryDepth = (n, base) => {
  let value = n + 1;
  let depth = 0;
  while (value % base === 0) {
    depth += 1;
    value /= base;
  }
  return depth;
};

const depth2Bases = (n, maxBase = 100) => {
  const out = [];
  for (let b = 2; b <= maxBase; b += 1) {
    if ((n + 1) % (b * b) === 0) out.push(b);
  }
  return out;
};

assert.deepEqual(depth2Bases(48), [7]);
assert.deepEqual(depth2Bases(49), [5]);
assert.equal(carryDepth(48, 7), 2);
assert.equal(carryDepth(49, 5), 2);
assert.equal(carryDepth(48, 7) >= 3, false);
assert.equal(carryDepth(49, 5) >= 3, false);

assert.equal((48).toString(7), '66');
assert.equal((49).toString(7), '100');
assert.equal((49).toString(5), '144');
assert.equal((50).toString(5), '200');

const pell = [];
for (let x = 1; x <= 500; x += 1) {
  for (let y = 1; y <= 500; y += 1) {
    if (x * x - 2 * y * y === -1) pell.push([x, y]);
  }
}
assert.deepEqual(pell.slice(0, 4), [[1,1],[7,5],[41,29],[239,169]]);

const step = ([x, y]) => [3 * x + 4 * y, 2 * x + 3 * y];
let pair = [1, 1];
for (let i = 0; i < 6; i += 1) {
  assert.equal(pair[0] ** 2 - 2 * pair[1] ** 2, -1);
  if (pair[1] >= 2) {
    const [x, y] = pair;
    assert.equal(x * x, y * y + (y - 1) * y + (y - 1));
    assert.equal(x * x + 1, 2 * y * y);
  }
  pair = step(pair);
}

const shiftBases = [];
for (let b = 2; b <= 100; b += 1) if (10 * b === 50) shiftBases.push(b);
assert.deepEqual(shiftBases, [5]);

const distanceTable = Array.from({length: 9}, (_, i) => [i + 1, 10 - (i + 1)]);
assert.deepEqual(distanceTable[7], [8, 2]);

console.log(JSON.stringify({
  specimen: 'JUBILEE-T10-001-WOLFRAM-PRESSURE-001',
  status: 'PASS',
  hinge: {
    transition1: '48 --CARRY^2_7--> 49',
    transition2: '49 --CARRY^2_5--> 50'
  },
  uniqueDepth2Bases: {
    '48_to_49': [7],
    '49_to_50': [5]
  },
  firstPellSolutions: pell.slice(0, 4),
  dateControl: 'delta=2 is formation-only, not probability evidence'
}, null, 2));
