---
name: research-pi
description: comprehensive research planning, retrieval, evaluation, comparison, and report packaging for topic research and multi-option comparisons. use when the host needs the top-level research orchestrator to frame the request, route evidence work to linked atomic skills and host capabilities, normalize results into a canonical research packet, and package the final deliverable.
---

# Research PI

Comprehensive research orchestration for evidence-backed topic research and comparative analysis.

## Configuration

- Default output language: English.
- If the user explicitly asks for simplified Chinese, Chinese, 中文, or 简体中文, output the report in simplified Chinese.
- Default output mode: standard report.
- Optional packaging modes:
  - docx-ready report
  - ppt-ready outline
  - notebook markdown
- Retrieval default:
  1. external search first
  2. added sources second
  3. synthesis and packaging last

## openResearch orchestration model

This skill is the root orchestrator. Keep the full research logic here, but route specialized work through linked atomic skills and host-provided capabilities instead of hardcoding one provider or embedding credentials.

### Routing flow

1. Frame the research question, motivation, decision support need, scope, output mode, and language.
2. Apply **Routing Flow 0 — base activation overlay** when the request needs idea-centric work, manuscript work, or patent work. This is not a separate user-facing feature. It is the always-available base path that activates `research-profile`, `paper-scout`, `paper-reader`, `reading-list`, and `synthesis`, then brings in `paper-writer` or `patent-scout` only when the request actually needs them.
3. Choose the main research path:
   - **Routing Flow 1 / Feature 1:** single-topic research -> `research-profile`, `paper-scout`, `paper-reader`, `reading-list`, `synthesis`, `web-corpus-builder`, `source-evaluator`, `evidence-matrix`, `novelty-gap-finder`
   - **Routing Flow 2 / Feature 2:** multi-option comparison -> `research-profile`, `paper-scout`, `paper-reader`, `reading-list`, `synthesis`, `comparison-research`, `source-evaluator`, `evidence-matrix`
4. Use host capabilities for retrieval and citation work, especially `web.search`, `web.extract`, `scholar.search`, and `citation.lookup`.
5. Normalize all serious outputs into the canonical `ResearchPacket`.
6. Apply **Routing Flow 3 — publish overlay** when the result needs a visible structured deliverable, and send that packaging step to `report-packager` so it can emit publishable files under `research-workspace/reports/`.
7. Emit graph-friendly run metadata when the host supports it.

### Portability rules

- Ask for capability names, not vendor APIs.
- Keep provider credentials and host-specific registration outside this skill.
- Assume the host owns execution, auth, scheduling, and UI.
- In the first iteration, stay skill-first. Do not require agent profiles for the main research workflow when linked atomic skills are sufficient.
- Prefer linked atomic skills over expanding every specialized task into this file.
- Keep markdown and manifest metadata aligned, since this repo treats metadata as routing truth.

## Capability integration and host bindings

This skill is host-portable. It may run in hosts that bind `web.search`, `web.extract`, `scholar.search`, and `citation.lookup` to different providers. The reasoning policy stays the same regardless of the bound provider.

### Retrieval policy

**Purpose:** start broad enough to ground the question, then narrow into authoritative sources, extraction, comparison, and packaging.

**When to use host capabilities directly:**

- General web research on topics, entities, or questions -> `web.search`
- Full-text retrieval from specific URLs or documentation pages -> `web.extract`
- Paper-centric, academic, or technical discovery -> `scholar.search`
- Citation enrichment, bibliographic lookup, and reference normalization -> `citation.lookup`

**When to route to linked subskills instead of doing everything inline:**

- corpus discovery across papers and official materials -> `paper-scout`
- deep reading and structured note extraction -> `paper-reader`
- reading workflow maintenance and dashboard state -> `reading-list`
- research direction and preference alignment -> `research-profile`
- deep website or documentation hub collection -> `web-corpus-builder`
- explicit authority, recency, bias, and corroboration scoring -> `source-evaluator`
- claim tracing, evidence mapping, and support matrices -> `evidence-matrix`
- gap, novelty, and opportunity synthesis -> `novelty-gap-finder`
- idea synthesis from accumulated reading notes -> `idea-generator`
- side-by-side option analysis -> `comparison-research`
- experiment planning and paper-ready method framing -> `experiment-designer`
- paper-style writeups after research is complete -> `paper-writer`
- prior-art and patent-oriented searches -> `patent-scout`
- final markdown, docx-ready, ppt-ready, or notebook packaging -> `report-packager`

### Host binding rules

- Prefer official, primary, recent, and citable sources regardless of provider.
- Treat provider-specific search, crawl, extract, or scholar tools as interchangeable bindings behind the same capability names.
- Never put API keys, tokens, or provider-specific credential steps in this file.
- If the host exposes extra retrieval tools, use them only when they fit the same evidence standards and routing model.

### Exact capability-manifest paths

The abstract capability names used in this skill are not placeholders without a home. In this repo, the current bindings live at:

- `web.search` -> `tools/manifests/tavily-web-search.yaml`
- `web.extract` -> `tools/manifests/scrapling-web-extract.yaml`
- `scholar.search` -> `tools/manifests/scholar-search.yaml`
- `citation.lookup` -> `tools/manifests/citation-lookup.yaml`

Related concrete repo paths that support local evidence and report browsing:

- local repo indexing -> `packages/openresearch_core/repo_index.py`
- local hub API -> `apps/research-hub/server.py`

Related exact skill paths for arXiv-first paper discovery and synthesis:

- arXiv-first discovery logic -> `skills/paper-scout/SKILL.md`
- reading-note condensation -> `skills/paper-reader/SKILL.md`
- multi-source condensation -> `skills/synthesis/SKILL.md`

## General retrieval best practices

**For all retrieval paths:**

- Use specific, targeted queries rather than overly broad ones.
- Prioritize primary and official sources from results.
- Identify potentially biased content such as marketing or promotional pages explicitly.
- Separate discovery from extraction and extraction from synthesis.
- Keep source collection balanced across compared options.

**When native or host web search is available:**

1. Start with host-bound web or scholarly search.
2. Use linked subskills when the task needs deeper collection, structured evaluation, comparison, or packaging.
3. Prioritize primary and official sources regardless of the host binding.

**Capability selection guide:**

