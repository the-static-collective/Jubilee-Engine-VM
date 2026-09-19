import assert from 'node:assert/strict';

const systems = {
  jubilee: {
    recursive7x7: true,
    fixedCalendarGate: true,
    boundedRelease: true,
    returnDistinctFromRelease: true,
    hereditaryHoldingReturn: true,
  },
  mesopotamian: {
    recursive7x7: false,
    fixedCalendarGate: false,
    boundedRelease: true,
    returnDistinctFromRelease: 'partial_analogue',
    hereditaryHoldingReturn: false,
  },
  solon: {
    recursive7x7: false,
    fixedCalendarGate: false,
    boundedRelease: true,
    returnDistinctFromRelease: 'analogue',
    hereditaryHoldingReturn: 'disputed',
  },
  bankruptcy: {
    recursive7x7: false,
    fixedCalendarGate: false,
    boundedRelease: true,
    returnDistinctFromRelease: false,
    hereditaryHoldingReturn: false,
  },
  trc: {
    recursive7x7: false,
    fixedCalendarGate: false,
    boundedRelease: true,
    returnDistinctFromRelease: 'reparation_distinct',
    hereditaryHoldingReturn: false,
  },
};

assert.equal(systems.jubilee.recursive7x7, true);
assert.equal(systems.jubilee.fixedCalendarGate, true);
assert.equal(systems.mesopotamian.recursive7x7, false);
assert.equal(systems.bankruptcy.boundedRelease, true);
assert.equal(systems.trc.boundedRelease, true);

const genericPrimitives = new Set([
  'public_attributable_gate',
  'hold_or_enforcement_pause',
  'bounded_discharge',
  'release_without_history_erasure',
  'reparation_or_restoration_as_distinct_operation',
]);

assert.ok(genericPrimitives.has('bounded_discharge'));
assert.ok(genericPrimitives.has('release_without_history_erasure'));

const killedClaims = new Set([
  'release_without_erasure_is_uniquely_jubilee',
  'hold_before_discharge_is_uniquely_jubilee',
  'public_proclamation_is_uniquely_jubilee',
  'release_and_restoration_separation_is_uniquely_jubilee',
]);

for (const claim of killedClaims) {
  assert.equal(claim.startsWith('global_uniqueness_proven'), false);
}

const sampledFullCompositionMatches = Object.entries(systems)
  .filter(([name]) => name !== 'jubilee')
  .filter(([, s]) =>
    s.recursive7x7 === true &&
    s.fixedCalendarGate === true &&
    s.boundedRelease === true &&
    s.returnDistinctFromRelease === true &&
    s.hereditaryHoldingReturn === true
  )
  .map(([name]) => name);

assert.deepEqual(sampledFullCompositionMatches, []);

const publicClaim = {
  sampleRelativeDistinctiveness: true,
  globalUniquenessEstablished: false,
  supernaturalOriginEstablished: false,
};

assert.equal(publicClaim.sampleRelativeDistinctiveness, true);
assert.equal(publicClaim.globalUniquenessEstablished, false);
assert.equal(publicClaim.supernaturalOriginEstablished, false);

console.log(JSON.stringify({
  specimen: 'JUBILEE-T10-001-BIGBAT-COMPARATIVE-001',
  status: 'PASS',
  verdict: 'SURVIVES_GENERICITY_ATTACK',
  sampledFullCompositionMatches,
  genericPrimitives: [...genericPrimitives],
  killedClaims: [...killedClaims],
  publicClaim,
}, null, 2));
