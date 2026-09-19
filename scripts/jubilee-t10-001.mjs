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

const pellStep = ([x, y]) => [3 * x + 4 * y, 2 * x + 3 * y];
const pellNorm = ([x, y]) => x * x - 2 * y * y;

assert.equal(7 * 7, 49);
assert.equal(49 + 1, 50);
assert.equal((49).toString(7), '100');
assert.equal((50).toString(7), '101');
assert.equal((48).toString(7), '66');

assert.equal((49).toString(5), '144');
assert.equal((50).toString(5), '200');
assert.equal(carryDepth(49, 5), 2);

assert.equal(7 ** 2 - 2 * 5 ** 2, -1);
assert.equal(7 ** 2 + 1, 2 * 5 ** 2);

const orbit = [[1, 1]];
for (let i = 0; i < 5; i += 1) orbit.push(pellStep(orbit.at(-1)));
assert.deepEqual(orbit.slice(0, 4), [[1,1],[7,5],[41,29],[239,169]]);
for (const pair of orbit) assert.equal(pellNorm(pair), -1);

for (const [x, y] of orbit.slice(1)) {
  assert.equal(x * x, 2 * y * y - 1);
  const digitsBefore = [1, y - 1, y - 1];
  const digitsAfter = [2, 0, 0];
  const decode = ([a, b, c]) => a * y * y + b * y + c;
  assert.equal(decode(digitsBefore), x * x);
  assert.equal(decode(digitsAfter), x * x + 1);
}

assert.equal(2 * 5 ** 0, 2);
assert.equal(2 * 5 ** 1, 10);
assert.equal(2 * 5 ** 2, 50);
assert.equal(2 * 5 ** 3, 250);
assert.equal((10).toString(5), '20');
assert.equal((50).toString(5), '200');
assert.equal((125).toString(5), '1000');

const radixSweep = [];
for (let base = 2; base <= 16; base += 1) {
  radixSweep.push({
    base,
    before: (49).toString(base),
    after: (50).toString(base),
    carryDepth: carryDepth(49, base),
  });
}
assert.equal(radixSweep.find((x) => x.base === 5)?.carryDepth, 2);

const formation = {
  currentHebrewDay: 8,
  proclamationHebrewDay: 10,
  successorDistance: 10 - 8,
  evidenceClass: 'formation_witness_not_probability_evidence',
};
assert.equal(formation.successorDistance, 2);

const dateRemovedKernel = {
  sevenfoldCompletion: 49,
  jubileeSuccessor: 50,
  pellPair: [7, 5],
  carryDepthBase5: 2,
  proclamationGateRequired: true,
  releaseDistinctFromReturn: true,
};
assert.equal(dateRemovedKernel.jubileeSuccessor, dateRemovedKernel.sevenfoldCompletion + 1);
assert.equal(dateRemovedKernel.pellPair[0] ** 2 - 2 * dateRemovedKernel.pellPair[1] ** 2, -1);

console.log(JSON.stringify({
  specimen: 'JUBILEE-T10-001',
  status: 'PASS',
  equations: {
    sevenSquared: 49,
    successor: 50,
    base7: ['66', '100', '101'],
    base5: ['144', '200'],
    pell: '7^2 - 2*5^2 = -1',
    fivefoldCarrier: '125 = 5^3 = 1000_5',
  },
  pellOrbit: orbit,
  radixSweep,
  formation,
  controls: {
    survivesWithoutDate: true,
    survivesWithout125: true,
    base5CarryDepthIsReportedNotUniversal: true,
  },
}, null, 2));