| Research Need | Best Capability or Route | Alternative |
|---|---|---|
| Quick web search | `web.search` | `paper-scout` for more structured discovery |
| Full article or docs extraction | `web.extract` | `web-corpus-builder` for multi-page collection |
| Deep website dive | `web-corpus-builder` | direct `web.extract` on selected URLs |
| Paper and academic discovery | `scholar.search` or `paper-scout` | `web.search` when scholarship is sparse |
| arXiv-first paper discovery | `paper-scout` using arXiv API + `web.extract` | `scholar.search` |
| Source scoring and corroboration | `source-evaluator` | inline evaluation for small tasks |
| Claim traceability | `evidence-matrix` | inline citations for light tasks |
| Many-source condensation | `synthesis` | manual synthesis |
| Gap and novelty analysis | `novelty-gap-finder` | manual synthesis |
| Comparison workflow | `comparison-research` | inline comparison for very small requests |
| Final report packaging | `report-packager` | direct markdown only when no packager exists |

- Added sources include local repositories, indexed documents, uploaded PDFs or docs, and user-provided URLs.

## Grounding Rules

- Never fabricate facts, citations, statistics, quotes, dates, or source names.
- Prefer primary, official, recent, and citable sources.
- For paper-centric, academic, or technical topics, start with scholarly search.
- Distinguish facts, inferences, hypotheses, and open questions.
- State uncertainty when evidence is weak, conflicting, or incomplete.
- Do not modify arbitrary local files, repositories, or uploaded documents during evidence gathering. The only allowed materialized outputs are explicit workspace artifacts produced through linked packaging or workflow skills under `research-workspace/`.
- Use platform-native citations when available, otherwise use numbered citations with a source list.

## Trigger Boundary

After this skill triggers, first classify the request and keep the workflow narrow:

- Run **Feature 1: Thorough Research** when the user explicitly asks to research a topic, investigate several questions, or produce an evidence-backed report.
- Run **Feature 2: Multi-disciplinary Comparison Research** when the user asks to compare 2 or more areas, products, technologies, companies, markets, or approaches in a research-driven way.

Do not trigger for casual chat, trivial one-hop factual lookups, pure creative brainstorming with no evidence requirement, or direct file editing tasks.

## Core Capabilities

These are not random labels. They are orchestration labels backed by concrete skills, capability manifests, or local code paths.

| Label | Backed by | Exact path |
|---|---|---|
| research planning | root orchestration in this skill | `skills/research-pi/SKILL.md` |
| web-first grounding | generic web discovery binding plus deep site collection | `tools/manifests/tavily-web-search.yaml`, `skills/web-corpus-builder/SKILL.md` |
| scholar-first grounding | scholarly binding plus arXiv-first discovery workflow | `tools/manifests/scholar-search.yaml`, `skills/paper-scout/SKILL.md` |
| local repository search | repo index and hub api | `packages/openresearch_core/repo_index.py`, `apps/research-hub/server.py` |
| source evaluation | explicit evidence scoring skill | `skills/source-evaluator/SKILL.md` |
| structured extraction | web extract binding and reading-note skill | `tools/manifests/scrapling-web-extract.yaml`, `skills/paper-reader/SKILL.md` |
| synthesis | condensed multi-source analysis skill | `skills/synthesis/SKILL.md` |
| conflicting-view analysis | comparison and evidence traceability | `skills/comparison-research/SKILL.md`, `skills/evidence-matrix/SKILL.md` |
| gap detection | unresolved-question and whitespace detection | `skills/novelty-gap-finder/SKILL.md` |
| novelty discovery | opportunity and research-angle synthesis | `skills/novelty-gap-finder/SKILL.md`, `skills/idea-generator/SKILL.md` |
| patent idea discovery | prior-art and patent-oriented routing | `skills/patent-scout/SKILL.md` |
| report generation | publish-ready packaging and manuscript support | `skills/report-packager/SKILL.md`, `skills/paper-writer/SKILL.md` |
| citation generation | citation binding | `tools/manifests/citation-lookup.yaml` |

**openResearch linked execution capabilities:**

- **Top-level framing and routing:** keep framing, workflow selection, and packet normalization in this root skill
- **Single-topic evidence collection:** route paper and web collection to `paper-scout` and `web-corpus-builder`
- **Profile-aware discovery and review:** use `research-profile`, `paper-reader`, and `reading-list` when the workflow needs personalized discovery, durable reading notes, or a visible reading queue
- **Condensed synthesis before packaging or tradeoff work:** use `synthesis` when the source set is too large or too heterogeneous for direct root-skill summarization
- **Comparison execution:** route balanced multi-option analysis to `comparison-research`
- **Evidence quality scoring:** route scoring and bias checks to `source-evaluator`
- **Claim traceability:** route structured support mapping to `evidence-matrix`
- **Novelty and gap work:** route unresolved questions and opportunity signals to `novelty-gap-finder`
- **Idea generation:** route cross-paper research directions to `idea-generator`
- **Experiment and paper workflows:** use `experiment-designer` and `paper-writer` when the request becomes research-method or manuscript-centric
- **Prior art work:** use `patent-scout` for prior-art and patent-facing tasks
- **Final packaging:** use `report-packager` for the final medium

If the user wants an actual slide deck or `.pptx` artifact rather than a text outline, finish the research first, then hand off the packaged outline to a dedicated presentation or report packaging path if one is available in the host.

## Presentation handoff

- If the user wants slide-ready content, first generate a ppt-ready outline inside this skill.
- If the user explicitly wants an actual `.pptx` artifact and a dedicated presentation flow is available, hand off the finalized outline after research and packaging are complete.
- Prefer a dedicated presentation or report packaging path for actual PowerPoint generation, editing, or template-based deck production.

## Output Mode Selection

Choose one mode unless the user explicitly asks for multiple deliverables:

- **standard report**: default for most research requests
- **docx-ready report**: use when the user mentions word doc, docx, formal report, document circulation, review package, or archive-ready report
- **ppt-ready outline**: use when the user mentions slides, deck, presentation, exec readout, or wants content streamlined for ppt
- **notebook markdown**: use when the user mentions notebooklm, markdown, md, notes, knowledge capture, or reusable briefing docs

## Research Content Requirements

All strong research outputs should answer these questions in order:

1. why this research exists now
2. what exact problem or decision it supports
3. what is in scope and out of scope
4. how evidence was gathered and judged
5. what was found
6. what the findings mean
7. what should be done next

The report or outline should therefore include the following content blocks whenever the evidence supports them:

- motivation
- research question or decision question
- problem to solve or decision to support
- scope and assumptions
- method or evidence basis
- evaluation criteria when comparison is involved
- key findings
- tradeoffs or conflicting views
- implications
- recommendation or decision guidance
- gaps or next questions
- sources

Do not treat a research deliverable as a loose note dump. It must explain why the work matters, what problem it helps solve, and what action should follow.

## Canonical Research Output Model

Before final packaging, normalize the result into this internal structure:

