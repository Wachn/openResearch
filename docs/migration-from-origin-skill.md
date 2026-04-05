# Migration from the origin `research-pi`

This starter keeps the original idea but changes the shape.

## Preserved

- root orchestration role
- thorough research and comparison modes
- canonical packet model
- output mode standardization
- source evaluation and citation rules

## Refactored out of the root skill

- corpus discovery -> `paper-scout`
- web extraction / crawl -> `web-corpus-builder`
- source scoring -> `source-evaluator`
- claim tracing -> `evidence-matrix`
- novelty and gap synthesis -> `novelty-gap-finder`
- experiment flow -> `experiment-designer`
- writing -> `paper-writer`
- prior-art and patent support -> `patent-scout`
- packaging -> `report-packager`

## Provider note

Keep provider credentials and host-specific MCP registration outside the skill itself.
