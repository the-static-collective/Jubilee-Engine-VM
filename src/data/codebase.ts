export interface CodeFile {
  path: string;
  language: string;
  content: string;
  description: string;
}

export const codebaseFiles: CodeFile[] = [
  {
    path: "src/jubilee/model.py",
    language: "python",
    description: "Declares core dataclasses: Capability, Transform, StateDelta, and State.",
    content: `from dataclasses import dataclass, field
from typing import List, Tuple

@dataclass(frozen=True)
class Capability:
    scope: str
    action: str

@dataclass(frozen=True)
class Transform:
    action: str
    edge: Tuple[str, str, str]
    reason: str
    authority: Capability

@dataclass(frozen=True)
class StateDelta:
    retired_edges: Tuple[Tuple[str, str, str], ...] = ()
    restored_edges: Tuple[Tuple[str, str, str], ...] = ()

    @property
    def is_empty(self) -> bool:
        return not self.retired_edges and not self.restored_edges

@dataclass(frozen=True)
class State:
    nodes: frozenset[str]
    edges: frozenset[Tuple[str, str, str]]
    history: frozenset[str] = field(default_factory=frozenset)
    
    def is_active(self, edge: Tuple[str, str, str]) -> bool:
        return edge in self.edges

    @classmethod
    def graph(cls, nodes: List[str], edges: List[Tuple[str, str, str]]):
        return cls(nodes=frozenset(nodes), edges=frozenset(edges))
`
  },
  {
    path: "src/jubilee/hashes.py",
    language: "python",
    description: "Deterministic SHA-256 state hashing and payload canonicalization.",
    content: `import hashlib
import json
from .model import State, Capability, Transform, StateDelta

def hash_state(state: State) -> str:
    state_dict = {
        "nodes": sorted(list(state.nodes)),
        "edges": sorted(list(state.edges)),
        "history": sorted(list(state.history))
    }
    state_bytes = json.dumps(state_dict, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(state_bytes).hexdigest()

def hash_capability(capability: Capability) -> str:
    canonical = f"{capability.scope}:{capability.action}".encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()

def hash_transform(transform: Transform) -> str:
    return hashlib.sha256(str(transform).encode("utf-8")).hexdigest()

def hash_delta(delta: StateDelta) -> str:
    delta_dict = {
        "retired": sorted(list(delta.retired_edges)),
        "restored": sorted(list(delta.restored_edges))
    }
    delta_bytes = json.dumps(delta_dict, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(delta_bytes).hexdigest()
`
  },
  {
    path: "src/jubilee/receipts.py",
    language: "python",
    description: "Core receipt datatype for immutable witness and transaction attestation.",
    content: `from dataclasses import dataclass
from typing import Optional, Dict, Tuple

@dataclass(frozen=True)
class WitnessReceipt:
    receipt_id: str
    parent_state_hash: str
    child_state_hash: str
    transform_hash: str
    capability_id: str
    actor_id: str
    timestamp: str
    prior_receipt_hash: Optional[str]
    rationale: str
    delta_hash: str
    provenance_map: Dict[str, Tuple[str, ...]]
    signature: str
`
  },
  {
    path: "src/jubilee/engine.py",
    language: "python",
    description: "The main execution engine enforcing capability scoping and immutable updates.",
    content: `import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from .model import State, Transform, StateDelta
from .receipts import WitnessReceipt
from .hashes import hash_state, hash_capability, hash_transform, hash_delta

class JubileeEngine:
    def __init__(self):
        self.receipt_store = {}

    def _assert_scope(self, state: State, transform: Transform) -> None:
        if transform.authority.scope == "*":
            return
        if transform.authority.scope not in state.nodes:
            raise PermissionError(f"Scope {transform.authority.scope!r} is not present in the state.")
        if transform.edge[0] != transform.authority.scope:
            raise PermissionError("Transform edge is outside the capability scope.")

    def apply(self, current_state: State, transform: Transform, actor_id: str = "sys", prior_receipt: Optional[str] = None) -> Tuple[State, StateDelta, WitnessReceipt]:
        if transform.authority.action != transform.action:
            raise PermissionError("Capability does not authorize this action.")
        if transform.action not in {"retire_edge", "restore_edge"}:
            raise ValueError(f"Unsupported action: {transform.action}")

        self._assert_scope(current_state, transform)

        new_edges = set(current_state.edges)
        retired = []
        restored = []
        
        if transform.action == "retire_edge":
            if transform.edge not in new_edges:
                raise ValueError("Cannot retire an inactive edge.")
            new_edges.remove(transform.edge)
            retired.append(transform.edge)
        elif transform.action == "restore_edge":
            if transform.edge in new_edges:
                raise ValueError("Cannot restore an already active edge.")
            new_edges.add(transform.edge)
            restored.append(transform.edge)

        delta = StateDelta(retired_edges=tuple(retired), restored_edges=tuple(restored))
        new_history = set(current_state.history)
        new_history.add(hash_state(current_state))

        next_state = State(
            nodes=current_state.nodes,
            edges=frozenset(new_edges),
            history=frozenset(new_history)
        )

        receipt_id = uuid.uuid4().hex[:8]
        receipt = WitnessReceipt(
            receipt_id=receipt_id,
            parent_state_hash=hash_state(current_state),
            child_state_hash=hash_state(next_state),
            transform_hash=hash_transform(transform),
            capability_id=hash_capability(transform.authority),
            actor_id=actor_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            prior_receipt_hash=prior_receipt,
            rationale=transform.reason,
            delta_hash=hash_delta(delta),
            provenance_map={
                f"edge:{transform.edge[0]}->{transform.edge[1]}->{transform.edge[2]}": (
                    f"receipt:{receipt_id}",
                    f"transform:{transform.action}",
                    "inactive" if transform.action == "retire_edge" else "active"
                )
            },
            signature="mock_ed25519_sig"
        )
        
        self.receipt_store[receipt_id] = receipt
        return next_state, delta, receipt

    def verify_chain(self, chain: List[WitnessReceipt]) -> bool:
        if not chain:
            return True
        for index, receipt in enumerate(chain):
            stored = self.receipt_store.get(receipt.receipt_id)
            if stored != receipt:
                return False
            if index == 0:
                if receipt.prior_receipt_hash is not None:
                    return False
            else:
                previous = chain[index - 1]
                if receipt.parent_state_hash != previous.child_state_hash:
                    return False
                if receipt.prior_receipt_hash != previous.receipt_id:
                    return False
        return True
`
  },
  {
    path: "examples/jubilee_demo.py",
    language: "python",
    description: "Executable loop performing Genesis graph construction, Break, Repair, and Verification.",
    content: `from jubilee.model import State, Transform, Capability
from jubilee.hashes import hash_state
from jubilee.engine import JubileeEngine

def main():
    engine = JubileeEngine()

    world = State.graph(
        nodes=["humanity", "garden", "tree_of_life"],
        edges=[
            ("humanity", "has_access_to", "tree_of_life"),
            ("humanity", "dwells_in", "garden"),
        ],
    )
    print(f"[genesis] state={hash_state(world)[:8]} active_edges={len(world.edges)}")

    exile_transform = Transform(
        action="retire_edge",
        edge=("humanity", "has_access_to", "tree_of_life"),
        reason="failure_event",
        authority=Capability(scope="humanity", action="retire_edge"),
    )
    exiled, exile_delta, exile_receipt = engine.apply(world, exile_transform)
    print(f"[break]   receipt={exile_receipt.receipt_id} state={hash_state(exiled)[:8]} retired_edges={len(exile_delta.retired_edges)}")

    repair_transform = Transform(
        action="restore_edge",
        edge=("humanity", "has_access_to", "tree_of_life"),
        reason="authorized_repair",
        authority=Capability(scope="humanity", action="restore_edge"),
    )
    restored, repair_delta, repair_receipt = engine.apply(exiled, repair_transform, prior_receipt=exile_receipt.receipt_id)
    print(f"[repair]  receipt={repair_receipt.receipt_id} state={hash_state(restored)[:8]} restored_edges={len(repair_delta.restored_edges)}")

    chain_valid = engine.verify_chain([exile_receipt, repair_receipt])
    history_retained = hash_state(exiled) in restored.history
    
    print(f"[verify]  chain_valid={chain_valid}")
    print(f"[verify]  ancestry_coverage={'1.00' if history_retained else '0.00'}")
    print(f"[verify]  access_restored={restored.is_active(('humanity', 'has_access_to', 'tree_of_life'))}")

if __name__ == "__main__":
    main()
`
  },
  {
    path: "tests/conftest.py",
    language: "python",
    description: "Pytest configuration with shared test fixtures for the Jubilee test suite.",
    content: `import pytest
from jubilee.engine import JubileeEngine
from jubilee.model import Capability, State

@pytest.fixture
def engine():
    return JubileeEngine()

@pytest.fixture
def world():
    return State.graph(
        nodes=["humanity", "garden", "tree_of_life", "outside"],
        edges=[
            ("humanity", "has_access_to", "tree_of_life"),
            ("humanity", "dwells_in", "garden"),
            ("outside", "contains", "tree_of_life"),
        ],
    )

@pytest.fixture
def garden_capability():
    return Capability(scope="garden", action="retire_edge")
`
  },
  {
    path: "tests/test_tamper.py",
    language: "python",
    description: "Verifies chain invalidation when parent hashes or block parameters are forged.",
    content: `from dataclasses import replace
from jubilee.model import Capability, Transform
from jubilee.hashes import hash_state

def test_tampered_witness_breaks_chain_verification(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    retire = Transform(
        action="retire_edge",
        edge=edge,
        reason="failure_event",
        authority=Capability(scope="humanity", action="retire_edge"),
    )
    exiled, _, exile_receipt = engine.apply(world, retire)

    restore = Transform(
        action="restore_edge",
        edge=edge,
        reason="authorized_repair",
        authority=Capability(scope="humanity", action="restore_edge"),
    )
    _, _, repair_receipt = engine.apply(exiled, restore, prior_receipt=exile_receipt.receipt_id)

    tampered = replace(repair_receipt, parent_state_hash="0" * 64)

    assert engine.verify_chain([exile_receipt, repair_receipt])
    assert not engine.verify_chain([exile_receipt, tampered])

def test_state_hash_changes_when_state_content_changes(world):
    altered = type(world)(
        nodes=world.nodes,
        edges=frozenset(),
        history=world.history,
    )
    assert hash_state(altered) != hash_state(world)

def test_receipt_store_detects_modified_receipt(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    retire = Transform(action="retire_edge", edge=edge, reason="break", authority=Capability(scope="humanity", action="retire_edge"))
    _, _, receipt = engine.apply(world, retire)
    modified = replace(receipt, rationale="forged")
    assert not engine.verify_chain([modified])
`
  },
  {
    path: "tests/test_scope_escape.py",
    language: "python",
    description: "Asserts error cases for operations outside capability bounds or scope parameters.",
    content: `import pytest
from jubilee.model import Capability, Transform

def test_rejects_action_not_authorized_by_capability(engine, world):
    transform = Transform(
        action="retire_edge",
        edge=("humanity", "has_access_to", "tree_of_life"),
        reason="unauthorized_action",
        authority=Capability(scope="humanity", action="restore_edge"),
    )
    with pytest.raises(PermissionError, match="does not authorize"):
        engine.apply(world, transform)

def test_rejects_scope_escape(engine, world):
    transform = Transform(
        action="retire_edge",
        edge=("outside", "contains", "tree_of_life"),
        reason="attempted_scope_escape",
        authority=Capability(scope="humanity", action="retire_edge"),
    )
    with pytest.raises(PermissionError, match="outside the capability scope"):
        engine.apply(world, transform)

def test_rejects_unknown_scope(engine, world):
    transform = Transform(
        action="retire_edge",
        edge=("humanity", "has_access_to", "tree_of_life"),
        reason="unknown_scope",
        authority=Capability(scope="nonexistent", action="retire_edge"),
    )
    with pytest.raises(PermissionError, match="not present in the state"):
        engine.apply(world, transform)

def test_allows_transform_inside_authorized_scope(engine, world):
    transform = Transform(
        action="retire_edge",
        edge=("humanity", "has_access_to", "tree_of_life"),
        reason="authorized_retirement",
        authority=Capability(scope="humanity", action="retire_edge"),
    )
    next_state, delta, receipt = engine.apply(world, transform)
    assert not next_state.is_active(transform.edge)
    assert delta.retired_edges == (transform.edge,)

def test_wildcard_scope_allows_any_edge(engine, world):
    transform = Transform(
        action="retire_edge",
        edge=("outside", "contains", "tree_of_life"),
        reason="wildcard",
        authority=Capability(scope="*", action="retire_edge"),
    )
    next_state, _, _ = engine.apply(world, transform)
    assert not next_state.is_active(transform.edge)
`
  },
  {
    path: "tests/test_history_preservation.py",
    language: "python",
    description: "Validates that parents remain permanently addressable in state.history.",
    content: `from jubilee.model import Capability, Transform
from jubilee.hashes import hash_state

def test_retirement_creates_witness_and_retains_parent_hash(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    transform = Transform(action="retire_edge", edge=edge, reason="failure", authority=Capability(scope="humanity", action="retire_edge"))
    parent_hash = hash_state(world)
    next_state, delta, receipt = engine.apply(world, transform)
    assert parent_hash in next_state.history
    assert receipt.parent_state_hash == parent_hash
    assert receipt.child_state_hash == hash_state(next_state)
    assert delta.retired_edges == (edge,)
    assert edge not in next_state.edges
    assert world.is_active(edge)

def test_restoration_preserves_full_ancestry(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    retire = Transform(action="retire_edge", edge=edge, reason="break", authority=Capability(scope="humanity", action="retire_edge"))
    exiled, _, r1 = engine.apply(world, retire)
    restore = Transform(action="restore_edge", edge=edge, reason="repair", authority=Capability(scope="humanity", action="restore_edge"))
    restored, _, r2 = engine.apply(exiled, restore, prior_receipt=r1.receipt_id)
    assert hash_state(world) in restored.history
    assert hash_state(exiled) in restored.history
    assert restored.is_active(edge)
    assert not exiled.is_active(edge)
    assert world.is_active(edge)
`
  },
  {
    path: "tests/test_replay.py",
    language: "python",
    description: "Rejects executing transforms against incorrect states or with broken parent references.",
    content: `import pytest
from jubilee.model import Capability, Transform

def test_receipt_cannot_be_replayed_against_nonmatching_parent(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    retire = Transform(action="retire_edge", edge=edge, reason="break", authority=Capability(scope="humanity", action="retire_edge"))
    exiled, _, r1 = engine.apply(world, retire)
    other_world = type(world)(nodes=world.nodes, edges=frozenset([("humanity", "dwells_in", "garden")]), history=frozenset())
    with pytest.raises(ValueError, match="Cannot retire an inactive edge"):
        engine.apply(other_world, retire)

def test_prior_receipt_must_match(engine, world):
    edge = ("humanity", "has_access_to", "tree_of_life")
    retire = Transform(action="retire_edge", edge=edge, reason="break", authority=Capability(scope="humanity", action="retire_edge"))
    exiled, _, r1 = engine.apply(world, retire)
    restore = Transform(action="restore_edge", edge=edge, reason="repair", authority=Capability(scope="humanity", action="restore_edge"))
    restored, _, r2 = engine.apply(exiled, restore, prior_receipt=r1.receipt_id)
    assert engine.verify_chain([r1, r2])
    from dataclasses import replace
    bad_link = replace(r2, prior_receipt_hash="wrong_id")
    assert not engine.verify_chain([r1, bad_link])
`
  },
  {
    path: "README.md",
    language: "markdown",
    description: "Comprehensive product contract and setup document for the Jubilee VM.",
    content: `# Jubilee VM

> An event-sourced graph engine for provenance-preserving transformation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://python.org)

Most systems mutate state, roll it back, or delete it.
Jubilee VM asks a different question:
> *Can a system transform while preserving the complete historical path that produced the transformation?*

It answers with immutable state snapshots, capability-scoped transforms, and verifiable witness chains. 

---

## The Model
**Resurrection is not rollback: repair creates a validated continuation, while failure remains historically addressable.**

### Repair without erasure
\`\`\`
State A [Access Active]
  │
  ▼  Witness 001 [Failure / Exile]
State B [Access Retired]  <─── Remains addressable!
  │
  ▼  Witness 002 [Authorized Repair]
State C [Access Restored] <─── Inherits State A identity & State B ancestry
\`\`\`

---

## Quick Start
\`\`\`bash
git clone https://github.com/the-static-collective/jubilee-vm.git
cd jubilee-vm
python -m venv .venv
source .venv/bin/activate
pip install -e .
python examples/jubilee_demo.py
pytest
\`\`\`

---

## Technical Specifications
* **Deterministic SHA-256 state hashes**: Encodes sorting canonical forms to guarantee payload equivalence.
* **Immutable state snapshots**: Implemented as frozen records with frozensets for state elements.
* **Witnessed edge transformations**: Record both active and historical associations instead of performing deletions.
* **Strict capability checks**: Limits scope modification boundaries.
* **Verification engine**: Assures unbroken parent-child witness lines.

---

## Research Tracks
The biblical corpus is used in our research track solely as an experimental, highly interlinked symbolic dataset for transformation topology and namespace lifecycle testing. See \`docs/symbolic-test-corpus.md\`.
`
  },
  {
    path: "docs/symbolic-test-corpus.md",
    language: "markdown",
    description: "Specifications of the Genesis forming/filling layers and John's prologue.",
    content: `# Symbolic Test Corpus
This document details the Genesis/John/Revelation hypergraph used as an experimental, highly structured symbolic stress-test for the VM.

## Genesis VM Primitives
* **ALLOCATE**: Create namespace boundary (e.g., Space, Water, Dry Land)
* **POPULATE**: Fill the namespace (e.g., Luminaries, Birds, Land Animals)
* **BIND**: Create relational mappings (e.g., Day & Night bounds)

## John 1.0 Realizations
* **ENCOUNTER**: Entrance of the sustaining principle into the created order.
* **RECEIVE**: Client-side reception of the authority key.
* **GRANT**: Relational entropy reduction through RBAC credentialing.
* **INCARNATE**: The ultimate boundary-crossing hyperevent.
`
  }
];