- research question or decision question
- motivation and context
- problem to solve or decision to support
- scope and assumptions
- output mode
- method or evidence basis
- key findings
- evidence by theme or criterion
- source quality assessment
- conflicting views and uncertainty
- implications or recommendations
- gaps and next questions
- novelty or opportunity signals, when relevant
- citations and source list

All final deliverables must be derived from this same normalized structure.

## Output Medium Standardization

Treat markdown as the canonical text packaging format unless the user explicitly requests another medium.

### Markdown standard

Use markdown for:
- standard reports
- notebook-ready research notes
- intermediate canonical packaging before ppt or docx handoff

Markdown outputs must:
- preserve full section hierarchy
- preserve uncertainty and citation traceability
- use tables only when they improve comparison or scanability
- avoid decorative formatting or duplicated sections

### PPT standard

PPT-ready outputs must:
- optimize for audience attention, not completeness
- use one core message per slide
- include only the most decision-relevant evidence
- recommend visuals instead of overloading slides with prose
- place citations in a compact source footer
- move heavy detail into appendix-style backup slides only when necessary

### DOCX standard

DOCX-oriented outputs must:
- preserve full report hierarchy
- support richer prose than PPT
- keep citations, tables, appendices, and structured summaries intact
- remain suitable for formal circulation, review, or archival use

### Relative verbosity rule

For the same research task:
- PPT is the shortest
- standard report is medium depth
- notebook markdown and DOCX can be more detailed

## Two Main Features

The two user-facing major features remain Feature 1 and Feature 2. Feature 0 is an internal base overlay that automatically activates profile, reading, synthesis, manuscript, or patent helpers when the request needs them.

| Feature | Description | When to Use |
|---------|-------------|-------------|
| **Thorough Research** | Full research workflow with planning, evidence gathering, evaluation, synthesis, and report packaging | When the user explicitly requests research on a topic or multiple questions |
| **Multi-disciplinary Comparison Research** | Comparative research across 2 or more areas, products, technologies, markets, or approaches | When the user asks for research that compares multiple options or domains |

## Feature 0: Base Activation Overlay

Feature 0 is not a standalone user-facing mode. It is the default activation layer that enriches Feature 1 or Feature 2 when the request implies any of the following:

- idea generation
- manuscript preparation
- patent-oriented follow-up
- many-source condensation before final synthesis

When Feature 0 activates, route through:

- `research-profile`
- `paper-scout`
- `paper-reader`
- `reading-list`
- `synthesis`

Then bring in `idea-generator`, `paper-writer`, or `patent-scout` only when the request actually needs those downstream outcomes.

---

# Feature 1: Thorough Research

Perform a complete research workflow and generate one evidence-backed deliverable at the end.

## Step 1: Research Framing

- Define the main question and practical scope.
- State the motivation for the research and the practical problem or decision it supports.
- Break the question into sub-questions only when that improves coverage.
- Decide the source mix:
  - general or current topics -> web and official sources first
  - paper-heavy or technical topics -> scholarly sources first
  - trend or narrative tracking -> social monitoring when relevant
  - local repo or uploaded docs provided by the user -> added-source review after initial grounding, or earlier if the user explicitly wants local-first
- Detect the requested output mode and language before gathering evidence.
- If the request is ambiguous, choose the simplest reasonable interpretation, state it briefly, and continue.
- Select the routing path early so retrieval and evaluation can be delegated cleanly:
   - broad paper or academic discovery -> `paper-scout`
   - long-form source condensation or many-note summarization -> `synthesis`
   - multi-page web or documentation collection -> `web-corpus-builder`
   - heavy evidence scoring -> `source-evaluator`
  - traceability-heavy or claim-sensitive work -> `evidence-matrix`
  - novelty, gap, or opportunity synthesis -> `novelty-gap-finder`

## Step 2: Evidence Gathering

Gather evidence from the best-fit channels in this order unless the user specifies otherwise:

1. external search first
2. added sources second
3. social or trend sources when relevant

Preferred source order by topic:

- official sites, primary docs, filings, standards, vendor pages
- reputable media and trade publications
- scholarly sources such as Google Scholar, arXiv, journals, conference proceedings, PubMed, PapersWithCode, or JSTOR when relevant
- local repositories, indexed documents, uploaded PDFs or docs, and user-provided links
- social or community sources only when they add real signal

### openResearch routing for evidence gathering

When host capabilities or linked skills are available, gather evidence through the current repo's routing model:

1. **General web grounding:** use `web.search` first for broad discovery and official-source identification.
2. **Paper-centric discovery:** use `scholar.search` or route to `paper-scout` when the task needs broader paper collection, citation trails, or structured corpus building.
3. **Specific URL extraction:** use `web.extract` for selected pages that need close reading.
4. **Deep site or documentation hub collection:** route to `web-corpus-builder` when the task requires multi-page retrieval, documentation traversal, or structured site corpus building.
5. **Company, product, or standards research:** start with web or scholarly discovery, then promote the strongest domains or references into extraction or corpus-building work.
6. **Added-source integration:** incorporate local repositories, indexed docs, uploaded files, and user URLs after external grounding unless the user explicitly requests local-first research.
7. **Comparison tasks:** keep source coverage balanced, and route repeated side-by-side option gathering to `comparison-research` when the comparison is substantial.

### Evidence gathering rules

- Start broad enough to avoid premature narrowing.
- Narrow quickly once primary sources and credible secondary sources emerge.
- Keep notes on source role: primary evidence, secondary interpretation, scholarly grounding, or market signal.
- Do not let one provider, vendor, or community source dominate the evidence base unless the topic truly requires it.

## Step 3: Source Evaluation and Extraction

For each important source, assess:

- authority
- credibility
- recency
- likely bias
- corroboration

Classify evidence as:

- high confidence: primary, reputable, recent, corroborated
- medium confidence: useful but indirect, incomplete, or lightly corroborated
- low confidence: anecdotal, outdated, speculative, or weakly sourced

Extract only the material that matters:

- key findings and claims
- quantitative data and dates
- methods, mechanisms, or benchmarks
- timelines and events
- contradictions or disagreements
- research gaps and unanswered questions

### openResearch evaluation routing

- Route explicit source scoring, recency checks, and bias analysis to `source-evaluator` when the request benefits from formal source-quality assessment.
- Route claim tracing, evidence support tables, and citation-to-claim mapping to `evidence-matrix` when the user needs transparent evidence chains.
- Keep the root skill responsible for deciding which extracted material actually matters to the final research question.

## Step 4: Synthesis and Packaging

Produce a decision-useful deliverable that:

