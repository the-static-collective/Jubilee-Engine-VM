import assert from 'node:assert/strict';

const claims = {
  leviticusExplicit7x7_49: true,
  leviticusExplicitFiftiethYear: true,
  leviticusExplicitT10Shofar: true,
  leviticusDistinguishesReleaseAndReturn: true,
  leviticusExplicitRhToYkHold: false,
  rabbinicExplicitHold: true,
  threeWayBarrierScope: 'rabbinic_disputed_then_codified',
  countAloneSufficientInReportedRabbinicPositions: false,
  regularHistoricalJubileeObservance: 'not_established',
  jeremiah34IsSecureScheduledJubilee: false,
  aneReleaseComparanda: 'comparative_not_identity',
  biblicalReleaseConstitution: 'multiple_legal_collections',
  leviticus25UniversalEmancipation: false,
  recurrencePeriod: 'constitution_dependent_49_or_50_models',
  q11MelchizedekAncientBraid: true,
  q11MelchizedekExact491Reading: 'disputed_reconstruction',
  current5787IsEstablishedJubilee: false,
};

assert.equal(claims.leviticusExplicit7x7_49, true);
assert.equal(claims.leviticusExplicitFiftiethYear, true);
assert.equal(claims.leviticusExplicitT10Shofar, true);
assert.equal(claims.leviticusDistinguishesReleaseAndReturn, true);

assert.equal(claims.leviticusExplicitRhToYkHold, false);
assert.equal(claims.rabbinicExplicitHold, true);
assert.equal(claims.threeWayBarrierScope, 'rabbinic_disputed_then_codified');
assert.equal(claims.countAloneSufficientInReportedRabbinicPositions, false);

assert.equal(claims.regularHistoricalJubileeObservance, 'not_established');
assert.equal(claims.jeremiah34IsSecureScheduledJubilee, false);
assert.equal(claims.aneReleaseComparanda, 'comparative_not_identity');
assert.equal(claims.biblicalReleaseConstitution, 'multiple_legal_collections');
assert.equal(claims.leviticus25UniversalEmancipation, false);

assert.equal(claims.recurrencePeriod, 'constitution_dependent_49_or_50_models');
assert.equal(claims.q11MelchizedekAncientBraid, true);
assert.equal(claims.q11MelchizedekExact491Reading, 'disputed_reconstruction');
assert.equal(claims.current5787IsEstablishedJubilee, false);

const survivingKernel = [
  'COUNT_COMPLETE_NE_TRANSITION_COMPLETE',
  'RELEASE_NE_RETURN',
  'PRESCRIPTION_NE_ATTESTED_PRACTICE',
  'SOURCE_CONSTITUTION_NE_UNIVERSAL_CONSTITUTION',
  'ETHICAL_EXTENSION_NE_SOURCE_CLAIM',
  'LOCAL_49_TO_50_BOUNDARY_SURVIVES',
];

assert.ok(survivingKernel.includes('COUNT_COMPLETE_NE_TRANSITION_COMPLETE'));
assert.ok(survivingKernel.includes('RELEASE_NE_RETURN'));

const forbiddenPromotions = new Set([
  'LEVITICUS_EXPLICITLY_SPECIFIES_ENGINE_STATE_MACHINE',
  'ONE_UNDIFFERENTIATED_BIBLICAL_RELEASE_CONSTITUTION',
  'REGULAR_HISTORICAL_JUBILEE_PROVEN',
  'LEVITICUS_UNIVERSAL_EMANCIPATION',
  'CURRENT_5787_ESTABLISHED_JUBILEE',
]);

for (const forbidden of forbiddenPromotions) {
  assert.equal(survivingKernel.includes(forbidden), false);
}

console.log(JSON.stringify({
  specimen: 'JUBILEE-T10-001-BIGBAT-TEXT-HISTORY-001',
  status: 'PASS',
  verdict: 'SURVIVES_NARROWER_STRONGER',
  claims,
  survivingKernel,
  publicBoundary: {
    mayAnnounceResearchKernel: true,
    mayDeclareCurrentJubileeYear: false,
    mayClaimAncientSoftwareIntent: false,
  },
}, null, 2));
