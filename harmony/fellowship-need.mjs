/**
 * NUTHANG-HARMONY-001 — read-only public-safe projection of a REAL but UNFILLED
 * FELLOWSHIP childcare need. This snapshot is NOT the source of truth.
 * Source ownership: fellowSHIP, separate draft PR #2, pinned to a specific commit.
 * Never use this object to allocate a child or approve a caregiver.
 */
export const FELLOWSHIP_CHILDCARE = Object.freeze({
  schema: 'nuthang.public-need-projection/0.1',
  needRef: 'need:fellowship-childcare-2026-12-04',
  title: 'Actual childcare needed for FELLOWSHIP',
  sourceOwner: 'the-static-collective/fellowSHIP',
  sourceState: 'DRAFT_NOT_MERGED',
  sourceRevision: '72481e2c3de0cf5d024463eac42625269cf3c886',
  sourceUrl: 'https://github.com/the-static-collective/fellowSHIP/blob/72481e2c3de0cf5d024463eac42625269cf3c886/docs/needs/FELLOWSHIP-CHILDCARE-001.json',
  eventName: 'FELLOWSHIP: Family & Friends Open Mic Night',
  eventDate: '2026-12-04',
  venue: 'Riverside Church · 3401 Boardman Street, Minneapolis',
  timezone: 'America/Chicago',
  publishedEventSchedule: '5 PM supper · 7 PM prayer · 8–9:30 PM open mic',
  careCoverageHours: null,
  childCount: null,
  childAgeRanges: null,
  publicStatus: 'OPEN_UNFILLED',
  verifiedCaregiverOffers: 0,
  actualHostApproval: false,
  actualChildcareEstablished: false,
  missingBridges: Object.freeze([
    { id:'host', label:'Authorized Riverside childcare/safeguarding lead and approval' },
    { id:'scope', label:'Specific childcare hours, ages and expected count, privately determined' },
    { id:'law', label:'Host determination of applicable Minnesota licensing and insurance requirements' },
    { id:'caregivers', label:'Sufficient host-screened, approved adults who accept the actual duties' },
    { id:'space', label:'Appropriate room, age-based staffing and emergency/safety procedures' },
    { id:'guardians', label:'Parent/guardian permission and host-managed check-in and release process' },
  ]),
  nextStep: 'Ask Paula and the authorized Riverside host who leads child safeguarding, and whether they can authorize a safely staffed option for part of December 4.',
  fallback: 'No childcare should be advertised as available until the host verifies all requirements. Children remain their guardians’ responsibility.',
  limits: Object.freeze([
    'No child, guardian or volunteer candidate details belong in public GitHub or this UI',
    'Potential volunteers cannot self-certify screening or legal fitness in this prototype',
    'The fictional supper exercise below cannot change the real childcare status',
    'No real provider, church approval, childcare service, or coverage time is established',
  ]),
});
export function assessFellowshipChildcare(need = FELLOWSHIP_CHILDCARE) {
  if (need !== FELLOWSHIP_CHILDCARE) throw new Error('Only the owner-pinned public projection is supported; no participant edits');
  return Object.freeze({
    status: 'OPEN_UNFILLED',
    candidateChords: Object.freeze([]),
    confirmedCoverage: false,
    canAdvertiseCare: false,
    canAssignChildren: false,
    fieldVerified: false,
    requiresAuthorizedHostReview: true,
    unresolved: need.missingBridges,
    inheritedSyntheticClaims: 0,
  });
}