- answers the research question directly
- explains the motivation and why the result matters now
- names the problem to solve or decision to support
- separates facts, inferences, and open questions
- highlights conflicts and uncertainty
- adds strategic implications when relevant
- identifies novelty or patent-opportunity signals only as inferred opportunities
- cites all important factual claims

Use the matching final template from the embedded Output Templates section below.
Do not dump raw notes. Synthesize first, then package.

### openResearch synthesis routing

- Route many-note, many-paper, or mixed-source condensation to `synthesis` before final packaging when the evidence set is too large to reason over cleanly in one pass.
- Use `synthesis` as the preferred bridge between `paper-reader` outputs and final report packaging whenever the request requires abridged or condensed source understanding.
- Route novelty, gap, and opportunity synthesis to `novelty-gap-finder` when the request explicitly needs unresolved questions, whitespace, or opportunity framing.
- Normalize the final result into the canonical `ResearchPacket` before medium-specific formatting.
- Send final markdown, docx-ready, ppt-ready, notebook-specific, or published html packaging to `report-packager` when available.

---

# Feature 2: Multi-disciplinary Comparison Research

Perform a comparative research workflow for 2 or more options and generate one comparison deliverable at the end.

## Step 1: Comparison Frame

- Identify the compared items and keep the framing symmetric.
- State the decision question, the motivation for comparing now, and the practical choice or tradeoff this comparison supports.
- Define the comparison criteria explicitly. Common criteria:
  - performance
  - cost or total cost of ownership
  - maturity
  - ecosystem or adoption
  - implementation complexity
  - risks and constraints
  - fit by scenario
- If the user did not give criteria, infer the smallest sensible set and state it briefly.
- Route the comparison to `comparison-research` when the work needs repeated, balanced evidence collection across multiple options.

## Step 2: Evidence Gathering by Option

Collect evidence for each option using the same standard where possible:

- primary or official sources first
- scholarly sources for technical or research-heavy comparisons
- reputable secondary sources for context
- added sources provided by the user after external grounding, or first if explicitly requested
- social or community signal only when it helps explain market narrative, practitioner sentiment, or emerging issues

Keep source coverage balanced so one option is not under-researched.

### openResearch comparison routing

- Use `comparison-research` for structured option-by-option discovery and criteria-based evidence collection.
- Use `source-evaluator` to keep confidence judgments consistent across all options.
- Use `evidence-matrix` when the output needs claim-level traceability for each criterion.

## Step 3: Tradeoff Analysis

- Compare like with like.
- Separate measured evidence from opinion or marketing claims.
- Highlight where the evidence is strong, mixed, or incomplete.
- Explain why sources disagree when possible:
  - different benchmarks
  - different time windows
  - different assumptions
  - vendor incentives
  - sampling bias
- Provide scenario-based guidance rather than forcing a single winner when the tradeoffs are real.

### openResearch tradeoff routing

- Use `synthesis` before tradeoff packaging when each option has many sources, long notes, or mixed literature plus web evidence.
- Use `evidence-matrix` when tradeoff claims must stay traceable to concrete sources.

## Step 4: Decision Packaging

Generate a comparison-first deliverable that:

- presents an at-a-glance comparison matrix
- summarizes major differences in plain language
- explains tradeoffs and fit-by-scenario
- states the recommended option or shortlist when justified
- clearly marks unresolved uncertainty
- includes motivation, decision question, and scenario logic
- cites every material claim

Use the matching comparison template from the embedded Output Templates section below.

---

# Output Rules

## Language Selection

- Default to English.
- Switch to simplified Chinese only if the user explicitly asks for Chinese, 中文, 简体中文, or a Chinese-language report.
- Do not mix languages unless the user explicitly asks for bilingual output.
- Keep company names, paper titles, product names, standards, and citation titles in their original language where helpful.

## Citation Protocol

- Cite every important factual claim.
- Prefer primary sources over summaries.
- Use platform-native citations when available.
- If native citations are unavailable, use numbered citations like `[1]` and end with a source list containing title, publisher or author, date, and link if available.
- If a claim is plausible but not fully verified, label it as tentative.
- If sources conflict, present both sides and explain the disagreement.

## Report Quality Rules

- Be structured, analytical, and decision-useful.
- Optimize for evidence rather than volume.
- Prefer synthesis over long source-by-source recaps.
- Do not overstate certainty.
- If evidence is insufficient, say what was found, what remains unclear, and what should be checked next.

## Output Boundary

- Use only the final template that matches:
  1. the feature
  2. the output mode
  3. the selected language
- Do not combine the single-topic and comparison templates unless the user explicitly asks for both.
- Do not add extra appendices unless the user asks for them.
- For ppt-ready outputs, produce a slide-ready outline, not a full `.pptx` file, unless a dedicated presentation or packaging path is available and the user explicitly wants the artifact.
- For docx-ready outputs, produce a formal report structure suitable for handoff to a document-generation skill or downstream formatting flow.
- For notebook markdown outputs, keep the markdown clean, portable, and easy to paste into NotebookLM or similar tools.

## Failure Handling

If evidence is insufficient:

- state what was found
- state what remains unclear
- state what should be searched next

If the request is broad:

- narrow it into a practical research plan and proceed

If the request is ambiguous:

- choose the simplest reasonable interpretation, state it briefly, and continue

---

# Output Templates

Use the template that matches the selected feature, output mode, and language.

## General Rules

- Default to English.
- Use simplified Chinese only when the user explicitly asks for it.
- Do not mix report modes unless the user explicitly wants multiple deliverables.
- Cite every important factual claim.
- Prefer platform-native citations. If unavailable, use numbered citations and a source list.
- If the user wants an actual presentation artifact, package the content as a ppt-ready outline first, then hand off to a dedicated presentation or packaging path if one is available.

## openResearch invocation pattern

**When serious research work needs multiple stages:**

1. **Frame in `research-pi`:** define the research question, motivation, scope, output mode, and likely routing path.
2. **Collect evidence through host capabilities or linked skills:**
   - `web.search` for discovery
   - `web.extract` for close reading of selected pages
   - `scholar.search` or `paper-scout` for paper-heavy discovery
   - `web-corpus-builder` for multi-page web collection
3. **Evaluate and trace evidence:**
   - `source-evaluator` for quality scoring
   - `evidence-matrix` for claim-to-source support mapping
4. **Synthesize gaps or opportunity signals:**
   - `novelty-gap-finder` when needed
5. **Package from the canonical packet:**
   - `report-packager` for final medium-specific output

**Result curation rules:**

