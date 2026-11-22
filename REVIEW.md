# Uniify landing and management workspace

Updated 20 November 2026.

## Preview

From this folder run `python3 -m http.server 8765 --directory dist`.

- Landing: http://localhost:8765/index.html
- Workspace: http://localhost:8765/workspace.html
- Sign-in design and direct demo link: http://localhost:8765/signin.html

## Walkthrough

1. Set your artist profile and weekly availability; save to Releases.
2. Create a release with a goal, type, date and budget. Five dependent phase tasks are generated.
3. Open its roadmap, complete preparation, and see production become available. Create another release and switch to All projects.
4. Change the release date or availability. Review “What changed and why,” capacity warnings and undo. Set a task date to manual and confirm it stays fixed.
5. Add general tasks, notes or defer work. Reopen completed work without erasing its history.
6. Review optional Career foundations for supporting guidance.
7. Open Career Progress. Log/edit engagements and audience observations; switch quarters, years or custom dates. Record actual release delivery explicitly.
8. Add dated income/expenses in Budget. Review financial trends and export the full workspace from Settings.

## Theme provenance

Creovibe provides the stylesheet foundation, Creato and Clash fonts, Font Awesome icons, service-card frames, project frames, pill buttons, decorative artwork, GSAP/ScrollTrigger/SplitText motion, tabs and accordion patterns. Larkon supplies reference patterns for a persistent sidebar, summary cards, task search/filter and editable records, not its visual skin or backend.

The landing page now restores the original Creovibe Home 1 photography, image masks, paired hover images, section order and spacing shown in the supplied screen recording. Twenty original demo photographs were restored from the same ThemeMascot demo; sources are listed in reference-images.json. No unrelated stock search or image generation was used. The source template fonts remain bundled locally. The template author identifies demo photography as preview-only and excluded from the template purchase; the restored photographs are recorded as reference assets for this local design review.

## Scope

This is a browser-local interactive prototype, not the complete production PRD implementation. Data is stored under `uniify-workspace-v2`. Authentication, account recovery, cloud synchronisation, external integrations, notifications, billing, team permissions and a marketplace are not connected. The existing sign-in and sign-up screens expose a direct, explicitly labelled demo link.

## Verification

Run `node tests/career-engine.test.cjs` and `node tests/workspace.test.cjs` from this folder. The checks cover all nine view renders, assessment scoring and coverage, escaped user text, roadmap idempotency and preserved completion, task saves, release milestones, ledger entries and local persistence through a lightweight DOM adapter. The engine suite also covers migration, multi-release scheduling, dependencies/reopening, protected dates and deferred work, capacity conflicts, calendar boundaries, activity edits, separated metrics and exact decimal totals. JavaScript syntax and linked local files also checked.

The earlier workspace review used the lightweight adapter; full dashboard browser QA remains separate. Local HTTP returned 200. Landing-specific Chrome validation is documented below. The existing Sites project returned project_not_found, so this revision has not been deployed; the existing hosting identifier is preserved.


## Landing reference restoration — 20 November 2026

Reviewed the supplied 24-second screen recording and compared it with Creovibe Home 1. Removed the added workspace-preview section and decorative-icon photo substitutions. Restored the original hero photograph, about image, project photos, masked service-card photos, video frame, carousel photos and resource imagery. Original section padding, card frames, image masks and GSAP effects come from style.css; experience.css now contains only the Uniify adaptation and interaction refinements.

Purple gradients replace the warm accent treatment. Buttons use clean pills without arrows, separate arrow circles or outlines; carousel and top controls use text labels. The header overlays the photograph and retains the reference white sticky navigation. Mobile navigation has labelled buttons, Escape handling, focus return and a focus trap. Motion control is in the footer rather than floating over the content. Release → Roadmap → Progress appears in the original three-card planning frame.

Validation used an isolated Chrome preview after the in-app browser tool proved unavailable. Checked widths 320, 390, 768 and 1440; no horizontal page overflow. Checked normal and paused motion, desktop anchor navigation and sticky header, mobile open/close/Escape/focus return, zero arrow icons inside controls, 50px primary buttons, 84 successful image decodes, and valid local assets/links. No JavaScript runtime errors were observed. Screenshots are saved under review/. The local preview is current; this change has not been deployed.

## November 20 refinement

- New user-supplied photography in landing, auth, About and Insights; optimized copies in `dist/images/artists`.
- Five-item collapsible workspace navigation; account dropdown for profile, foundations, guides and settings.
- Light/dark appearance, spacious profile form and photo editing; simpler Overview and list/board Roadmap.
- Three-question onboarding demo at `onboarding.html?demo=1`. Real signup/verification requires server integration (see AUTH-INTEGRATION.md); currently reports unavailable services rather than claiming email delivery.
- Engine and workspace regression suites pass. Isolated Chrome checks cover 1440px/390px layouts, onboarding persistence, collapse/account controls, release-created board, task transitions and unavailable auth response. No runtime exceptions observed.
- Local preview only; publishing-access issue is still unresolved.

## November 21 contact update

About now links to Uniifyforartists@gmail.com. User supplied Vercel project: https://vercel.com/dream-digitals-projects/uniify. Dashboard access could not be verified from this session; no deployment performed.
