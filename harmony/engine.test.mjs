import test from 'node:test';
import assert from 'node:assert/strict';
import { FIXTURE, NON_CLAIMS, appendEvent, canonicalJson, derive, initialState, proposeChord, sealBundle, sha256, verifyBundle, verifyHistory } from './engine.mjs';

const invite = { type: 'INVITE', actorRef: 'fictional:operator' };
const consents = FIXTURE.offers.map(o => ({ type: 'CONSENT', actorRef: o.actorRef, targetRef: o.offerRef }));
const approval = { type: 'AUTHORIZE', actorRef: 'fictional:venue-owner', targetRef: 'permission:venue' };
const attempt = { type: 'ATTEMPT', actorRef: 'fictional:operator' };
const report = { type: 'REPORT', actorRef: 'fictional:carrier', targetRef: 'chord:supper-001', decision: 'completed' };
const review = { type: 'REVIEW', actorRef: 'fictional:venue-owner', targetRef: 'chord:supper-001', decision: 'accept-report' };
const complete = { type: 'RETURN', actorRef: 'fictional:operator', targetRef: 'chord:supper-001' };
async function scenario(actions) { let h = []; for (const a of actions) h = await appendEvent(h, a); return h; }
async function rejectsAction(history, action, fragment) { await assert.rejects(() => appendEvent(history, action), new RegExp(fragment)); }

