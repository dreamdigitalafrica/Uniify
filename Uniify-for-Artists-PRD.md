# Uniify for Artists Product Requirements Document

Version 1.1 · 20 November 2026 · Product discovery and implementation specification

## 1. Product decision

Uniify for Artists should help independent musicians turn career uncertainty into a practical plan they can act on and maintain. The first production release should deliver a dependable cycle of **profile → release → adaptive roadmap → action → Career Progress**. Services, professional connections, and opportunities should follow once the core planning product demonstrates repeat use.

The reviewed website positions Uniify as accessible career management without requiring a traditional management deal. Its strongest opportunity is to make the next useful action clear for an artist with limited time, money, and industry knowledge. A workspace that records tasks is only part of that proposition: the product must explain why a task matters, make it achievable, and help the artist review the result.

This document covers the observed website and workspace, copy and positioning, proposed business model, complete feature scope, screen requirements, data and integration requirements, acceptance criteria, measurement, delivery phases, and decisions required before launch.

**Status convention throughout this document**

- **Observed** means visible in the reviewed site or verified through its interface.
- **Advertised** means described in site copy but not demonstrated as a complete working feature.
- **Proposed** means a requirement or business recommendation for a production product, not a claim about what exists today.
- **Open** means an owner must decide or validate it before implementation or launch.

Unless explicitly marked Observed or Advertised, requirements below are Proposed. This PRD is not evidence of an existing commercial service, production backend, validated demand, or approved pricing.

## Release-led MVP specification — 20 November 2026

This revision supersedes earlier assessment-first sequencing and progress-only dashboard requirements below. The browser-local iteration implements the following hierarchy using Creovibe’s existing visual language. Production authentication, cloud storage and external integrations remain separate work.

### Navigation and release creation

Navigation: Overview → Artist profile → Career foundations → Releases → Roadmap → Career Progress → Budget → Resources → Settings. Saving a profile leads to Releases. Foundations are optional supporting context and never gate release creation. Each release records a goal, type, target date, budget and status, with linked milestones and tasks. Creating a release generates five stable, dependent phase actions: preparation, production, delivery, promotion and review. Multiple releases coexist; general career tasks remain independent unless assigned to a release. Actual delivery is recorded with an explicit date, separately from the target date and task completion.

### Adaptive roadmap rules

Show all projects, one release, or general career work. Phase offsets are initially −42, −28, −14, −7 and +14 days relative to the target release date. Suggested effort is 90, 180, 90, 120 and 45 minutes respectively; artists can edit effort. Schedule unfinished work in dependency order, no earlier than today. Weekly availability uses the conservative lower bound of the chosen band (60, 240, 480 or 960 minutes); unspecified availability uses 180 minutes. Capacity uses seven-day windows starting at recalculation time, shared across releases and general tasks. Manual dates reserve capacity before automatic tasks. Oversized tasks and dates beyond the release target generate visible warnings; the MVP does not split an oversized task into sessions.

Completing, reopening or deferring a task, changing a release, or changing availability recalculates suggested dates and priorities. Prerequisites determine recommended next actions. Artists can record work actually completed out of sequence. Completed work, notes, deferred choices and manual dates remain intact. Release dates never move automatically. “What changed and why” lists scheduling revisions and provides undo for still-applicable automatic dates/order; undo keeps the triggering edit and completed work. The next scheduling trigger may recalculate again. These are deterministic planning rules, not an agent performing career activities.

### Career Progress

Calendar-quarter, calendar-year, all-time and custom-date reports combine dated task transitions, milestone completions, actual releases, assessment snapshots and financial records. Artists manually add/edit gigs, collaborations, networking, learning, audience engagement and other activities with date, category, description, outcome and optional release association. Provide a career timeline, engagement breakdown, releases delivered, achieved milestones and monthly financial totals. Quarter/year cards compare with the preceding complete quarter/year; current partial periods are explicitly labelled.

Count distinct task or milestone achievements per period; reopening retains historical completion events. Finishing tasks never implies audience growth or revenue. Audience observations retain source, metric/unit, value and measurement start/end, selected by period end; different series are never summed and absent observations remain unknown. Financial totals use dated income/expense records with integer-cent accumulation. Activity edits affect their actual reporting period. Undated legacy descriptions remain visible separately without invented outcomes or timestamps.

### Data, migration and export

Schema version 3 continues using the existing browser-local storage key for compatibility. Tasks add releaseId, dependencies, effort, suggestedDate, dateMode and order. Releases retain old milestones and add a goal and optional actual delivery date. Retain structured events, scheduling revisions, career activities and observations without a 20-record limit. Existing tasks become general career work; existing nonempty dates become manual/protected. Existing releases receive idempotent phase tasks, with no fabricated historical completion. JSON export includes the entire state and all relationships/history. Browser-local persistence is device-specific, not an account or cloud backup.

### Validation and launch gate

Automated Node tests cover generation, idempotency, simultaneous releases, dependency unlocking/reopening, deferred work, manual-date protection, capacity conflicts, migration preservation, date boundaries, partial/custom reporting, activity edits, source-separated observations, financial totals and workspace form rendering/persistence. Browser-based responsive, keyboard and visual checks remain a required QA step when browser access is available. The existing publishing-access issue must be resolved before deployment; do not replace the project identifier to bypass it.

## 2. Review coverage and evidence

### 2.1 Sources

The review used the live interface on 18 November 2026, including all navigation destinations discoverable from the supplied page, the three workspace tabs, demo form submissions, scoring scenarios, task completion, reload persistence, and a downloaded demo export.

