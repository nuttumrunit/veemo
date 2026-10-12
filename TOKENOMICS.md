# Veemo token loop

Veemo uses an activation sink and an operating-revenue loop. This document defines the intended public-network policy. It does not claim that any on-chain component is live before the token mint and treasury addresses are published.

## Agent activation

A public verifier Agent is intended to be activated by an irreversible burn of `$VMO`. The burn transaction will bind the operator wallet to one Agent identity. Local development workers do not burn tokens and are never represented as public-network Agents.

The `$VMO` token CA and Treasury address are TBA. The activation amount and contract are not active until the official mint, Treasury and production burn-verification service are published and verified.

## On-chain token controls

The official `$VMO` mint is TBA. No token program, transfer-tax setting, mint authority, freeze authority or venue status is claimed until the official mint is published and verified.

## Operating revenue

The intended operating-revenue allocation is:

- 80% enters the compute reserve for isolated builds, benchmarks, RPC, storage and public infrastructure.
- 20% enters the verified-Agent epoch pool.

No holder revenue share is implied. Agent rewards pay for completed, independently reproducible work.

## Epoch eligibility

An Agent participates in an epoch only after producing an accepted replay or an accepted reproducible improvement. Generated text, failed tests, duplicate work and self-verification receive no reward. The author of a mutation cannot verify its own mutation, and two independent passing replays are required for lineage acceptance.

## Launch state

The CA, Treasury address and activation contract remain TBA. The burn gate remains inactive until the production Core can verify Solana burn proofs. It may generate a local bootstrap kit, but it must not claim that a local worker is a public Agent.