- Prefer primary and official sources over secondary sources.
- Identify and flag marketing or promotional content clearly.
- Extract structured information such as claims, dates, methods, specifications, pricing, release notes, benchmarks, and documentation links when relevant.
- Keep all outputs compatible with a canonical `ResearchPacket` before final formatting.

---

# English Templates

## Feature 1: Thorough Research

### A. Standard Report

```markdown
# Research Report: {topic}

**Motivation:** {why this research matters now}
**Research question:** {main question}
**Problem to solve / decision to support:** {decision, risk, or opportunity}
**Scope:** {scope, assumptions, or interpretation used}
**Output mode:** standard report
**Confidence:** {High / Medium / Low} - {brief reason}

## Executive Summary
{Answer the main question directly in 1 short paragraph. State what is well supported, what is uncertain, why it matters, and what decision or action follows.}

## Method / Evidence Basis
- **Source types used:** {official sites / scholarly sources / trade publications / local docs / uploaded files / URLs / social sources if relevant}
- **How evidence was judged:** {authority, recency, corroboration, bias}
- **Key limitation:** {most important evidence constraint}

## Key Findings
### 1. {theme or finding}
- **What the evidence says:** {finding}
- **Why it matters:** {decision impact}
- **Evidence / citations:** {platform-native citations or [1][2]}

### 2. {theme or finding}
- **What the evidence says:** {finding}
- **Why it matters:** {decision impact}
- **Evidence / citations:** {citations}

## Source Quality Assessment
| Area | Confidence | Why |
|------|------------|-----|
| {area} | {high/medium/low} | {authority, recency, corroboration, bias notes} |

## Conflicting Views / Uncertainty
- **Issue:** {what is disputed or unclear}
- **Why the evidence differs:** {benchmark differences, time windows, assumptions, bias, or missing data}
- **Current read:** {most defensible interpretation}

## Strategic Implications
- {implication or action takeaway}
- {implication or action takeaway}

## Recommendation / Decision Guidance
- **Recommended direction:** {best-supported action or choice}
- **When this recommendation holds:** {conditions}
- **What to validate next:** {next validation step}

## Research Gaps / Next Questions
- {unknown or follow-up question}
- {unknown or follow-up question}

## Novelty / Patent Opportunity Signals
- {optional inferred opportunity; clearly label it as an inference, not a fact}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### B. DOCX-Ready Report

```markdown
# DOCX-Ready Research Report: {topic}

**Motivation:** {why this research matters now}
**Research question:** {main question}
**Problem to solve / decision to support:** {decision, risk, or opportunity}
**Scope:** {scope, assumptions, or interpretation used}
**Output mode:** docx-ready report
**Confidence:** {High / Medium / Low} - {brief reason}

## Executive Summary
{Concise high-level answer suitable for the first page of a formal document.}

## Background / Motivation
{Explain why this topic matters, what triggered the research, and why the decision matters now.}

## Research Question and Objectives
- **Main question:** {main question}
- **Sub-questions:** {optional}
- **Intended use of this report:** {decision, review, planning, or archival use}

## Scope and Assumptions
- **In scope:** {scope}
- **Out of scope:** {explicit exclusions}
- **Assumptions:** {important assumptions}

## Method / Evidence Basis
- **Source types used:** {source mix}
- **Evaluation criteria:** {authority, recency, corroboration, bias}
- **Evidence limitations:** {limitations}

## Findings
### {theme}
{finding with supporting evidence and citations}

### {theme}
{finding with supporting evidence and citations}

## Tradeoffs / Conflicting Views
- **Issue:** {disagreement}
- **Reason for disagreement:** {why sources differ}
- **Current interpretation:** {best-supported read}

## Implications
- {strategic, technical, product, or operational implication}
- {strategic, technical, product, or operational implication}

## Recommendation
- **Recommended action:** {recommendation}
- **Rationale:** {why}
- **Next steps:** {follow-up actions}

## Open Questions / Research Gaps
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### C. PPT-Ready Outline

```markdown
# PPT-Ready Research Outline: {topic}

**Audience:** {executive / technical / mixed}
**Objective:** {what the deck should help the audience decide or understand}
**Motivation:** {why this topic matters now}
**Problem to solve / decision to support:** {decision, risk, or opportunity}
**Recommended deck length:** {N slides}
**Core answer in one sentence:** {main answer}

## Storyline
- {opening message}
- {middle message}
- {closing recommendation}

## Slide Outline
### Slide 1 - Title and decision context
- **Core message:** {what this research is about and why now}
- **Supporting points:**
  - {motivation}
  - {decision context}
- **Suggested visual:** title slide with subheading or decision frame
- **Source footer:** {citations if needed}

### Slide 2 - Scope and approach
- **Core message:** {what was analyzed and how}
- **Supporting points:**
  - {scope}
  - {evidence basis}
- **Suggested visual:** scope box, source mix, or process flow
- **Source footer:** {citations}

### Slide 3 - {title}
- **Core message:** {single takeaway}
- **Supporting points:**
  - {point}
  - {point}
- **Suggested visual:** {chart / timeline / comparison table / process flow / market map / diagram}
- **Source footer:** {citations}

### Slide 4 - {title}
- **Core message:** {single takeaway}
- **Supporting points:**
  - {point}
  - {point}
- **Suggested visual:** {visual}
- **Source footer:** {citations}

### Slide 5 - {title}
- **Core message:** {single takeaway}
- **Supporting points:**
  - {point}
  - {point}
- **Suggested visual:** {visual}
- **Source footer:** {citations}

## Risks / Uncertainty Slide
- {uncertainty}
- {what would change the conclusion}

## Recommendation Slide
- **Recommended action:** {recommendation}
- **Why now:** {timing or strategic reason}
- **Next step:** {practical follow-up}
```

### D. Notebook Markdown

```markdown
# {topic}

> Motivation: {why this research matters now}
> Research question: {main question}
> Problem to solve / decision to support: {decision, risk, or opportunity}
> Scope: {scope or assumptions}
> Confidence: {High / Medium / Low} - {brief reason}

## TL;DR
- {main conclusion}
- {second conclusion}
- {main uncertainty}

## Method / Evidence Basis
- {source mix}
- {how evidence was judged}
- {key limitation}

## Findings
### {theme}
- {finding}
- **Evidence:** {citations}

### {theme}
- {finding}
- **Evidence:** {citations}

## Source Quality Notes
- {which parts are strongest and why}
- {which parts are weaker and why}

## Conflicts and Unknowns
- {conflict or unknown}
- {conflict or unknown}

## Implications
- {actionable takeaway}
- {actionable takeaway}

## Recommendation
- {recommended direction}
- {what to validate next}

## Next Questions
- {follow-up question}
- {follow-up question}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

## Feature 2: Multi-disciplinary Comparison Research

### A. Standard Comparison Report

```markdown
# Comparison Research Report: {option A} vs {option B} {vs option C}

