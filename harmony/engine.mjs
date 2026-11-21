/** NUTHANG-HARMONY-001: synthetic, local-only composition witness. No external authority. */
const SCHEMA = 'nuthang.harmony-first-chord/0.1';
const EVENT_SCHEMA = 'nuthang.harmony-event/0.1';
const BUNDLE_SCHEMA = 'nuthang.harmony-bundle/0.1';
const GENESIS = 'GENESIS';

export const FIXTURE = Object.freeze({
  schema: 'nuthang.harmony-fixture/0.1',
  fixtureRef: 'fixture:supper-001',
  evidenceClass: 'SYNTHETIC_DEMO_ONLY',
  title: 'The Supper That Learned to Sing',
  purpose: 'A fictional neighborhood supper assembled from three independent offers',
  requiredCapabilities: ['ingredient-supply', 'kitchen', 'transport'],
  offers: [
    { offerRef: 'offer:grower', actorRef: 'fictional:grower', sourceRef: 'fictional-source:grower-001', label: 'Neighborhood grower', capabilities: ['ingredient-supply'] },
    { offerRef: 'offer:host', actorRef: 'fictional:host', sourceRef: 'fictional-source:host-001', label: 'Community kitchen steward', capabilities: ['kitchen'] },
    { offerRef: 'offer:carrier', actorRef: 'fictional:carrier', sourceRef: 'fictional-source:carrier-001', label: 'Volunteer driver', capabilities: ['transport'] },
  ],
  permissions: [{ permissionRef: 'permission:venue', actorRef: 'fictional:venue-owner', label: 'Event host approval' }],
});

export const NON_CLAIMS = Object.freeze([
  'synthetic aliases are not authenticated humans',
  'a proposal is not permission or an assignment',
  'self-reported consent is not verified consent',
  'a reviewed report is not independent physical verification',
  'a receipt is not authority, payment, reputation, or human worth',
  'no partners, invitations, physical deliveries, broadcasts, or deployments occurred',
]);

