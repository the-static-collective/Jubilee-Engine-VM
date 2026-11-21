import { FIXTURE, appendEvent, sealBundle, verifyBundle, verifyHistory } from './engine.mjs';
import { FELLOWSHIP_CHILDCARE, assessFellowshipChildcare } from './fellowship-need.mjs';
let history = [];
const $ = (id) => document.getElementById(id);
const actions = $('actions');
const feedback = $('feedback');
const sourceEl = $('sources');
const stageDescriptions = {
  POSSIBLE_NOT_INVITED: 'All three capabilities could combine, but no invitation or permission has been recorded.',
  AWAITING_GATES: 'A fictional invitation exists. Each offer and the venue owner still has its own independent gate.',
  READY_FOR_SYNTHETIC_ATTEMPT: 'All fictional gates are recorded. This authorizes only an in-memory synthetic attempt, not real activity.',
  ATTEMPT_CLAIM: 'A synthetic attempt was recorded. No result is independently known.',
  REPORTED_CLAIM: 'A fictional carrier reported an outcome. It has not received a separate review.',
  REVIEWED_CLAIM: 'A different fictional alias reviewed the reported outcome. This is not field verification.',
  RETURNED_REVIEWED_CLAIM: 'The local review cycle closed. Any reusable method remains candidate-only.',
  REFUSED: 'An offer was refused. The specimen is closed: no inferred substitute, silent override, or action.',
};
function node(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = String(text);
  return item;
}
function actionButton(parent, label, action, disabled, danger = false) {
  const btn = node('button', danger ? 'danger' : '', label);
  btn.disabled = Boolean(disabled);
  btn.addEventListener('click', async () => {
    try {
      history = await appendEvent(history, action);
      feedback.textContent = '';
      await render();
    } catch (error) {
      feedback.textContent = 'HOLD: ' + error.message;
    }
  });
  parent.append(btn);
  return btn;
}
function section(title, description) {
  const block = node('div', 'actionBlock');
  block.append(node('b', '', title), node('p', '', description));
  const row = node('div', 'buttonrow');
  block.append(row);
  actions.append(block);
  return row;
}
async function render() {
  const { state, derivation } = await verifyHistory(history);
  sourceEl.replaceChildren();
  for (const offer of FIXTURE.offers) {
    const card = node('div', 'source');
    const heading = node('div');
    heading.append(node('div', 'cap', offer.capabilities.join(' · ')), node('strong', '', offer.label));
    const status = state.consent[offer.offerRef] || 'UNDECIDED';
    card.append(heading, node('small', '', offer.sourceRef), node('span', 'state', status));
    sourceEl.append(card);
  }
  const gates = $('gates'); gates.replaceChildren();
  for (const offer of FIXTURE.offers) {
    gates.append(node('span', 'gate' + (state.consent[offer.offerRef] === 'CONSENT' ? ' done' : ''),
      (state.consent[offer.offerRef] === 'CONSENT' ? '✓ ' : '') + offer.label + ': ' + (state.consent[offer.offerRef] || 'no consent claim')));
  }
  gates.append(node('span', 'gate' + (state.venueAuthorized ? ' done' : ''), state.venueAuthorized ? '✓ Event host approved (fictional)' : 'Event host permission missing'));
  $('status').textContent = derivation.stage;
  $('statusDescription').textContent = stageDescriptions[derivation.stage];
  $('residual').textContent = derivation.reusableMethod === 'CANDIDATE_ONLY'
    ? 'A local candidate method may be offered for separate human evaluation. No real event, field verification, permission to publish, or community capacity is established.'
    : state.report ? 'Carrier claim: ' + state.report.decision + '. Review: ' + (state.review?.decision || 'pending') + '. No verified physical consequence.'
      : 'No reviewed consequence exists. Capability compatibility is only a proposal.';
  actions.replaceChildren();
  const closed = state.refused || state.returned;
  const r0 = section('01 · Invitation', 'An invitation is a proposal, never a commitment.');
  actionButton(r0, 'Record fictional invitation', { type: 'INVITE', actorRef: 'fictional:operator' }, state.invited || closed);
  const r1 = section('02 · Independent offer gates', 'Each alias may accept or refuse only its own contribution. Refusal closes this specimen.');
  for (const offer of FIXTURE.offers) {
    const locked = !state.invited || closed || state.consent[offer.offerRef] || state.attempted;
    actionButton(r1, 'Consent: ' + offer.label, { type: 'CONSENT', actorRef: offer.actorRef, targetRef: offer.offerRef }, locked);
    actionButton(r1, 'Refuse: ' + offer.label, { type: 'REFUSE', actorRef: offer.actorRef, targetRef: offer.offerRef }, locked, true);
  }
  const r2 = section('03 · Venue permission', 'Only the separately declared fictional venue owner can approve.');
  actionButton(r2, 'Record venue approval', { type:'AUTHORIZE', actorRef:'fictional:venue-owner', targetRef:'permission:venue' }, !state.invited || closed || state.venueAuthorized || state.attempted);
  const r3 = section('04 · Attempt', 'An attempt cannot precede every relevant gate.');
  actionButton(r3, 'Record synthetic attempt', { type: 'ATTEMPT', actorRef: 'fictional:operator' }, !derivation.mayAttempt);
  const r4 = section('05 · Report', 'A report is a carrier claim, not a verified delivery.');
  for (const decision of ['completed', 'partial', 'blocked']) actionButton(r4, 'Report ' + decision, { type:'REPORT', actorRef:'fictional:carrier', targetRef:'chord:supper-001', decision }, !state.attempted || Boolean(state.report) || closed);
  const r5 = section('06 · Separate review', 'A second alias reviews the report; no identity proof is created.');
  for (const decision of ['accept-report', 'needs-more', 'dispute']) actionButton(r5, decision, { type:'REVIEW', actorRef:'fictional:venue-owner', targetRef:'chord:supper-001', decision }, !state.report || Boolean(state.review) || closed);
  const r6 = section('07 · Return', 'Close the chain and derive candidate-only inheritance when eligible.');
  actionButton(r6, 'Close & generate return', { type:'RETURN', actorRef:'fictional:operator', targetRef:'chord:supper-001' }, !state.review || closed);
  const timeline = $('timeline'); timeline.replaceChildren();
  if (!history.length) timeline.append(node('li', '', 'No occurrence claimed yet.'));
  for (const event of history) timeline.append(node('li', '', String(event.seq).padStart(2,'0') + ' · ' + event.body.type + ' · ' + event.body.actorRef + (event.body.decision ? ' · ' + event.body.decision : '') + ' · ' + event.hash.slice(7,18) + '…'));
}
$('export').addEventListener('click', async () => {
  try {
    const bundle = await sealBundle(history);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href=url; link.download='nuthang-harmony-001-synthetic.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent='Exported a source-linked local rehearsal packet. It does not prove external truth.';
  } catch (error) { feedback.textContent = 'HOLD: ' + error.message; }
});
$('import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  event.target.value='';
  if (!file) return;
  try {
    if (file.size > 128_000) throw new Error('packet exceeds the bounded import limit');
    const candidate = JSON.parse(await file.text());
    const result = await verifyBundle(candidate);
    history = structuredClone(candidate.events);
    await render();
    feedback.textContent='Cold replay passed for ' + result.evidenceClass + '. This verifies structure and hashes, not identities or physical consequences.';
  } catch (error) { feedback.textContent = 'HOLD: import rejected — ' + error.message; }
});
$('reset').addEventListener('click', async () => { history=[]; feedback.textContent='Started a new in-memory rehearsal.'; await render(); });
function renderRealNeed() {
  const source = FELLOWSHIP_CHILDCARE;
  const assessment = assessFellowshipChildcare();
  if (assessment.canAssignChildren || assessment.confirmedCoverage || assessment.candidateChords.length !== 0) throw new Error('public childcare projection must remain unfilled');
  const list = $('realNeedBlockers');
  list.replaceChildren();
  for (const blocker of assessment.unresolved) list.append(node('li', 'gate', blocker.label));
  $('realNeedNext').textContent = source.nextStep;
  $('realNeedSource').href = source.sourceUrl;
}
renderRealNeed();
await render();