**Motivation:** {why this comparison matters now}
**Decision question:** {what the comparison is meant to answer}
**Problem to solve / decision to support:** {practical choice, risk, or opportunity}
**Criteria:** {criteria used}
**Output mode:** standard report
**Confidence:** {High / Medium / Low} - {brief reason}

## Executive Summary
{Summarize the biggest differences, the best option by scenario, the decision logic, and the main uncertainty in 1 short paragraph.}

## Method / Evidence Basis
- **Source types used:** {official / scholarly / trade / local docs / uploaded files / URLs}
- **How options were judged:** {criteria and evaluation logic}
- **Key limitation:** {main evidence constraint}

## At-a-Glance Comparison
| Option | Best For | Main Strengths | Main Limits | Overall Read |
|--------|----------|----------------|-------------|--------------|
| {option} | {scenario} | {strengths} | {limits} | {short verdict} |

## Detailed Comparison by Criterion
### {criterion}
| Option | Evidence-backed assessment | Citations |
|--------|----------------------------|-----------|
| {option} | {assessment} | {citations} |

### {criterion}
| Option | Evidence-backed assessment | Citations |
|--------|----------------------------|-----------|
| {option} | {assessment} | {citations} |

## Tradeoffs and Conflicting Views
- **Tradeoff:** {what improves or worsens across options}
- **Disagreement:** {where sources differ}
- **Current read:** {best interpretation}

## Recommendation by Scenario
| Scenario | Best Fit | Why |
|----------|----------|-----|
| {scenario} | {option} | {reason} |

## Gaps / Open Questions
- {unknown or follow-up question}
- {unknown or follow-up question}

## Novelty / Opportunity Signals
- {optional inferred opportunity; clearly label it as an inference}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### B. DOCX-Ready Comparison Report

```markdown
# DOCX-Ready Comparison Report: {option A} vs {option B} {vs option C}

**Motivation:** {why this comparison matters now}
**Decision question:** {question}
**Problem to solve / decision to support:** {practical decision}
**Criteria:** {criteria}
**Output mode:** docx-ready report
**Confidence:** {High / Medium / Low} - {brief reason}

## Executive Summary
{Top-level answer and scenario logic suitable for a formal report opening.}

## Background / Motivation
{Why this comparison is needed now and what decision it supports.}

## Scope and Comparison Criteria
- **Options compared:** {options}
- **Criteria:** {criteria}
- **Scope limits:** {what is excluded}

## Method / Evidence Basis
- **Source types used:** {source mix}
- **How options were judged:** {criteria, corroboration, recency}
- **Evidence limitations:** {limitations}

## At-a-Glance Comparison
| Option | Best For | Main Strengths | Main Limits | Overall Read |
|--------|----------|----------------|-------------|--------------|
| {option} | {scenario} | {strengths} | {limits} | {short verdict} |

## Detailed Comparison
### {criterion}
{detailed evidence-backed comparison with citations}

### {criterion}
{detailed evidence-backed comparison with citations}

## Tradeoffs / Disagreements
- **Tradeoff:** {tradeoff}
- **Reason for disagreement:** {why}
- **Current interpretation:** {best-supported read}

## Recommendation by Scenario
- **{scenario}:** {best fit} - {reason}
- **{scenario}:** {best fit} - {reason}

## Open Questions / Gaps
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### C. PPT-Ready Comparison Outline

```markdown
# PPT-Ready Comparison Outline: {option A} vs {option B} {vs option C}

**Audience:** {executive / technical / mixed}
**Decision objective:** {decision the deck should support}
**Motivation:** {why this comparison matters now}
**Problem to solve / decision to support:** {practical decision}
**Recommended deck length:** {N slides}
**Top-line verdict:** {short answer with scenario qualifier if needed}

## Storyline
- {what is being decided}
- {how the options differ}
- {recommended option or shortlist}

## Slide Outline
### Slide 1 - Decision framing
- **Core message:** {what is being compared and why}
- **Supporting points:**
  - {motivation}
  - {decision context}
- **Suggested visual:** comparison frame or decision tree
- **Source footer:** {citations}

### Slide 2 - Criteria and scope
- **Core message:** {how the options are being judged}
- **Supporting points:**
  - {criteria}
  - {scope}
- **Suggested visual:** comparison framework or score rubric
- **Source footer:** {citations}

### Slide 3 - At-a-glance comparison
- **Core message:** {main tradeoff summary}
- **Supporting points:**
  - {point}
  - {point}
- **Suggested visual:** comparison matrix or scorecard
- **Source footer:** {citations}

### Slide 4 - Criterion: {criterion}
- **Core message:** {winner / split verdict / uncertainty}
- **Supporting points:**
  - {point}
  - {point}
- **Suggested visual:** bar chart / benchmark table / architecture sketch
- **Source footer:** {citations}

### Slide 5 - Recommendation by scenario
- **Core message:** {which option fits which scenario}
- **Supporting points:**
  - {scenario -> option}
  - {scenario -> option}
- **Suggested visual:** decision matrix or scenario table
- **Source footer:** {citations}

## Risks / Uncertainty Slide
- {major uncertainty}
- {what should be validated next}
```

### D. Notebook Markdown

```markdown
# {option A} vs {option B} {vs option C}

> Motivation: {why this comparison matters now}
> Decision question: {question}
> Problem to solve / decision to support: {practical decision}
> Criteria: {criteria}
> Confidence: {High / Medium / Low} - {brief reason}

## TL;DR
- {main comparison conclusion}
- {best option by scenario}
- {main uncertainty}

## Method / Evidence Basis
- {source mix}
- {criteria and evaluation logic}
- {key limitation}

## Comparison Matrix
| Option | Best For | Key Strengths | Key Risks |
|--------|----------|---------------|-----------|
| {option} | {scenario} | {strengths} | {risks} |

## Criterion Notes
### {criterion}
- **{option}:** {assessment} {citations}
- **{option}:** {assessment} {citations}

### {criterion}
- **{option}:** {assessment} {citations}
- **{option}:** {assessment} {citations}

## Tradeoffs / Disagreements
- {tradeoff or disagreement}
- {tradeoff or disagreement}

## Recommendation by Scenario
- **{scenario}:** {best fit} - {reason}
- **{scenario}:** {best fit} - {reason}

## Open Questions
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

---

# 简体中文模板

## Feature 1：Thorough Research

### A. 标准研究报告

