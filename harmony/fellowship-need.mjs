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
  sourceRevision: '12d5b291e1a2bce763de362622cacc8ecb2947d2',
  sourceUrl: 'https://github.com/the-static-collective/fellowSHIP/blob/12d5b291e1a2bce763de362622cacc8ecb2947d2/docs/needs/FELLOWSHIP-CHILDCARE-001.json',
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
  internalCaregiverIdentified: false,
  externalProviderDiscovery: 'RESEARCH_LEADS_ONLY',
  externalResearchLeads: Object.freeze([
    { kind:'church_sitter_marketplace', label:'SitterTree church childcare (Minneapolis)', url:'https://www.sittertree.com/church-child-care/mn/minneapolis', status:'NOT_CONTACTED_NOT_CONFIRMED' },
    { kind:'event_staffing', label:'Jovie of Edina event childcare', url:'https://www.jovie.com/locations/mn/edina/jovie-of-edina/reunion-special-event-childcare/', status:'NOT_CONTACTED_NOT_CONFIRMED' },
    { kind:'neighbor_referral', label:'Lake Nokomis Lutheran', url:'https://www.lakenokomischurch.org/worship.html', status:'NOT_CONTACTED_NOT_CONFIRMED' },
    { kind:'neighbor_referral', label:'Trinity Lutheran Minnehaha Falls', url:'https://www.trinityfalls.org/visit', status:'NOT_CONTACTED_NOT_CONFIRMED' },
  ]),
  actualHostApproval: false,
  actualChildcareEstablished: false,
  missingBridges: Object.freeze([
    { id:'caregiver-source', label:'Find a willing outside caregiver or team; none has been identified' },
    { id:'host', label:'Separate Riverside event-host permission and safeguarding approval (no in-house childcare lead assumed)' },
    { id:'scope', label:'Specific childcare hours, ages and expected count, privately determined' },
    { id:'law', label:'Host determination of applicable Minnesota licensing and insurance requirements' },
    { id:'caregivers', label:'Sufficient host-screened, approved adults who accept the actual duties' },
    { id:'space', label:'Appropriate room, age-based staffing and emergency/safety procedures' },
    { id:'guardians', label:'Parent/guardian permission and host-managed check-in and release process' },
  ]),
  nextStep: 'Seek outside event/church childcare providers for the December 4 evening and ask Paula who at Riverside can approve the event space, safety requirements and external staffing. Parallel questions; neither one alone opens childcare.',
  fallback: 'No childcare should be advertised as available until the host verifies all requirements. Children remain their guardians’ responsibility.',
  limits: Object.freeze([
    'No child, guardian or volunteer candidate details belong in public GitHub or this UI',
    'Potential volunteers cannot self-certify screening or legal fitness in this prototype',
    'The fictional supper exercise below cannot change the real childcare status',
    'No real provider, church approval, childcare service, or coverage time is established; search leads are not provider offers',
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
