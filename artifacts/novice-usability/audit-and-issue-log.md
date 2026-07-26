# BoilerCompass first-time-user audit and issue log

Audit date: July 26, 2026

Surfaces reviewed: live production before implementation, repository source/data/tests, current local production build, desktop and mobile screenshots, JavaScript-disabled rendering, reduced motion, keyboard interactions, axe results, and the ten scripted novice tasks.

Real student participants: **None were available for this implementation pass.** No participant outcomes are claimed. Use `usability-test-script.md` for future moderated sessions and `issue-log-template.md` to record observations.

## Confirmed findings and resolution

| ID     | Priority | Confirmed finding                                                                                                 | Resolution                                                                                                                                       | Verification                                                                                    |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| NU-001 | P0       | Student-language queries such as “drop a class,” “view coursework,” and “pay my bill” were missing or unreliable. | Added task aliases for coursework, tutoring, billing, registration, health, mental health, CARE, food insecurity, transcripts, and degree audit. | Unit search mappings and novice browser tasks.                                                  |
| NU-002 | P0       | The directory re-sorted search results by featured status, discarding Fuse relevance.                             | Added Best match and preserve ranked results whenever a query is active.                                                                         | Browser assertion verifies Counseling and Psychological Services is first for “health support.” |
| NU-003 | P0       | 911 and 988 were guidance text but not direct mobile actions.                                                     | Added `tel:911`, `tel:988`, and `sms:988` actions while preserving emergency wording.                                                            | Novice crisis-path browser test.                                                                |
| NU-004 | P1       | Homepage promise and labels were indirect and system-oriented.                                                    | Rewrote first viewport around finding the right Purdue resource; made unofficial status explicit and added task examples.                        | First-viewport and no-JavaScript browser tests plus screenshots.                                |
| NU-005 | P1       | Essential hero/page content began hidden and depended on entrance animation completing.                           | Removed initial opacity/transform animation from essential content.                                                                              | Raw HTML, JavaScript-disabled, CSS opacity, normal/reduced-motion tests.                        |
| NU-006 | P1       | Card actions such as “Details,” “Open,” and “Check details” did not predict the destination.                      | Added resource-specific internal/external action names, new-tab accessible labels, and the actual record caution.                                | Card destination browser tests and axe.                                                         |
| NU-007 | P1       | Search/filter/sort/view state was not fully shareable or browser-history-aware.                                   | Moved directory state to validated URL parameters and merged rapid changes atomically.                                                           | Direct URL, reload, Back, reset, and rapid query+filter tests.                                  |
| NU-008 | P1       | Favorites and Recently opened could retain an unrelated search and had weak first-use explanations.               | Saved views clear stale discovery filters; empty and result headings explain device/browser-only storage and no account/cloud sync.              | Persistence, reload, saved-view, and empty-state tests.                                         |
| NU-009 | P1       | BoilerClasses’ caution named official systems but did not group actionable official alternatives.                 | Added Purdue Catalog and myPurdue as structured official alternatives and a dedicated verification section.                                      | Detail-page novice task and screenshot.                                                         |
| NU-010 | P2       | “Source type,” “Campus scope,” “Auditable directory,” and terse verification dates assumed internal vocabulary.   | Replaced with “Who runs it?”, “Campus/location,” task-oriented directory copy, and “Link verified [month year].”                                 | Copy assertions, axe, screenshots.                                                              |
| NU-011 | P2       | Source badge meanings were not explained at first use.                                                            | Added a native accessible disclosure near the first badge groups.                                                                                | Keyboard/axe coverage and screenshots.                                                          |
| NU-012 | P2       | The no-JavaScript homepage had no usable task search.                                                             | Added a GET form and hide inert JS-only launcher/chips when JavaScript is disabled.                                                              | JavaScript-disabled search submission test and screenshot.                                      |
| NU-013 | P2       | Visible shortcut communication was Mac-specific despite Ctrl+K support.                                           | Changed visible hint to Ctrl / ⌘ K.                                                                                                              | Keyboard launcher test.                                                                         |
| NU-014 | P2       | Several decorative sequence numbers were exposed to assistive technology.                                         | Marked decorative numbering `aria-hidden` across task, guide, navigation, and search-result contexts.                                            | Axe suite.                                                                                      |

## Hypotheses not reproduced

- **Desktop hero absent:** not reproduced on audited production or the final local build. Hero content existed in server HTML and accessibility output. The initial hidden animation was still removed as a resilience improvement.
- **Broken mobile overlay geometry or horizontal overflow:** not reproduced in the required viewport matrix. Mobile navigation and filters fit, trap focus, close with Escape, and restore focus.
- **Incorrect crisis hierarchy:** the pre-change visual hierarchy already distinguished emergency from routine support. The confirmed gap was actionability of 911/988, not wording hierarchy.
- **Confirmed broken Purdue destinations:** none. The final automated check found 47 reachable destinations and two authentication/automation-blocked destinations requiring manual access; neither is confirmed broken.

## Remaining research questions

These require real participants rather than additional synthetic testing:

1. Can first-time students accurately paraphrase all three source labels after one exposure?
2. Which student phrases are still missing from search aliases?
3. Do students understand the difference between Purdue-affiliated and Purdue-operated without opening the explanation?
4. Does “About [resource]” consistently predict an internal detail page?
5. Are browser-only Favorites valuable enough to retain without account sync?