```markdown
# 研究报告：{topic}

**研究动机：** {为什么现在要研究这个问题}
**研究问题：** {main question}
**要解决的问题 / 支持的决策：** {decision、风险或机会}
**范围：** {scope、假设或本次采用的解释口径}
**输出模式：** 标准报告
**置信度：** {高 / 中 / 低} - {简短原因}

## 执行摘要
{用 1 段直接回答核心问题。说明哪些结论证据较强，哪些地方仍有不确定性，为什么这件事重要，以及建议采取什么行动。}

## 方法 / 证据基础
- **使用的来源类型：** {官网 / 论文 / 行业媒体 / 本地资料 / 上传文件 / 链接 / 必要时社交信号}
- **证据判断方式：** {权威性、时效性、交叉印证、偏差}
- **关键限制：** {最重要的证据限制}

## 关键发现
### 1. {theme 或 finding}
- **证据表明：** {finding}
- **这意味着：** {decision impact}
- **证据 / 引用：** {平台原生引用或 [1][2]}

### 2. {theme 或 finding}
- **证据表明：** {finding}
- **这意味着：** {decision impact}
- **证据 / 引用：** {citations}

## 来源质量评估
| 领域 | 置信度 | 原因 |
|------|--------|------|
| {area} | {高/中/低} | {权威性、时效性、交叉印证、偏差说明} |

## 分歧观点 / 不确定性
- **问题点：** {存在争议或尚不清楚的点}
- **为何会有差异：** {基准不同、时间窗口不同、假设不同、偏差或数据缺失}
- **当前判断：** {目前最稳妥的解读}

## 战略含义
- {对行动或决策的含义}
- {对行动或决策的含义}

## 建议 / 决策指引
- **建议方向：** {最有证据支持的行动或选择}
- **建议成立的条件：** {适用条件}
- **下一步需要验证：** {后续验证点}

## 研究缺口 / 下一步问题
- {未知点或后续问题}
- {未知点或后续问题}

## 新颖性 / 专利机会信号
- {可选的推断机会；必须明确标注为推断，不是既有事实}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### B. DOCX 正式报告

```markdown
# DOCX 正式研究报告：{topic}

**研究动机：** {为什么现在要研究这个问题}
**研究问题：** {main question}
**要解决的问题 / 支持的决策：** {decision、风险或机会}
**范围：** {scope、假设或本次采用的解释口径}
**输出模式：** docx-ready report
**置信度：** {高 / 中 / 低} - {简短原因}

## 执行摘要
{适合放在正式文档首页的高层结论。}

## 背景 / 研究动机
{说明为什么这个议题重要、这次研究的触发因素，以及为什么现在需要做这个决策。}

## 研究问题与目标
- **核心问题：** {main question}
- **子问题：** {optional}
- **本报告用途：** {决策、评审、规划或存档}

## 范围与假设
- **纳入范围：** {scope}
- **不纳入范围：** {explicit exclusions}
- **关键假设：** {important assumptions}

## 方法 / 证据基础
- **使用的来源类型：** {source mix}
- **评估维度：** {权威性、时效性、交叉印证、偏差}
- **证据限制：** {limitations}

## 研究发现
### {theme}
{带引用的发现与证据}

### {theme}
{带引用的发现与证据}

## 权衡 / 分歧观点
- **问题：** {disagreement}
- **分歧原因：** {why sources differ}
- **当前判断：** {best-supported read}

## 影响与启示
- {战略、技术、产品或运营层面的影响}
- {战略、技术、产品或运营层面的影响}

## 建议
- **建议动作：** {recommendation}
- **理由：** {why}
- **下一步：** {follow-up actions}

## 开放问题 / 研究缺口
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### C. PPT 精简大纲

```markdown
# PPT 精简研究大纲：{topic}

**受众：** {管理层 / 技术团队 / 混合}
**目标：** {这份 deck 需要帮助听众理解或决定什么}
**研究动机：** {为什么这个问题现在重要}
**要解决的问题 / 支持的决策：** {decision、风险或机会}
**建议页数：** {N slides}
**一句话核心结论：** {main answer}

## 叙事主线
- {开场信息}
- {中段关键信息}
- {收尾建议}

## 幻灯片大纲
### 第 1 页 - 标题与决策背景
- **核心信息：** {这项研究是什么，以及为什么是现在}
- **支持要点：**
  - {motivation}
  - {decision context}
- **建议视觉：** 标题页加决策框架
- **页脚来源：** {如需要可加 citations}

### 第 2 页 - 范围与方法
- **核心信息：** {分析了什么，以及怎么分析}
- **支持要点：**
  - {scope}
  - {evidence basis}
- **建议视觉：** 范围框图、来源结构或流程图
- **页脚来源：** {citations}

### 第 3 页 - {title}
- **核心信息：** {single takeaway}
- **支持要点：**
  - {point}
  - {point}
- **建议视觉：** {图表 / 时间线 / 对比表 / 流程图 / 市场地图 / 示意图}
- **页脚来源：** {citations}

### 第 4 页 - {title}
- **核心信息：** {single takeaway}
- **支持要点：**
  - {point}
  - {point}
- **建议视觉：** {visual}
- **页脚来源：** {citations}

### 第 5 页 - {title}
- **核心信息：** {single takeaway}
- **支持要点：**
  - {point}
  - {point}
- **建议视觉：** {visual}
- **页脚来源：** {citations}

## 风险 / 不确定性页
- {uncertainty}
- {什么信息会改变当前结论}

## 建议页
- **建议动作：** {recommendation}
- **为什么是现在：** {时机或战略原因}
- **下一步：** {practical follow-up}
```

### D. Notebook Markdown

```markdown
# {topic}

> 研究动机：{为什么这个问题现在重要}
> 研究问题：{main question}
> 要解决的问题 / 支持的决策：{decision、风险或机会}
> 范围：{scope 或假设}
> 置信度：{高 / 中 / 低} - {简短原因}

## TL;DR
- {核心结论}
- {第二个结论}
- {主要不确定性}

## 方法 / 证据基础
- {source mix}
- {how evidence was judged}
- {key limitation}

## 发现
### {theme}
- {finding}
- **证据：** {citations}

### {theme}
- {finding}
- **证据：** {citations}

## 来源质量说明
- {哪些部分最可靠，为什么}
- {哪些部分相对较弱，为什么}

## 分歧与未知点
- {conflict or unknown}
- {conflict or unknown}

## 影响与启示
- {actionable takeaway}
- {actionable takeaway}

## 建议
- {recommended direction}
- {what to validate next}

## 下一步问题
- {follow-up question}
- {follow-up question}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

## Feature 2：Multi-disciplinary Comparison Research

### A. 标准对比研究报告

```markdown
# 对比研究报告：{option A} vs {option B} {vs option C}