test('frozen independent sources cover all capabilities; permission is a separate missing bridge', () => {
  const chord = proposeChord();
  assert.deepEqual(chord.offerRefs, ['offer:carrier', 'offer:grower', 'offer:host']);
  assert.deepEqual(chord.missingCapabilities, []);
  assert.deepEqual(chord.permissionRefs, ['permission:venue']);
  assert.equal(chord.status, 'POSSIBLE_IF_PERMITTED');
  assert.equal(derive(initialState()).mayAttempt, false);
});
test('source fixture cannot be swapped without an explicit new specimen', () => {
  const changed = structuredClone(FIXTURE);
  changed.offers[0].capabilities.push('host-approval');
  assert.throws(() => proposeChord(changed), /frozen fictional source cut/);
});
test('canonical output independent of object key insertion order', async () => {
  assert.equal(canonicalJson({ b: 2, a: [1, 3] }), canonicalJson({ a: [1, 3], b: 2 }));
  assert.equal(await sha256({ b: 2, a: 1 }), await sha256({ a: 1, b: 2 }));
});
test('no attempt without invitation, each consent, and venue gate', async () => {
  await rejectsAction([], attempt, 'invitation');
  const invited = await scenario([invite]);
  await rejectsAction(invited, attempt, 'all independent gates');
  const withConsents = await scenario([invite, ...consents]);
  await rejectsAction(withConsents, attempt, 'all independent gates');
  const withApproval = await scenario([invite, approval]);
  await rejectsAction(withApproval, attempt, 'all independent gates');
  assert.equal((await verifyHistory(await scenario([invite, ...consents, approval]))).derivation.mayAttempt, true);
});
test('mismatched and duplicated alias decisions are rejected', async () => {
  const invited = await scenario([invite]);
  await rejectsAction(invited, { ...consents[0], actorRef: 'fictional:operator' }, 'declared offer alias');
  const once = await scenario([invite, consents[0]]);
  await rejectsAction(once, consents[0], 'cannot be overwritten');
  await rejectsAction(once, { type:'AUTHORIZE', actorRef:'fictional:carrier', targetRef:'permission:venue' }, 'owner-local');
});
test('refusal is terminal even when other offers might combine', async () => {
  const h = await scenario([invite, { type: 'REFUSE', actorRef: 'fictional:grower', targetRef: 'offer:grower' }]);
  assert.equal((await verifyHistory(h)).derivation.stage, 'REFUSED');
  await rejectsAction(h, consents[1], 'refusal is terminal');
  await rejectsAction(h, attempt, 'refusal is terminal');
});
test('no report before an attempt or review before report', async () => {
  const h = await scenario([invite, ...consents, approval]);
  await rejectsAction(h, report, 'only the carrier alias');
  const attempted = await scenario([invite, ...consents, approval, attempt]);
  await rejectsAction(attempted, review, 'separate-alias');
});
test('reporter cannot review their own report', async () => {
  const h = await scenario([invite, ...consents, approval, attempt, report]);
  await rejectsAction(h, { ...review, actorRef: 'fictional:carrier' }, 'separate-alias');
});
test('cold replay of complete synthetic return is deterministic and never field-verified', async () => {
  const h = await scenario([invite, ...consents, approval, attempt, report, review, complete]);
  const b = await sealBundle(h);
  const check = await verifyBundle(JSON.parse(JSON.stringify(b)));
  assert.equal(check.valid, true);
  assert.equal(check.stage, 'RETURNED_REVIEWED_CLAIM');
  assert.equal(b.outcome.reusableMethod, 'CANDIDATE_ONLY');
  assert.equal(b.outcome.independentFieldVerification, false);
  assert.equal(b.outcome.authority, 'NONE');
  assert.deepEqual(b.doesNotClaim, NON_CLAIMS);
  assert.equal((await sealBundle(h)).digest, b.digest);
});
test('partial or disputed report never yields reusable method', async () => {
  const h = await scenario([invite, ...consents, approval, attempt, { ...report, decision:'partial' }, review, complete]);
  assert.equal((await sealBundle(h)).outcome.reusableMethod, 'NONE');
  const disputed = await scenario([invite, ...consents, approval, attempt, report, { ...review, decision:'dispute' }, complete]);
  assert.equal((await sealBundle(disputed)).outcome.reusableMethod, 'NONE');
});
test('a forged event hash or altered body is refused on cold import', async () => {
  const h = await scenario([invite, ...consents, approval]);
  const b = await sealBundle(h);
  b.events[1].body.actorRef = 'fictional:operator';
  await assert.rejects(() => verifyBundle(b), /bundle digest mismatch/);
  await assert.rejects(() => verifyHistory(b.events), /event hash mismatch/);
});
test('recertifying altered outcome or weakened non-claims does not make it valid', async () => {
  const b = await sealBundle(await scenario([invite]));
  b.outcome.authority = 'GRANTED';
  b.digest = await sha256((( { digest, ...rest } ) => rest)(b));
  await assert.rejects(() => verifyBundle(b), /claimed outcome mismatch/);
  const c = await sealBundle(await scenario([invite]));
  c.doesNotClaim.pop();
  c.digest = await sha256((( { digest, ...rest } ) => rest)(c));
  await assert.rejects(() => verifyBundle(c), /non-claims altered/);
});
test('a review is not independent authentication, even if accepted by different alias', async () => {
  const h = await scenario([invite, ...consents, approval, attempt, report, review]);
  const state = (await verifyHistory(h)).derivation;
  assert.equal(state.stage, 'REVIEWED_CLAIM');
  assert.equal(state.independentFieldVerification, false);
});
test('closed return cannot be reopened or reused for another attempt', async () => {
  const h = await scenario([invite, ...consents, approval, attempt, report, review, complete]);
  await rejectsAction(h, attempt, 'return already closed');
  await rejectsAction(h, complete, 'return already closed');
});
test('missing or re-ordered hash links cannot be cold-replayed', async () => {
  const h = await scenario([invite, ...consents]);
  const changed = structuredClone(h);
  changed[1].seq = 8;
  await assert.rejects(() => verifyHistory(changed), /ancestry or fixture/);
  const reordered = structuredClone(h);
  [reordered[1], reordered[2]] = [reordered[2], reordered[1]];
  await assert.rejects(() => verifyHistory(reordered), /ancestry or fixture/);
});
