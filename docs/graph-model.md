# Graph model

## Purpose

The graph is the control-plane view of the project. It shows:

- which skills call which skills
- which agents prefer or delegate to which skills and agents
- which capabilities each skill needs
- which artifacts move between stages
- which contexts and rules affect behavior

## Minimal manifest contract

```yaml
name: research-pi
kind: skill
links:
  calls: [paper-scout, source-evaluator]
  reads_context: [project/AGENTS.md, rules/research.mdc]
capabilities:
  requires: [web.search, scholar.search, citation.lookup]
artifacts:
  consumes: [research.request]
  produces: [research.packet]
```

## Recommended edge semantics

- `calls`: active skill-to-skill delegation
- `uses`: required capability or preferred skill
- `delegates`: agent-to-agent handoff
- `consumes`: artifact input contract
- `produces`: artifact output contract
- `reads`: contextual dependency

## Why this matters

Once the repo has 20+ skills and 10+ agents, prose alone stops being enough. The graph becomes the maintainable truth for composition, onboarding, and refactoring.