| Reference | Source | Coverage |
| --- | --- | --- |
| S1 | [Home](https://uniify-for-artists.vercel.app/home.html#home) | Hero, audience statement, illustrative dashboard, entry CTAs, footer |
| S2 | [Features](https://uniify-for-artists.vercel.app/home.html#features) | Six feature propositions |
| S3 | [How it works](https://uniify-for-artists.vercel.app/home.html#how) | Understand, assess, plan, grow journey |
| S4 | [Our vision](https://uniify-for-artists.vercel.app/home.html#vision) | Accessible career management and future ecosystem |
| S5 | Workspace opened from [Home](https://uniify-for-artists.vercel.app/home.html) | Profile, Assessment, Dashboard; these are panels, not separate linked URLs |
| S6 | Demo JSON export from Dashboard | Profile, assessment answer keys, and stable completion key |
| S7 | [Site root](https://uniify-for-artists.vercel.app/) | Resolved to the same home page |

The discoverable site is one public document with anchored sections and a three-panel workspace. No separate pricing, login, support, terms, privacy, marketplace, or release-detail page was linked in the reviewed navigation. Unlinked routes, private interfaces, backend code, and external integrations were not inspected. “All pages” here means the complete discoverable public experience, not a guarantee that no unpublished routes exist.

### 2.2 Observed information architecture

```text
Public home document
├── Home and example dashboard
├── Features
├── How it works
├── Our vision
├── Final invitation to open workspace
└── Prototype and brand-status footer

Artist workspace
├── Profile → save and continue to Assessment
├── Assessment → save and view Dashboard
├── Dashboard
│   ├── Profile summary
│   ├── Foundations readiness
│   ├── Suggested task checklist
│   └── Progress, export, local deletion control
└── Return to website
```

### 2.3 Screen by screen audit

| Surface | Observed content and controls | Product implication |
| --- | --- | --- |
| Header | Brand link; Features, How it works, Our vision; entry CTA | Simple acquisition path, but no account or commercial navigation |
| Hero | Four-part promise covering understanding, management, discovery, and growth; primary CTA and explanation link | Clear ambition, but discovery sounds more available than the future-opportunities feature actually is |
| Example dashboard | Static readiness 62/100, progress 4/10, release-strategy suggestion, explicit illustrative label | A product preview, not live user data or proof of outcomes |
| Features | Assessment, personalised roadmap, workspace, progress, future opportunities, self-directed growth | A useful roadmap of promises; not all are implemented to the same depth |
| How it works | Four steps from background to assessment, plan, and progress | Strong foundation for onboarding and lifecycle design |
| Vision | Career management accessible across stages without a traditional management deal | Positions the product as artist-controlled support; commercial terms remain unspecified |
| Final CTA | Invitation to create a preliminary profile and enter workspace | Honest prototype framing, but multiple different entry CTA labels add unnecessary variation |
| Footer | 2026 copyright, concept-prototype status, brand availability and trademark checks pending | Brand and launch readiness remain open |
| Profile | Nine fields and save/continue action | Captures relevant constraints, although default selections can look like deliberate user answers |
| Assessment | Six questions, five answer states, save/view roadmap | Foundations self-check; not a talent evaluation or industry-certified assessment |
| Dashboard | Profile summary, readiness, recommended checkboxes, completion count | Demonstrates a small rules-based task loop rather than full release or career project management |
| Data controls | Export button and local deletion button; local-storage notice | Export verified; destructive deletion not exercised |

### 2.4 Observed profile schema

| Field | Current choices or type | Current default / observed constraint |
| --- | --- | --- |
| Artist name | Text | Required; empty submission blocked by browser validation |
| Primary role | Recording artist; Producer; Songwriter; Artist and producer; Other | Recording artist |
| Career stage | Just starting; Released music, building an audience; Growing my career; Established independent artist | Just starting; explicitly self-reported |
| Primary goal | Release my first music; Grow my audience; Earn more from music; Improve career management; Find collaborators and opportunities | Release my first music |
| Biggest challenge | Knowing what to do next; Budget and resources; Marketing and audience growth; Managing releases and tasks; Industry connections | Knowing what to do next |
| Monthly music budget | Number, labelled in pounds | 0; minimum 0 |
| Hours available each week | 1–3; 4–7; 8–15; 16+ hours | 1–3 hours |
| Released tracks | Number | 0; minimum 0 |
| Twelve-month success vision | Free text | Empty; optional in inspected form |

### 2.5 Observed assessment and recommendations

Every question offers Yes, Partly / working on it, Not yet, Not applicable, and Not answered. The question topics and associated actions are summarised below; wording is paraphrased.

| Topic | Practice assessed | Action generated for a gap |
| --- | --- | --- |
| Release planning | A documented next-release plan exists | Build a six-week release checklist |
| Rights | Ownership and collaborator records are maintained | Record rights and collaboration agreements |
| Branding | Artist profiles and visual identity are consistent | Review biography and platform branding |
| Audience | Audience performance is reviewed regularly | Select a monthly audience metric |
| Finances | Music expenditure and income are tracked | Create a simple budget and income record |
| Goals | Career goals are measurable | Define a measurable 30-day goal |

### 2.6 Behaviour verified

| Test | Observed result | Interpretation and limit |
| --- | --- | --- |
| Open dashboard with no saved profile or assessment | Placeholder profile, no assessment score, one generic goal-review task | Empty state exists; assessment is not required before viewing dashboard |
| Submit empty artist name | Browser required-field message | Basic native validation exists |
| Save synthetic profile | Assessment panel opened | Onboarding transition works |
| All six answers Not yet | 0/100; six tasks | Gap-to-task mapping demonstrated |
| Mixed answers: Yes, Partly, Not yet, N/A, unanswered, Yes | 63/100; rights and branding tasks | Consistent with equal weighting, Yes=1, Partly=0.5, Not yet=0, excluding N/A and unanswered, rounded to nearest integer; exact implementation not inspected |
| All six answers Yes | 100/100; one generic goal-review task | High-score state still proposes an action |
| All six answers N/A | No score; one generic goal-review task | No applicable evidence is not shown as failure |
| Complete release task | Count changed from 0/6 to 1/6; score remained 0/100 | Task completion and self-reported readiness are separate measures |
| Reload and reopen workspace | Profile, answers, and completed release task remained | Same-browser persistence verified; no evidence of cross-device sync |
| Change answers so release task disappears | Current completion count reflected only visible tasks | Current roadmap progress can change when recommendations change |
| Export after task disappeared | JSON retained `release-task: true` | Completion history survives at least this transition in exported data |
| Click export | JSON file downloaded with profile, assessment, completed objects | Export demonstrated; restore/import not present |

Profile-based changes to roadmap ranking were not exhaustively tested. The inspected examples demonstrate answer-driven recommendations; they do not establish personalisation by every collected field, budget feasibility, AI generation, or professional review.

## 3. Product purpose and audience

### 3.1 Problem

An independent artist may have ambitions and creative work but no structured method for deciding what matters next, sequencing career work, or assessing whether time and money are being used effectively. Release planning, audience work, records, and administration can become disconnected activities. Uniify should make these activities understandable and manageable within the artist’s real constraints.

This is a problem hypothesis inferred from the site’s proposition. Research must establish its frequency, urgency, and willingness to pay; the website alone does not validate the market.

### 3.2 Audience and jobs

The website addresses aspiring, emerging, growing, and established independent artists. For the first release, prioritise aspiring and emerging artists who manage their own work and need a repeatable planning process. Established artists remain a supported profile stage, but team permissions and complex portfolios can follow later.

| Persona | Job to be done | Desired outcome | Initial priority |
| --- | --- | --- | --- |
| Aspiring artist | Understand what must be in place before a first release | A manageable first plan without specialist vocabulary | Primary |
| Emerging independent artist | Coordinate releases, audience work, and administration | Reliable weekly action and fewer missed steps | Primary |
| Growing independent artist | Decide where to focus scarce resources | Priorities tied to measurable goals and constraints | Secondary |
| Established independent artist | Coordinate ongoing career activities | Deeper projects, history, and eventually collaborators | Later depth |
| Producer or songwriter | Apply career guidance to a non-performing role | Relevant questions and recommendations | Supported, role-specific content needed |
| Professional or opportunity provider | Reach relevant artists and deliver services | Qualified, consent-based matches | Future ecosystem |
| Product operator | Maintain trustworthy guidance and service quality | Versioned content, operational oversight, measurable outcomes | Internal |

### 3.3 Product principles

1. Preserve artist agency: recommendations are explainable, editable, and dismissible.
2. Make the next action achievable: account for time, budget, stage, and dependencies.
3. Keep missing information distinct from a negative answer.
4. Measure practices and progress without scoring artistic worth or predicting fame.
5. Separate product guidance, commercial placement, and professional services.
6. Preserve work when profiles, assessments, plans, or subscriptions change.
7. Make actual availability clear at the point where a feature is promised.

### 3.4 Goals and exclusions

The MVP should get an artist from first visit to a saved plan, support useful weekly action, explain the basis of recommendations, retain progress reliably, and establish whether users return because the guidance helps them.

Initial exclusions: music distribution, streaming playback, royalty collection, rights registration, contract execution, automated investment advice, guaranteed placement or income, autonomous outreach, a full accounting system, an open services marketplace, and replacement of a human manager. None was demonstrated in the reviewed site.

## 4. Business model

### 4.1 What the site establishes

**Observed:** Uniify is a concept prototype with local data storage. No pricing, payment collection, subscription entitlement, commission schedule, or management agreement was visible. The currency field uses pounds, but this alone does not establish a launch country or legal jurisdiction.

**Inferred positioning:** artist-directed career management software, potentially expanding into a network of services and opportunities. The website’s independence proposition suggests that the core software should be useful without an exclusive management relationship.

**Recommended commercial direction:** validate a direct-to-artist subscription product before building a transaction marketplace. Use a useful free entry experience to demonstrate the assessment-to-action loop; charge for sustained planning value when retention supports it.

### 4.2 Proposed business model canvas

| Element | Proposal | Evidence or validation required |
| --- | --- | --- |
| Customers | Initially self-managing aspiring and emerging artists | Interviews across roles, stages, and budgets |
| Value | Clear next steps, practical execution support, visible progress | Task usefulness feedback and repeat usage |
| Acquisition | Artist communities, educational content, workshops, creator referrals, music education partners | Channel conversion and acquisition cost |
| Relationship | Self-service onboarding, useful reminders, contextual education, support | Support demand and activation barriers |
| Core revenue | Subscription for ongoing planning depth and history | Willingness-to-pay tests and paid retention |
| Later revenue | Optional paid expert sessions, disclosed service commissions, institution seat licensing | Delivery capacity, trust, and segment-specific demand |
| Key activities | Guidance editorial work, product engineering, recommendation quality, support | Cost per active artist and content review cadence |
| Resources | Task library, assessment framework, artist profile and progress data, product team | Data quality and content ownership |
| Partners | Educators, artist organisations, vetted professionals; integration providers later | Explicit agreements and reliable supply |
| Costs | Hosting, authentication, content production, support, payments, acquisition; optional AI and partner operations | Actual costs measured in pilot |

### 4.3 Proposed packaging

| Tier | Candidate entitlement | Purpose |
| --- | --- | --- |
| Free | Profile, foundations assessment, one active roadmap, basic checklist and progress, data controls | Demonstrate value and reduce entry friction |
| Artist Pro | Multiple active plans or releases, richer templates, reassessment history, reminders, deeper progress review | Monetise recurring workflow value |
| Expert support | Separately priced sessions or defined services with transparent deliverables | Human help when self-service is insufficient |
| Organisation | Artist seats, consent-based programme views, cohort tools | Later B2B revenue, separate permission model |

These are hypotheses, not current plans or entitlements. Do not publish invented prices. Validate the free/paid boundary with artists before implementation. Data export, account closure, and access to essential records must not become coercive upgrade mechanisms.

If a subscription is introduced, the pricing page must state currency, billing interval, taxes or applicable presentation, included limits, renewal behaviour, cancellation timing, and downgrade consequences. No checkout should exist until these decisions are approved.

### 4.4 Commercial tests and economics

Start with interviews and a guided beta. Test whether artists understand their plan, carry out a useful action, and return voluntarily. Then test willingness to pay for specific recurring benefits. Keep commercial experiments separate from fabricated testimonials, user counts, or outcome claims.

Track the following using actual cohorts:

- Monthly recurring revenue: sum of active recurring subscription value normalised to a month, excluding one-off sales.
- Paid conversion: eligible activated free artists becoming paying artists within a declared observation window.
- Revenue churn: recurring revenue lost to cancellation and contraction divided by starting recurring revenue.
- Gross margin: recognised revenue less directly attributable service costs, divided by revenue.
- Acquisition cost: attributable acquisition spend divided by newly acquired paying customers for the same cohort and window.
- Payback: acquisition cost divided by monthly gross profit per acquired customer; only use when cohort data is sufficiently stable.
- Later marketplace net revenue: completed eligible transaction value multiplied by the disclosed fee, adjusted for refunds and reversals. Transaction value is not platform revenue.

No forecast, market size, or unit-economics estimate is asserted here. Required inputs include target geography, price, channel spend, retention, support load, payment costs, and any AI usage costs.

## 5. Feature inventory and release scope

P0 is required for the first production pilot. P1 adds depth after the core loop works. P2 is the later ecosystem. Conditional features ship only when their commercial or operational dependencies are approved.

| ID | Capability | Current evidence | Production scope |
| --- | --- | --- | --- |
| F01 | Marketing pages and CTA funnel | Observed | P0 |
| F02 | Secure account and session lifecycle | Explicitly absent in prototype | P0 |
| F03 | Artist profile and constraints | Observed local form | P0 |
| F04 | Foundations assessment | Observed six-question form | P0 |
| F05 | Score explanation and assessment history | Score observed; history absent | P0 explanation; P1 history comparisons |
| F06 | Rules-based recommendations | Observed simple gap mapping | P0 with reasons and constraints |
| F07 | Roadmap and task management | Observed completion checkboxes | P0 task detail and stable state |
| F08 | Dashboard and progress review | Observed basic summary | P0 |
| F09 | Release projects and milestones | Advertised; no dedicated workflow seen | P1, or move into P0 if launch copy promises it |
| F10 | Goals and periodic check-ins | Profile goal and goal task observed | P0 basic goal; P1 richer review |
| F11 | Budget and income workspace | Budget input and recommendation observed | P1 manual planning and records |
| F12 | Rights and collaborator record workspace | Assessment topic and task observed | P1 structured records |
| F13 | Branding and learning resources | Assessment topic and task observed | P0 task guidance; P1 resource library |
| F14 | Audience metrics | Assessment topic and task observed | P1 manual metrics; P2 integrations |
| F15 | Notifications and reminders | Not observed | P1 opt-in |
| F16 | Export, deletion, privacy settings | Local controls observed; export verified | P0 production equivalent |
| F17 | Admin content, rules, and support tooling | Not observed | P0 minimum operational tools |
| F18 | Analytics and feedback | Not observed | P0 privacy-conscious instrumentation |
| F19 | Billing and subscription entitlements | Not observed | Conditional P1 commercial release |
| F20 | Opportunity discovery | Explicit future vision | P2 curated discovery |
| F21 | Professional and collaborator discovery | Explicit future vision | P2 with verification and reporting |
| F22 | Service booking and payments | Not observed; extension proposal | P2 only after service-model validation |
| F23 | Team and organisation accounts | Not observed; extension proposal | P2 |
| F24 | AI assistance | Intelligent positioning; rules disclosed | Optional P2; not an MVP dependency |
| F25 | External platform connections | Explicitly unconnected | P2 after provider feasibility checks |

## 6. Functional requirements and acceptance criteria

### F01 Marketing and acquisition

The public site must state who the product serves, what the current release does, how it works, and what the first action requires. Use one primary entry CTA consistently. Label example data and future features where they appear. Provide accessible navigation, support contact, and published privacy and service information before production accounts open.

**Acceptance:** every CTA opens the intended entry flow; return navigation preserves saved work; no sample metric appears as user data; every advertised available feature has a working destination; future features are clearly marked; mobile navigation and keyboard navigation work.

### F02 Accounts and sessions

Support account creation, sign-in, sign-out, account recovery appropriate to the chosen authentication method, session expiry, and private ownership of artist data. Start with one artist profile per account; the data model may allow later team ownership. If using email links, handle expired, already-used, and invalid links clearly.

**Acceptance:** one account cannot retrieve or mutate another artist’s data; expired sessions require reauthentication; returning on another supported device retrieves saved work; failed saves remain recoverable; authentication events do not leak credentials into analytics or logs. Auth provider and method are Open.

### F03 Artist profile

Retain the nine observed fields. Add explicit currency selection for any multi-market launch and an optional timezone for scheduling. Require artist name and deliberate selection of primary goal before generating a tailored plan. Let users skip nonessential questions; distinguish unknown budget from a budget of zero. Retain self-reported stage rather than deriving it from the score.

Validate trimmed names, nonnegative numeric values, integral track counts, declared field-length limits, and permitted enums on the server. Let users edit their profile at any time. Explain how each constraint affects the plan. An edited profile should propose a plan refresh rather than silently deleting tasks.

**Acceptance:** zero budget produces accessible no-cost starting actions; blank budget is not converted to zero; invalid numeric values receive field-specific errors; saved values survive navigation and a new session; role-specific language supports producers and songwriters; changed answers do not overwrite completed work.

### F04 and F05 Assessment and interpretation

Begin with the six observed domains and five answer states. Provide a short example of what qualifies as Yes or Partly for each question. Save drafts and allow edits. Record question-set version and submission time. Display a per-domain result, overall foundations score when applicable, and evidence coverage alongside it.

**Proposed scoring contract:** Yes=1, Partly=0.5, Not yet=0; exclude unanswered and N/A from the denominator. Score is `round(100 × sum(answer values) / number of scored answers)`. If the denominator is zero, display Not assessed. This matches the observed test cases but remains a proposed explicit production contract.

Display counts of scored, unanswered, and N/A questions. A score based on one answer must not look as comprehensive as a score based on six. Explain that it represents reported practices, not musical quality, career stage, professional certification, or predicted commercial success. Do not use unvalidated score bands such as industry-ready.

**Acceptance:** all Yes yields 100; all Partly yields 50; all Not yet yields 0; all unanswered or N/A yields no numeric score; the tested mixed case yields 63 with four scored answers, one unanswered, and one N/A. Completing a task does not automatically change assessment answers. Reassessment history retains the version used; comparisons disclose incompatible question changes.

### F06 Recommendation engine

Use a transparent rules system first. Every recommendation must carry a stable ID, source assessment domain, reason, expected outcome, action steps, estimated effort, optional cost range and currency, relevant goal, prerequisites, and content version. Differentiate actual estimates from unknown values.

For each Partly or Not yet answer, consider the associated task template. Filter by relevance to role and goal, then offer tasks feasible within the user’s stated resources. Use prerequisite order before optional commercial suggestions. Unknown time or budget should trigger clarification or low-commitment options, not fabricated precision. Unanswered questions should prompt completion, not automatically create a failure task. N/A should suppress the domain task while remaining editable.

Allow users to accept, defer, dismiss with an optional reason, or replace recommendations. When all foundations are complete, offer goal review and maintenance; do not imply that there is nothing left to develop. When no evidence exists, offer a clearly generic starting action and encourage assessment completion.

**Acceptance:** identical versioned inputs yield reproducible rules-based results; every task explains why it was selected; a zero-budget artist is not blocked behind paid services; refreshing the plan does not duplicate task IDs or reset completion; any provider sponsorship is disclosed and cannot silently determine readiness or priority. Detailed ranking weights require editorial approval before build.

### F07 Roadmap and tasks

Present an ordered current plan with a small next-action view and access to the complete list. Task detail includes a practical description, completion checklist, resources, estimated effort, optional target date, notes, and linked goal. MVP task states are To do, In progress, Done, and Deferred. Permit reopening a completed task and adding a personal task.

Store completion independently from currently visible recommendations. When a rule or profile change removes a task, archive its association to that plan instead of losing history. Show the user what changed when regenerating a plan. Keep previous plan versions recoverable for review.

**Acceptance:** task actions persist and are reversible; reopening updates counts accurately; archived tasks retain completion history; plan refresh is idempotent; dates display in the artist’s timezone; blocked prerequisites are visible; an empty list offers a useful next step.

### F08 and F10 Dashboard and review

Show the artist name, self-reported stage, primary goal, next useful action, assessment coverage and date, current-plan progress, and a review prompt. Keep readiness distinct from task completion. Explain the denominator when progress changes because a plan changes. Provide links to edit profile, reassess, and review completed work.

Let the artist express a goal as an outcome with a target date and optional measure. Do not invent a target from an aspiration. A periodic check-in should ask what was completed, what changed, and whether the plan remains realistic.

**Acceptance:** dashboard counts match persisted task states; stale assessment information is dated; generic recommendations are labelled; missing data has constructive empty states; no positive career outcome is inferred merely from a checked box. An artist can revise a goal without erasing previous goal history.

### F09 Release projects and milestones

Provide a release workspace with title, type, planned release date, status, goal, linked tasks, milestones, budget reference, and notes. A template can suggest preparation, delivery coordination, marketing preparation, release activity, and post-release review. A six-week example is a starting template, not a mandatory industry timetable.

**Acceptance:** create, edit, archive, and review a project; changing a release date previews affected task dates before acceptance; overdue tasks remain visible; dependencies and incomplete preparation are clear; external distribution is a link or checklist item unless a real integration exists. Do not describe the product as distributing music.

### F11 Budget and income records

Provide manual planned and actual expenses, manual income entries, category, amount, currency, date, and optional project association. Summarise remaining planned budget without implying available bank funds. Preserve the distinction between monthly capacity and a release-project budget.

**Acceptance:** decimal money handling is accurate; totals never silently mix currencies; imported or converted currency values require source and date; deleting or correcting an entry updates totals; no bank connection or royalty collection is implied. Formal accounting and tax reporting are out of scope.

### F12 Rights and collaborator records

Provide structured records for works or recordings, participant names, roles, declared ownership information, agreement status, and references. MVP guidance can begin with a checklist; file upload is a separate feature requiring storage and access controls. Any later share totals are arithmetic checks, not verification of legal ownership.

**Acceptance:** records are private by default; collaborators are not contacted automatically; incomplete agreements can be flagged; edits are attributable; users can export their records. The product must not present data entry as registering or certifying rights.

### F13 Resources and branding guidance

Attach concise educational material and templates to tasks, including release planning, biography and branding review, record keeping, and measurable goals. Each resource has an owner, review date, relevance tags, and availability status. Avoid a large disconnected library in the MVP.

**Acceptance:** every launch task has enough guidance to begin; resources open successfully; outdated material can be withdrawn; example assets are labelled; resource discovery supports role and domain filters when a standalone library is added.

### F14 Audience measurement

Begin with manual metric selection and dated entries, including platform/source, metric name, value, and measurement window. Show changes only across comparable periods and definitions. Later integrations must state provider freshness and connection status.

**Acceptance:** missing measurements are not zero; mismatched time windows are not combined; source and update date remain visible; a disconnected provider cannot display stale data as live; audience numbers do not directly determine foundations readiness.

### F15 Reminders

Offer opt-in task and review reminders with chosen channel, timezone, frequency, and unsubscribe controls. Avoid repeated notifications for completed or archived tasks. Keep reminders respectful when a task is overdue.

**Acceptance:** disabled reminders stop; duplicate jobs do not duplicate delivery; time changes respect timezone; failures are observable; completion cancels pending reminders when feasible. Delivery-channel provider remains Open.

### F16 Data ownership and privacy controls

Provide export of profile, assessments, plans, tasks, and progress in documented machine-readable form, with human-readable summaries if needed. Include schema version, timestamps, and currency. Explain data retention and account deletion scope. Production deletion must address active data, scheduled messages, provider connections, and retention exceptions under the approved policy.

**Acceptance:** an artist exports only their own data; exports remain usable after account closure; deletion is clearly confirmed and has a visible status; the application does not promise instant removal from backups if that is untrue; prototype migration previews fields before importing and validates local data as untrusted input.

### F17 Admin and support

Provide restricted tools for maintaining question versions, task templates, rules, resources, support cases, and feature availability. Separate draft, reviewed, and published content. Require an audit trail for rule publication and privileged data access. Support staff should see only the information required for their work.

**Acceptance:** editors can preview recommendations for synthetic profiles; publishing requires valid content and records the operator/version; rollback is possible; support access is permission checked; customer exports and account actions cannot be triggered by unauthorised staff.

### F18 Analytics and feedback

Instrument key lifecycle events with pseudonymous identifiers and content versions. Ask whether a recommendation was useful and achievable, with an optional reason. Do not send artist free-text aspirations, rights documents, or detailed financial records into general product analytics.

**Acceptance:** repeated submissions do not double-count a conversion; completion and reopening are distinguishable; events have a defined schema; consent choices apply where required; feedback links to the recommendation version for improvement.

### F19 Subscription and billing

Only build after price and entitlements are approved. Support plan comparison, checkout, payment status, receipts, renewal, cancellation, failure recovery, and downgrade. Entitlement checks must happen on the server. Preserve records when a customer downgrades; limit additional premium actions according to published terms.

**Acceptance:** a verified payment-provider event, not a browser success redirect, activates paid access; repeated events are idempotent; failed renewal has an explicit state; cancellation states when access ends; refund and dispute handling have owners; prices and fees match checkout.

### F20 and F21 Opportunities and professional discovery

Start with curated, attributable listings rather than an unmoderated marketplace. Opportunity fields include title, provider, category, location/remote availability, eligibility, relevant roles/stages, deadline and timezone, cost, source, and verification/review status. Support filtering, saving, dismissal, reporting, and application links. Explain matches using profile attributes, not hidden paid ranking.

Professional profiles can include service categories, location, portfolio links, availability, pricing basis, and the meaning of any verification badge. Keep paid placement visually distinct. Artists must choose whether to share their profile or contact a provider.

**Acceptance:** expired listings are labelled or removed from active results; eligibility is visible; promoted listings are disclosed; abuse reports enter a moderation queue; contact information is not shared without an explicit artist action; a match is not represented as acceptance or guaranteed work.

### F22 and F23 Transactions and teams

Service transactions are conditional on defining booking terms, deliverables, cancellation, refunds, disputes, identity checks, and platform responsibility. Team features require invitations, roles, revocation, and artist-controlled visibility. Organisation reporting must use explicit artist consent and a separate access model.

**Acceptance:** service scope and total price are confirmed before payment; payment and fulfilment states reconcile; revoked members lose access; invitations cannot grant greater permission than the inviter holds; organisation views reveal only authorised artists and fields. These capabilities are not prerequisites for the first pilot.

### F24 and F25 AI and integrations

An optional assistant may explain approved guidance or help draft a plan, but its output must stay subordinate to the artist’s decisions and the product’s constraints. Avoid unsupported claims about funding, legal rights, audience outcomes, or provider eligibility. Any generated output must be distinguishable from verified platform facts.

External connections require explicit provider feasibility checks, scoped consent, secure credential storage, refresh/revocation handling, rate-limit behaviour, and data-provenance records. No integration vendor or API availability is assumed by this PRD.

**Acceptance:** the core roadmap works without AI; users can review and reject generated changes; unavailable services have usable fallback states; disconnecting stops future synchronisation; account credentials and tokens never appear in analytics; assistant usage cannot silently create payments, send messages, or publish content.

## 7. Production screens and journeys

### 7.1 Proposed screen inventory

| Screen | Required content | Main action | Key alternative states |
| --- | --- | --- | --- |
| Home | Proposition, audience, available features, process, illustrative preview | Start assessment | Returning artist; future-feature labelling |
| Access | Sign-in/create account and recovery | Continue securely | Invalid/expired link; network failure |
| Onboarding | Profile, goal, optional constraints | Save and assess | Draft; skipped fields; validation errors |
| Assessment | Questions, definitions, completion coverage | View results | Draft; N/A; no answers; save failure |
| Results | Domains, score method, coverage, suggested priorities | Build or update plan | No scored answers; sparse evidence; stale assessment |
| Dashboard | Next action, goal, readiness, current progress | Continue next task | New user; no active plan; complete plan |
| Roadmap | Ordered tasks, filters, dates, plan version | Open task | Deferred tasks; regeneration preview |
| Task detail | Reason, steps, resources, notes, status | Update progress | Missing prerequisite; obsolete resource |
| Review | Completed work, goal progress, changed constraints | Adjust plan | No recent activity; incomparable assessment versions |
| Releases | Projects and milestones | Create/manage release | No releases; slipped date; archived project |
| Records | Budgets, rights records, manual metrics by module | Add or review record | Missing data; invalid totals; no integration |
| Settings | Profile, privacy, export, deletion, notifications | Save preferences | Export pending; deletion pending |
| Pricing and billing | Approved plans and subscription state | Subscribe/manage plan | Payment failure; cancellation; downgrade |
| Opportunities | Curated listings, filters, saved items | View details | No suitable matches; expired listing |
| Professional detail | Provider facts, service scope, verification | Contact/book when supported | Unavailable provider; report concern |
| Admin | Content, rules, support, audit | Review/publish | Draft conflict; insufficient permission |

### 7.2 Core journeys

**First visit:** understand the proposition → begin profile → intentionally choose a goal → answer assessment → understand score coverage → accept a feasible plan → open the first task. Save state so interruption does not force a restart.

**Returning artist:** sign in → see current goal and next action → work through guidance → record completion or defer with a reason → see progress → decide whether the next task is still appropriate.

**Changed circumstances:** edit budget, time, or goal → preview recommendation changes → accept a new plan version → retain completed and personal tasks → review newly blocked or deferred work.

**Release planning:** create a project → select an adaptable template → choose a date → review dependencies and capacity → manage milestones → record post-release observations. This becomes a production journey only when F09 ships.

**Future opportunity discovery:** browse relevant listings → check eligibility, deadline, cost, and provider → save or follow application action → explicitly choose any information to share → track personal application status. Do not claim automated application submission unless implemented.

## 8. Copy strategy and proposed copy

### 8.1 Positioning assessment

The existing voice is encouraging and artist-centred. It emphasises independence, clarity, practical progress, and control rather than fame or guaranteed revenue. The four-step explanation is particularly useful because it maps directly to the product loop. The local-storage notice, sample-dashboard labelling, and illustrative-assessment caveats establish appropriate expectations for the prototype. [S1–S5]

The main copy risk is scope inflation: the hero includes discovery, the workspace promises release and milestone organisation, and personalised guidance is described broadly, while the demonstrated product is a profile, six-question assessment, and short checklist. Preserve the ambition but align present-tense claims with the shipped release.

### 8.2 Copy changes by surface

| Surface | Finding | Recommended treatment |
| --- | --- | --- |
| Hero | Four ideas compete for attention | Lead with one outcome: a clear, manageable career plan |
| Intelligent positioning | Could imply AI or deep advisory capability | Describe the actual method and benefit; do not imply an AI feature without one |
| Feature headline | Broad enough to suggest comprehensive career coverage | Name the available planning, assessment, and progress tools |
| Roadmap claim | Personalisation by all profile fields is not established | Specify which inputs shape recommendations and show reasons in-product |
| Opportunity promise | Future in feature text, more immediate in hero | Keep future status visible wherever discovery is mentioned |
| Workspace promise | Release and milestone management exceeds observed UI | Ship those workflows or narrow the claim until available |
| Calls to action | Several labels lead to the same workspace | Choose one main label appropriate to the current release |
| Score | Numeric precision can appear authoritative | Always explain the self-reported basis and coverage |
| Profile defaults | Defaults can misrepresent deliberate choices | Use explicit choices or clearly mark defaults before saving |
| Empty and complete states | Same generic task appears in very different contexts | Distinguish insufficient evidence from completed foundations |
| Money field | Pounds is the only visible currency | State supported market or support currency selection |
| Footer | Brand readiness remains provisional | Resolve brand checks before presenting a settled commercial identity |

### 8.3 Proposed acquisition copy

The following is original proposed copy, not a transcription of the existing site. Use only the version appropriate to actual availability.

**Hero headline**

Turn your music ambitions into a clear next step.

**Hero description for the production MVP**

Understand your career foundations, build a practical plan around your goals, and track the work that moves you forward.

**Primary CTA for the current prototype**

Try the artist workspace

**Primary CTA for an account-backed production assessment**

Build my career plan

**Secondary CTA**

See how it works

**Audience line**

For independent artists building their first release, growing an audience, or bringing more structure to their career.

**Feature introduction**

Bring your priorities, plans, and progress together.

- **Understand your foundations:** Review your release planning, branding, audience habits, records, finances, and goals.
- **Choose your next steps:** Get practical actions based on your answers, with a clear reason for each recommendation.
- **Keep your plan moving:** Organise tasks, record progress, and adjust your priorities as circumstances change.
- **Connections and opportunities — planned:** We’re exploring ways to help artists find relevant people, services, and opportunities.

**How it works**

1. Tell us what you are working towards and what time and resources you have.
2. Review the career practices you already have in place.
3. Choose a practical plan and start with one useful action.
4. Record progress and update the plan as you learn.

**Vision**

Independent artists deserve access to clear, practical career support. Uniify starts with the tools to understand your priorities and manage your next steps, with you in control of the direction.

### 8.4 Proposed product microcopy

| Context | Proposed text |
| --- | --- |
| Prototype notice | This demo saves information only in this browser. It is not a secure online account. Use sample information and avoid sensitive details. |
| Assessment introduction | This check reflects the career practices you report today. It does not measure your talent or predict commercial success. |
| Sparse result | Your score is based on {scored} of {total} questions. Answer more questions for a fuller picture. |
| No scored answers | There is not enough information to calculate a score yet. You can answer a question or start with a general planning task. |
| All foundations complete | You have reported all assessed foundations in place. Review your current goal and choose what to improve next. |
| Recommendation reason | Suggested because you said {practice} is {answer}. |
| Unknown budget | You can skip this for now. We will not assume that a blank budget means zero. |
| Zero budget | We will start with actions you can take without a paid service. |
| Save failure | We could not save your changes. Your entries are still here. Try again. |
| Deferred task | Move this task out of your current priorities. You can return to it later. |
| Plan update | Your answers have changed. Review the suggested updates before replacing your current plan. |
| Completed task | Marked complete. Your assessment score changes only when you update your assessment. |
| Opportunity mismatch | No suitable opportunities match these filters right now. Adjust the filters or check back later. |

Use concrete verbs, short explanations, and supportive language. Avoid promises of guaranteed growth, income, industry access, or certified readiness. Do not invent testimonials, partner logos, active-user counts, or success statistics.

## 9. Data model and system boundaries

### 9.1 Proposed entities

| Entity | Important fields | Relationship or rule |
| --- | --- | --- |
| User | ID, auth-provider reference, account status, consent versions | Owns or is authorised for artist data |
| ArtistProfile | ID, owner, name, role, stage, goal, challenge, budget amount/currency, hours, tracks, vision, timezone | Current editable profile with change timestamps |
| AssessmentDefinition | Version, question IDs, domain, answer schema, guidance | Published versions immutable |
| AssessmentResponse | Artist, version, answers, score, coverage, timestamps | Retains original answers and calculation basis |
| TaskTemplate | Stable ID, domain, steps, relevance rules, effort/cost metadata, resources, version | Editorially reviewed |
| Roadmap | Artist, goal, input snapshot, rule version, status, created date | Versioned plan |
| TaskInstance | Artist, template or custom ID, roadmap links, status, notes, dates, completion history | Identity survives recommendation changes |
| Goal | Artist, description, optional metric/target, horizon, status | Links projects and tasks |
| ReleaseProject | Artist, title, type, target date, status, milestones | Links relevant tasks and records |
| FinancialEntry | Artist, project, type, amount, currency, category, date | No implicit currency aggregation |
| RightsRecord | Artist, work, participants, declared ownership, agreement references | Private; not ownership certification |
| MetricObservation | Artist, source, metric, value, period, captured date | Comparable definitions required |
| Resource | Content, tags, owner, reviewed date, version, status | Supports task guidance |
| Subscription | Customer/provider IDs, plan, status, effective dates | Conditional; provider events reconciled |
| Opportunity | Provider, category, eligibility, deadline, location, cost, source, review status | Future curated catalogue |
| Provider | Public profile, services, verification meaning, status | Future moderation scope |
| NotificationPreference | User, channel, schedule, timezone, consent | Delivery jobs honour changes |
| AuditEvent | Actor, action, target, time, metadata | Restricted retention and access |

The prototype export uses `profile`, `assessment`, and `completed` objects. Budget and track count appeared as strings in the downloaded sample. Production migration should parse and validate these values rather than blindly trusting the prototype format. Add an explicit export schema version.

### 9.2 Architecture proposal

Use a responsive web application with server-authorised APIs, persistent structured storage, an authentication service, a versioned recommendation/content layer, and a small admin interface. Add a background job mechanism only for features that require it, such as reminders, exports, and provider events. Avoid making the core planning flow depend on AI or external music-platform APIs.

Suggested API responsibilities include profile reads/updates, assessment draft/submission/history, roadmap generation/preview, task changes, dashboard summaries, exports, and account lifecycle requests. Enforce access controls and validation server-side. Plan-generation and payment-event operations must be idempotent.

Vendor selection, hosting region, authentication method, database, payment provider, notification provider, and integration permissions are Open. These are architecture requirements, not a verified description of the prototype’s implementation.

## 10. Nonfunctional requirements

The following are proposed engineering targets to validate against the team’s capacity and supported markets.

| Area | Requirement and proposed acceptance target |
| --- | --- |
| Usability | An artist can understand the result and start the first useful task without assisted onboarding; validate through moderated research |
| Accessibility | Target WCAG 2.2 AA; keyboard access, visible focus, properly associated labels, readable contrast, accessible errors, no colour-only status |
| Responsive layout | Core journeys usable from 360px mobile widths through desktop; no horizontal overflow for core forms and task views |
| Performance | Target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile in measured supported usage; validate with actual field data |
| API responsiveness | Target p95 under 1 second for ordinary saved-data reads and writes, excluding external-provider operations; show progress for longer jobs |
| Availability | Initial production target 99.5% monthly for core account and planning flows; define maintenance and measurement rules |
| Data integrity | Server validation, conflict handling, stable IDs, transactional updates where needed, and no silent data loss |
| Recovery | Proposed initial RPO ≤24 hours and RTO ≤8 hours; scheduled backups and a documented restore test before pilot |
| Security | TLS, secure secret storage, access isolation, privileged-role controls, rate limiting, abuse controls, dependency maintenance, restricted audit logs |
| Privacy | Minimise data collection; approve retention and deletion policies for actual launch markets; no sensitive free text in analytics |
| Observability | Track save failures, auth failures, generation failures, export failures, provider events, and notification failures with actionable alerts |
| Localisation | Store dates consistently and display in user context; keep currency explicit; do not infer location from currency |
| Resilience | Useful offline/error messaging, recoverable drafts, retry-safe submissions, and visible stale-data states |

These are proposed product targets, not an assertion that the prototype meets a standard or a determination of legal compliance. Launch-market policy requirements need review before release.

## 11. Measurement and research

### 11.1 Success definition

The primary product metric should be **weekly artists completing at least one meaningful planned action**. A meaningful action is a non-demo task with a stated outcome; completion is recorded once per artist/task within the measurement window, with reopenings tracked separately. Pair this behavioural metric with feedback about usefulness so checkbox activity does not become a proxy for career success.

### 11.2 Funnel and guardrails

| Metric | Definition | Why it matters |
| --- | --- | --- |
| Entry conversion | Unique eligible visitors starting onboarding / eligible visitors | Proposition and CTA clarity |
| Profile completion | Saved deliberate profiles / onboarding starts | Form burden |
| Assessment completion | Submitted assessments / assessment starts | Comprehension and relevance |
| Activation | New artists saving a plan and completing one useful action within seven days / eligible new artists | Time to realised value |
| Time to first action | Elapsed time from onboarding start to first meaningful completion | Friction and task feasibility |
| Week-four retention | Activated artists completing a meaningful action in days 22–28 / activated artists with full observation time | Recurring value |
| Recommendation usefulness | Useful ratings / submitted ratings, with response rate shown | Guidance quality |
| Defer and dismissal reasons | Distribution by template and version | Misfit, effort, cost, or timing |
| Save reliability | Successful durable writes / attempted writes | Trust and data safety |
| Support burden | Relevant cases per active artist and resolution time | Cost and usability |
| Commercial metrics | Paid conversion, churn, gross margin, acquisition cost | Business viability after paid launch |

Illustrative pilot decision thresholds, to approve before recruitment: at least 70% of moderated participants can explain their next action without help; at least 60% rate the initial plan useful; at least 30% of eligible onboarded pilot artists activate within seven days. These are proposed decision gates, not benchmarks or current results. Report denominators and confidence limits where sample sizes permit, and do not declare product-market fit from a small beta.

Suggested events: `onboarding_started`, `profile_saved`, `assessment_started`, `assessment_submitted`, `results_viewed`, `roadmap_created`, `roadmap_refreshed`, `task_started`, `task_completed`, `task_reopened`, `task_deferred`, `recommendation_rated`, `review_completed`, `export_requested`, and conditional billing events. Include actor pseudonym, artist ID, timestamp, source screen, and relevant content versions; exclude private content fields.

### 11.3 Research priorities

Interview artists across the initial stages and roles to establish where planning fails today, which existing tools they use, how they judge useful guidance, whether they will return weekly, and which benefits justify payment. Test whether score language feels constructive, whether N/A is understood, and whether recommendations remain realistic at zero budget and low weekly availability. Validate the audience segment before adding a marketplace.

## 12. Delivery sequence and launch gates

### Phase 0 Product definition

Confirm target segment, launch market, brand status, assessment ownership, task content, privacy model, and commercial hypotheses. Fix present-tense copy that implies unavailable capabilities. Produce versioned assessment and task fixtures. Exit when the team agrees on the core outcome, scope, and evidence needed from a pilot.

### Phase 1 Production pilot

Deliver F01–F08, basic F10, task-linked F13 content, F16–F18, and the supporting account/data infrastructure. Preserve local-demo import only if it offers actual user value. Exit when end-to-end acceptance criteria, account isolation, persistence, export, recovery, accessibility review, and guidance review pass.

### Phase 2 Retention and commercial depth

Use pilot evidence to prioritise release projects, history, reminders, manual records, and deeper resources. Introduce billing only after users identify a recurring paid benefit and commercial terms are settled. Exit when retention and support load justify continued rollout and paid access works correctly through failure, cancellation, and downgrade states.

### Phase 3 Ecosystem

Pilot curated opportunities and professionals before expanding into transactions, teams, or automation. Require a real moderation process, clear provider standards, sufficient relevant supply, and evidence of artist demand. AI and integrations remain optional capabilities, not reasons to delay core improvements.

No delivery dates or staffing commitments are assumed. Estimate phases after technical discovery and content sizing. Core dependencies are: account/data foundation before cloud persistence; content and rules before credible personalisation; tasks and goals before project rollups; retention and pricing decisions before billing; provider operations before marketplace payments.

### Minimum launch checklist

- Every feature advertised as available works end to end.
- Scoring edge cases and recommendation fixtures pass.
- Zero budget, unknown budget, N/A, incomplete answers, and changed goals are handled deliberately.
- Account isolation, session handling, persistence, and conflict recovery are verified.
- Completed work survives assessment edits, plan refresh, and downgrade.
- Export and deletion behaviour match published policy.
- Screen-reader, keyboard, mobile, and error-state checks pass for the core journey.
- Guidance has an accountable reviewer and versioned publication process.
- Support, monitoring, backups, and recovery have owners.
- Approved market, brand, service terms, privacy language, and any commercial terms are ready.
- Analytics definitions and pilot success criteria are agreed before data collection.

## 13. Risks and open decisions

| Risk or decision | Why it matters | Proposed action / owner |
| --- | --- | --- |
| Broad audience versus shallow guidance | Advice for first releases may not serve established artists or songwriters | Product and content leads prioritise a segment and role-specific variants |
| Scope exceeds implementation | Discovery and project promises can undermine trust | Product and marketing align claims with release availability |
| Score overinterpretation | Users may read readiness as talent or commercial potential | Content and design explain basis and coverage |
| Sparse assessments appear precise | A single positive answer could produce 100 | Engineering shows denominator; product validates minimum-evidence presentation |
| Resource constraints ignored | Recommendations can be technically relevant but infeasible | Product tests time/budget adaptation and no-cost alternatives |
| Local prototype mistaken for account | Users can lose data or assume cloud protection | Clear prototype notice; production authentication and storage |
| Default answers contaminate personalisation | Defaults may not reflect the artist | Explicit selection and unknown-value handling |
| Plan regeneration loses work | Artist trust depends on preserved history | Stable task IDs, versioned plans, refresh preview |
| Weak retention | Assessment may be a one-time experience | Focus on actionable task depth and periodic review before expansion |
| Monetisation conflicts with guidance | Paid placement could bias recommendations | Separate editorial rules from commercial placement and disclose fees |
| Marketplace supply and abuse | Irrelevant or unsafe listings reduce trust | Curated pilot, provider review, reporting, and moderation ownership |
| Geography and currency unspecified | Affects content relevance, payments, policy, and scheduling | Founder/product decision before commercial implementation |
| Brand status pending | Website itself indicates unresolved checks | Business owner completes naming review |
| Unowned editorial quality | Advice and resources become stale | Assign domain reviewers and review cadence |
| Missing service operations | Refunds, disputes, and support cannot be solved by UI alone | Define responsibilities before paid services launch |

### Decisions needed before build commitment

1. Who is the initial customer: first-release artists, emerging artists, or a broader group?
2. Which countries and currencies are supported at launch?
3. Is the next release a research beta or a paid commercial product?
4. Which collected profile inputs must demonstrably affect recommendations?
5. Who approves assessment content, scoring interpretation, and task guidance?
6. Must release projects ship in the MVP, or should the launch copy narrow its promise?
7. What remains free, what becomes paid, and how will willingness to pay be tested?
8. Is Uniify strictly software at launch, or is human advisory delivery included?
9. What account, hosting, support, privacy, and data-retention model will be used?
10. Which opportunities or professional services have real supply and an accountable operating owner?

## 14. Traceability from website promise to implementation

| Source proposition | Required implementation | Evidence of success |
| --- | --- | --- |
| Understand the artist’s journey [S1, S3] | F03–F05 profile, assessment, understandable results | Artist can explain strengths, gaps, and score limitations |
| Manage the career [S1, S2] | F07–F10 tasks, goals, dashboard, release projects when promised | Artist maintains a useful active plan |
| Personalised priorities [S2] | F06 constraint-aware, explained recommendations | Different relevant inputs produce suitable, explainable changes |
| Visible progress [S2, S3] | F08, F10 durable progress and review | Completion history remains accurate across plan changes |
| Growth on the artist’s terms [S1, S2] | Editable goals, defer/dismiss controls, feasible actions | Artist can adapt the plan without losing work |
| Relevant connections and opportunities [S2, S4] | F20–F22 curated discovery and optional services | Relevant attributable listings with transparent availability and terms |
| Accessible management support [S4] | Useful core tier, understandable guidance, low-friction onboarding | Users reach a useful action without needing a management agreement |
| Artist control of information [S5, S6] | F16 export, privacy, lifecycle controls | Complete authorised export and policy-consistent deletion |

The implementation priority is the dependable assessment-to-action loop. The broader ecosystem should expand that loop once user evidence, content quality, and operational capability justify it.

## UI revision — 20 November 2026

This revision supersedes the earlier navigation layout. Public navigation is About, Insights, Sign in and Get started (signup). About is a separate page with Samuel Fakunle credited as founder; contact is Uniifyforartists@gmail.com; biography remains pending. Insights contains practical release, credits and routine guides. Supplied artist photography replaces the landing images; the loading overlay is removed.

Workspace navigation is Overview → Releases → Roadmap → Career Progress → Budget & income. Artist profile, Career foundations, Guides & resources and Settings & data move to the header account menu. Sidebar collapse and light/dark appearance preferences persist locally. Profile has a full-width form and removable uploaded photo, stored as a small JPEG in local profile data. Roadmap supports list and four-column board views with keyboard-operable status controls using the same transition/history/scheduling rules.

New onboarding has three required single-choice questions: main musical role, current career stage and primary goal. Answers are editable through Artist profile. On completion, go to Releases. A labelled demo setup is available independently. Signup → verification code → onboarding is implemented as a client flow awaiting authenticated server endpoints; no email delivery or real account creation is claimed. See `uniify-theme/AUTH-INTEGRATION.md` for the remaining integration contract. Local data migration and retained history remain unchanged.

## Digital manager MVP implementation — 24 November 2026

This section supersedes earlier browser-only/account-preview assumptions for signed-in workspaces. The existing local demo remains available separately.

- Three-question onboarding captures role, stage and goal; the editable assessment captures foundation practices, experience, challenges, strengths, obstacles, budget/currency and weekly availability. Platform-specific audience observations remain dated records in Career Progress. Unanswered values stay unknown.
- Assessment generates general career recommendations immediately. Creating a release adds the five-phase plan and a promotion action tailored to release type, goal and budget. Release creation is not blocked by assessment.
- Version 1 deterministic planning rules rank assessed gaps and goal-specific actions, explain their inputs, estimate effort, and link prerequisites. Audience growth, earning income, first releases, career management and collaboration goals receive distinct actions. Free actions remain available for zero/unknown budgets. Open text is retained as context; the MVP does not claim to infer arbitrary text using AI.
- Overview surfaces three available next actions. Rules re-evaluate on saved changes and returning to the workspace. Completed work, notes, deferred choices and explicit dates remain protected. User-archived suggestions remain archived; automatically retired suggestions can return when relevant. Recommendation changes are retained with their rule version; scheduling revisions retain the existing undo behavior.
- Weekly in-app check-ins record completed work, obstacles and changed availability. No scheduled email check-ins or autonomous career execution are included.
- Signed-in workspaces use private Supabase cloud records with owner RLS and optimistic revision checks. Profile, assessments, releases, tasks, budgets, career history, check-ins and audience observations load on another device. Demo data is separate. Import requires explicit review; failed uploads remain locally pending with retry/export and conflict handling.
- Exports retain existing relationships/history plus recommendation history and check-ins. Career Progress continues to distinguish activity from audience and commercial outcomes.
- Registration, confirmation, login, password recovery and logout use same-origin Vercel endpoints and HttpOnly sessions on the canonical domain. Supabase default email links are supported alongside optional six-digit codes. Custom email delivery and actual inbox-to-completion acceptance must be verified before unrestricted production onboarding is declared ready.
- Marketplace, AI assistance, subscriptions/payments, external platform connections and team accounts remain later phases.

Acceptance: contrasting artist profiles receive different priorities; completion unlocks next work; reopening restores dependencies; repeat updates do not duplicate tasks; manual dates/notes/history survive; separate accounts cannot read/write each other; stale device writes cannot overwrite newer cloud state; failed saves retry without loss; returning devices load cloud history. Full live signup/confirmation/recovery remains dependent on verified email delivery.