function requireTrue(value, message) {
  if (!value) throw new Error(message);
}
function isPlain(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
/** Canonical JSON for bounded JSON fixtures only; no undefined, NaN, BigInt or cycles. */
export function canonicalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isSafeInteger(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (isPlain(value)) return '{' + Object.keys(value).sort().map(key => {
    requireTrue(value[key] !== undefined, 'undefined value is not canonical JSON');
    return JSON.stringify(key) + ':' + canonicalJson(value[key]);
  }).join(',') + '}';
  throw new Error('unsupported canonical value');
}
export async function sha256(value) {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return 'sha256:' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
function requireExactKeys(obj, keys, name) {
  requireTrue(isPlain(obj), name + ' must be an object');
  requireTrue(canonicalJson(Object.keys(obj).sort()) === canonicalJson([...keys].sort()), name + ' has missing/unknown fields');
}
export function assertFixture(fixture) {
  requireTrue(canonicalJson(fixture) === canonicalJson(FIXTURE), 'fixture is not the frozen fictional source cut');
}

/** Exhaustive bounded subset search, not a learned or measured causal inference. */
export function proposeChord(fixture = FIXTURE) {
  assertFixture(fixture);
  const offers = [...fixture.offers].sort((a, b) => a.offerRef.localeCompare(b.offerRef));
  let chosen = null;
  for (let mask = 1; mask < (1 << offers.length); mask += 1) {
    const subset = offers.filter((_, i) => mask & (1 << i));
    const provided = new Set(subset.flatMap(o => o.capabilities));
    const missing = fixture.requiredCapabilities.filter(c => !provided.has(c));
    const candidate = { subset, missing };
    if (!chosen || missing.length < chosen.missing.length ||
      (missing.length === chosen.missing.length && subset.length < chosen.subset.length) ||
      (missing.length === chosen.missing.length && subset.length === chosen.subset.length &&
        subset.map(o => o.offerRef).join('|') < chosen.subset.map(o => o.offerRef).join('|'))) chosen = candidate;
  }
  return {
    proposalRef: 'chord:supper-001',
    offerRefs: chosen.subset.map(o => o.offerRef),
    sourceRefs: chosen.subset.map(o => o.sourceRef),
    missingCapabilities: chosen.missing,
    permissionRefs: fixture.permissions.map(p => p.permissionRef),
    status: chosen.missing.length ? 'CAPABILITY_GAP' : 'POSSIBLE_IF_PERMITTED',
    authority: 'NONE',
  };
}

const EVENT_TYPES = new Set(['INVITE', 'CONSENT', 'REFUSE', 'AUTHORIZE', 'ATTEMPT', 'REPORT', 'REVIEW', 'RETURN']);
const REPORT_DECISIONS = new Set(['completed', 'partial', 'blocked']);
const REVIEW_DECISIONS = new Set(['accept-report', 'needs-more', 'dispute']);
const OPERATOR = 'fictional:operator';

export function initialState() {
  return { invited: false, consent: {}, refused: false, venueAuthorized: false, attempted: false, report: null, review: null, returned: false };
}
function allConsented(state) {
  return FIXTURE.offers.every(o => state.consent[o.offerRef] === 'CONSENT');
}
export function canAttempt(state) {
  return state.invited && !state.refused && state.venueAuthorized && allConsented(state) && !state.attempted;
}
/** Authored actions are alias claims, not identity-verified events. */
export function transition(state, entry) {
  requireExactKeys(entry, ['type', 'actorRef', 'targetRef', 'decision'], 'event body');
  requireTrue(EVENT_TYPES.has(entry.type), 'unknown event type');
  requireTrue(typeof entry.actorRef === 'string', 'actorRef must be a string');
  const next = structuredClone(state);
  requireTrue(!state.returned, 'return already closed');
  requireTrue(!state.refused, 'a refusal is terminal in this specimen');
  if (entry.type === 'INVITE') {
    requireTrue(!state.invited && entry.actorRef === OPERATOR && entry.targetRef === null && entry.decision === null, 'invalid invitation');
    next.invited = true;
  } else {
    requireTrue(state.invited, 'invitation must happen first');
    if (entry.type === 'CONSENT' || entry.type === 'REFUSE') {
      const offer = FIXTURE.offers.find(o => o.offerRef === entry.targetRef);
      requireTrue(offer && offer.actorRef === entry.actorRef && entry.decision === null, 'only the declared offer alias may make an offer decision');
      requireTrue(!state.consent[offer.offerRef] && !state.attempted, 'offer decision cannot be overwritten or made after attempt');
      next.consent[offer.offerRef] = entry.type;
      if (entry.type === 'REFUSE') next.refused = true;
    } else if (entry.type === 'AUTHORIZE') {
      requireTrue(!state.venueAuthorized && !state.attempted && entry.actorRef === 'fictional:venue-owner' && entry.targetRef === 'permission:venue' && entry.decision === null, 'owner-local venue gate required');
      next.venueAuthorized = true;
    } else if (entry.type === 'ATTEMPT') {
      requireTrue(entry.actorRef === OPERATOR && entry.targetRef === null && entry.decision === null && canAttempt(state), 'attempt requires all independent gates');
      next.attempted = true;
    } else if (entry.type === 'REPORT') {
      requireTrue(state.attempted && !state.report && entry.actorRef === 'fictional:carrier' && entry.targetRef === 'chord:supper-001' && REPORT_DECISIONS.has(entry.decision), 'only the carrier alias can report after an attempt');
      next.report = { reporter: entry.actorRef, decision: entry.decision };
    } else if (entry.type === 'REVIEW') {
      requireTrue(state.report && !state.review && entry.actorRef === 'fictional:venue-owner' && entry.actorRef !== state.report.reporter && entry.targetRef === 'chord:supper-001' && REVIEW_DECISIONS.has(entry.decision), 'separate-alias report review required');
      next.review = { reviewer: entry.actorRef, decision: entry.decision };
    } else if (entry.type === 'RETURN') {
      requireTrue(state.review && entry.actorRef === OPERATOR && entry.targetRef === 'chord:supper-001' && entry.decision === null, 'return needs a review but grants no field truth');
      next.returned = true;
    }
  }
  return next;
}
function draftBody({ type, actorRef, targetRef = null, decision = null }) {
  return { type, actorRef, targetRef, decision };
}
export function derive(state) {
  const proposal = proposeChord();
  const outstandingConsents = proposal.offerRefs.filter(r => state.consent[r] !== 'CONSENT');
  const pendingPermission = state.venueAuthorized ? [] : [...proposal.permissionRefs];
  const reviewAccepted = state.review?.decision === 'accept-report' && state.report?.decision === 'completed';
  return {
    proposal,
    outstandingConsents,
    pendingPermission,
    mayAttempt: canAttempt(state),
    stage: state.refused ? 'REFUSED' : state.returned ? 'RETURNED_REVIEWED_CLAIM' : state.review ? 'REVIEWED_CLAIM' : state.report ? 'REPORTED_CLAIM' : state.attempted ? 'ATTEMPT_CLAIM' : state.venueAuthorized && allConsented(state) ? 'READY_FOR_SYNTHETIC_ATTEMPT' : state.invited ? 'AWAITING_GATES' : 'POSSIBLE_NOT_INVITED',
    reusableMethod: state.returned && reviewAccepted ? 'CANDIDATE_ONLY' : 'NONE',
    independentFieldVerification: false,
    authority: 'NONE',
  };
}

async function eventHash(body, seq, prevHash, fixtureDigest) {
  return sha256({ schema: EVENT_SCHEMA, fixtureDigest, seq, prevHash, body });
}
/** Replays and verifies every link before a new event may be appended. */
export async function verifyHistory(history, fixture = FIXTURE) {
  assertFixture(fixture);
  requireTrue(Array.isArray(history) && history.length <= 32, 'bounded history required');
  const fixtureDigest = await sha256(fixture);
  let previous = GENESIS;
  let state = initialState();
  for (let i = 0; i < history.length; i += 1) {
    const event = history[i];
    requireExactKeys(event, ['schema', 'fixtureDigest', 'seq', 'prevHash', 'body', 'hash'], 'sealed event');
    requireTrue(event.schema === EVENT_SCHEMA && event.fixtureDigest === fixtureDigest && event.seq === i + 1 && event.prevHash === previous, 'event ancestry or fixture mismatch');
    const expected = await eventHash(event.body, event.seq, event.prevHash, event.fixtureDigest);
    requireTrue(expected === event.hash, 'event hash mismatch');
    state = transition(state, event.body);
    previous = event.hash;
  }
  return { valid: true, state, tipHash: previous, fixtureDigest, derivation: derive(state) };
}
export async function appendEvent(history, action, fixture = FIXTURE) {
  const checked = await verifyHistory(history, fixture);
  const body = draftBody(action);
  transition(checked.state, body); // fail closed BEFORE writing anything
  const seq = history.length + 1;
  const sealed = { schema: EVENT_SCHEMA, fixtureDigest: checked.fixtureDigest, seq, prevHash: checked.tipHash, body,
    hash: await eventHash(body, seq, checked.tipHash, checked.fixtureDigest) };
  return [...history, sealed];
}

export async function sealBundle(history, fixture = FIXTURE) {
  const verified = await verifyHistory(history, fixture);
  const payload = { schema: BUNDLE_SCHEMA, fixture, events: history, proposal: proposeChord(fixture), outcome: verified.derivation, doesNotClaim: [...NON_CLAIMS] };
  return { ...payload, digest: await sha256(payload) };
}
export async function verifyBundle(bundle) {
  requireExactKeys(bundle, ['schema', 'fixture', 'events', 'proposal', 'outcome', 'doesNotClaim', 'digest'], 'bundle');
  requireTrue(bundle.schema === BUNDLE_SCHEMA, 'unsupported bundle schema');
  const { digest, ...payload } = bundle;
  requireTrue(digest === await sha256(payload), 'bundle digest mismatch');
  const replay = await verifyHistory(bundle.events, bundle.fixture);
  requireTrue(canonicalJson(bundle.proposal) === canonicalJson(proposeChord(bundle.fixture)), 'proposal mismatch');
  requireTrue(canonicalJson(bundle.outcome) === canonicalJson(replay.derivation), 'claimed outcome mismatch');
  requireTrue(canonicalJson(bundle.doesNotClaim) === canonicalJson(NON_CLAIMS), 'non-claims altered');
  return { valid: true, tipHash: replay.tipHash, stage: replay.derivation.stage, evidenceClass: FIXTURE.evidenceClass };
}
export { SCHEMA };
