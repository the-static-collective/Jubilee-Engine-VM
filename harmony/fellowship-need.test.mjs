import test from 'node:test';
import assert from 'node:assert/strict';
import { FELLOWSHIP_CHILDCARE, assessFellowshipChildcare } from './fellowship-need.mjs';
import { FIXTURE, appendEvent, sealBundle } from './engine.mjs';

test('the first real need is childcare, not the synthetic supper', () => {
  assert.match(FELLOWSHIP_CHILDCARE.title, /childcare/i);
  assert.match(FELLOWSHIP_CHILDCARE.needRef, /childcare/);
  assert.equal(FELLOWSHIP_CHILDCARE.eventDate, '2026-12-04');
  assert.equal(FELLOWSHIP_CHILDCARE.sourceOwner, 'the-static-collective/fellowSHIP');
  assert.equal(FELLOWSHIP_CHILDCARE.sourceState, 'DRAFT_NOT_MERGED');
  assert.ok(FELLOWSHIP_CHILDCARE.sourceUrl.includes(FELLOWSHIP_CHILDCARE.sourceRevision));
});
test('no known childcare service or public provider is invented', () => {
  const n = FELLOWSHIP_CHILDCARE;
  const status = assessFellowshipChildcare();
  assert.equal(n.publicStatus, 'OPEN_UNFILLED');
  assert.equal(n.verifiedCaregiverOffers, 0);
  assert.equal(status.candidateChords.length, 0);
  assert.equal(status.canAdvertiseCare, false);
  assert.equal(status.canAssignChildren, false);
  assert.equal(status.fieldVerified, false);
  assert.equal(status.confirmedCoverage, false);
});
test('staffing, safeguarding and event duration remain unresolved, not defaults', () => {
  assert.equal(FELLOWSHIP_CHILDCARE.careCoverageHours, null);
  assert.equal(FELLOWSHIP_CHILDCARE.childCount, null);
  assert.equal(FELLOWSHIP_CHILDCARE.childAgeRanges, null);
  for (const id of ['host','scope','law','caregivers','space','guardians']) assert.ok(assessFellowshipChildcare().unresolved.some(x => x.id === id));
});
test('no details about actual children, guardians or prospective caregivers appear', () => {
  const s = JSON.stringify(FELLOWSHIP_CHILDCARE);
  assert.ok(!/birthdate|social security|medical record|parent phone|custody dispute|candidate phone/i.test(s));
  assert.match(s, /No child, guardian or volunteer candidate details belong/);
});
test('synthetic replay cannot promote the actual childcare need', async () => {
  let h = [];
  const actions = [
    { type:'INVITE', actorRef:'fictional:operator' },
    ...FIXTURE.offers.map(o => ({type:'CONSENT', actorRef:o.actorRef, targetRef:o.offerRef})),
    { type:'AUTHORIZE', actorRef:'fictional:venue-owner', targetRef:'permission:venue' },
    { type:'ATTEMPT', actorRef:'fictional:operator' },
    { type:'REPORT', actorRef:'fictional:carrier', targetRef:'chord:supper-001', decision:'completed' },
    { type:'REVIEW', actorRef:'fictional:venue-owner', targetRef:'chord:supper-001', decision:'accept-report' },
    { type:'RETURN', actorRef:'fictional:operator', targetRef:'chord:supper-001' }
  ];
  for (const a of actions) h = await appendEvent(h, a);
  const b = await sealBundle(h);
  assert.equal(b.outcome.reusableMethod,'CANDIDATE_ONLY');
  assert.equal(assessFellowshipChildcare().status,'OPEN_UNFILLED');
  assert.equal(assessFellowshipChildcare().canAssignChildren,false);
});
test('an arbitrary provider-complete object cannot be used to override the source', () => {
  assert.throws(() => assessFellowshipChildcare({...FELLOWSHIP_CHILDCARE, actualChildcareEstablished:true, verifiedCaregiverOffers:3}), /owner-pinned/);
});