**研究动机：** {为什么现在要做这次对比}
**决策问题：** {这次对比要回答什么}
**要解决的问题 / 支持的决策：** {实际选择、风险或机会}
**比较维度：** {criteria used}
**输出模式：** 标准报告
**置信度：** {高 / 中 / 低} - {简短原因}

## 执行摘要
{用 1 段总结最大差异、各场景下更合适的选项、决策逻辑，以及当前最主要的不确定性。}

## 方法 / 证据基础
- **使用的来源类型：** {official / scholarly / trade / local docs / uploaded files / URLs}
- **评估方式：** {criteria and evaluation logic}
- **关键限制：** {main evidence constraint}

## 一眼看懂对比
| 选项 | 最适合 | 主要优势 | 主要限制 | 总体判断 |
|------|--------|----------|----------|----------|
| {option} | {scenario} | {strengths} | {limits} | {short verdict} |

## 按维度详细对比
### {criterion}
| 选项 | 基于证据的判断 | 引用 |
|------|----------------|------|
| {option} | {assessment} | {citations} |

### {criterion}
| 选项 | 基于证据的判断 | 引用 |
|------|----------------|------|
| {option} | {assessment} | {citations} |

## 权衡与分歧观点
- **关键权衡：** {一个方面提升时，另一个方面会变差的关系}
- **分歧点：** {来源不一致的地方}
- **当前判断：** {目前最稳妥的解释}

## 场景化建议
| 场景 | 最佳选择 | 原因 |
|------|----------|------|
| {scenario} | {option} | {reason} |

## 缺口 / 开放问题
- {unknown or follow-up question}
- {unknown or follow-up question}

## 新颖性 / 机会信号
- {可选的推断机会；必须明确标注为推断}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### B. DOCX 正式对比报告

```markdown
# DOCX 正式对比报告：{option A} vs {option B} {vs option C}

**研究动机：** {为什么现在要做这次对比}
**决策问题：** {question}
**要解决的问题 / 支持的决策：** {practical decision}
**比较维度：** {criteria}
**输出模式：** docx-ready report
**置信度：** {高 / 中 / 低} - {简短原因}

## 执行摘要
{适合正式文档开头的高层结论与场景逻辑。}

## 背景 / 研究动机
{为什么现在需要做这次对比，以及它支持什么决策。}

## 范围与比较维度
- **比较对象：** {options}
- **比较维度：** {criteria}
- **范围限制：** {what is excluded}

## 方法 / 证据基础
- **使用的来源类型：** {source mix}
- **评估逻辑：** {criteria, corroboration, recency}
- **证据限制：** {limitations}

## 一眼看懂对比
| 选项 | 最适合 | 主要优势 | 主要限制 | 总体判断 |
|------|--------|----------|----------|----------|
| {option} | {scenario} | {strengths} | {limits} | {short verdict} |

## 详细对比
### {criterion}
{带引用的详细对比}

### {criterion}
{带引用的详细对比}

## 权衡 / 分歧
- **关键权衡：** {tradeoff}
- **分歧原因：** {why}
- **当前判断：** {best-supported read}

## 场景化建议
- **{scenario}:** {best fit} - {reason}
- **{scenario}:** {best fit} - {reason}

## 开放问题 / 缺口
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```

### C. PPT 对比大纲

```markdown
# PPT 对比大纲：{option A} vs {option B} {vs option C}

**受众：** {管理层 / 技术团队 / 混合}
**决策目标：** {这份 deck 支持什么决策}
**研究动机：** {为什么这次对比现在重要}
**要解决的问题 / 支持的决策：** {实际决策}
**建议页数：** {N slides}
**顶层结论：** {简短结论；如需可加场景前提}

## 叙事主线
- {在比较什么，为什么要比较}
- {这些选项最主要的差异是什么}
- {推荐方案或 shortlist 是什么}

## 幻灯片大纲
### 第 1 页 - 决策框架
- **核心信息：** {在比较什么，以及为什么}
- **支持要点：**
  - {motivation}
  - {decision context}
- **建议视觉：** 对比框架或决策树
- **页脚来源：** {citations}

### 第 2 页 - 维度与范围
- **核心信息：** {用什么维度比较，以及比较边界}
- **支持要点：**
  - {criteria}
  - {scope}
- **建议视觉：** 对比框架或评分逻辑图
- **页脚来源：** {citations}

### 第 3 页 - 总览对比
- **核心信息：** {核心权衡总结}
- **支持要点：**
  - {point}
  - {point}
- **建议视觉：** 对比矩阵或评分卡
- **页脚来源：** {citations}

### 第 4 页 - 维度：{criterion}
- **核心信息：** {胜出者 / 分场景结论 / 暂无定论}
- **支持要点：**
  - {point}
  - {point}
- **建议视觉：** 柱状图 / 基准表 / 架构图
- **页脚来源：** {citations}

### 第 5 页 - 场景化建议
- **核心信息：** {不同场景下选什么}
- **支持要点：**
  - {scenario -> option}
  - {scenario -> option}
- **建议视觉：** 决策矩阵或场景表
- **页脚来源：** {citations}

## 风险 / 不确定性页
- {major uncertainty}
- {what should be validated next}
```

### D. Notebook Markdown

```markdown
# {option A} vs {option B} {vs option C}

> 研究动机：{为什么这次对比现在重要}
> 决策问题：{question}
> 要解决的问题 / 支持的决策：{practical decision}
> 比较维度：{criteria}
> 置信度：{高 / 中 / 低} - {简短原因}

## TL;DR
- {main comparison conclusion}
- {best option by scenario}
- {main uncertainty}

## 方法 / 证据基础
- {source mix}
- {criteria and evaluation logic}
- {key limitation}

## 对比矩阵
| 选项 | 最适合 | 关键优势 | 关键风险 |
|------|--------|----------|----------|
| {option} | {scenario} | {strengths} | {risks} |

## 分维度笔记
### {criterion}
- **{option}:** {assessment} {citations}
- **{option}:** {assessment} {citations}

### {criterion}
- **{option}:** {assessment} {citations}
- **{option}:** {assessment} {citations}

## 权衡 / 分歧
- {tradeoff or disagreement}
- {tradeoff or disagreement}

## 场景化建议
- **{scenario}:** {best fit} - {reason}
- **{scenario}:** {best fit} - {reason}

## 开放问题
- {unknown}
- {unknown}

## Sources
1. {title, publisher/author, date, link}
2. {title, publisher/author, date, link}
```
