# Conversation Scenario Content Review Checklist

Use this checklist when reviewing a conversation scenario before merging.

---

## Structure

- [ ] Scenario exports a single `const` of type `ConversationScenario`
- [ ] `id` follows pattern: `phase{N}_{theme}_{short_name}`
- [ ] `entryNodeId` points to an existing node
- [ ] All `nextNodeId` references resolve to existing nodes
- [ ] Dialogue tree has at least one terminal node (no `next`, no `responses`)
- [ ] No orphan nodes (every non-entry node is reachable)
- [ ] No duplicate node IDs

## Content Quality

- [ ] Nova's dialogue is age-appropriate and encouraging
- [ ] Turkish translations are natural (not machine-translated)
- [ ] Emojis are relevant and child-friendly
- [ ] Scene setup makes sense for the target age band
- [ ] Dialogue feels like a real conversation (not a quiz)

## Target Words & Patterns

- [ ] At least 3 `targetWords` defined
- [ ] At least 1 `targetPattern` defined
- [ ] `targetWords` appear in response `acceptedWords` or `marksTargetWord`
- [ ] `targetPatterns` appear in response `marksPattern`
- [ ] `learningGoals` are clear 1-sentence descriptions

## Responses

- [ ] Each response has `expectedText` + `expectedTextTr`
- [ ] `acceptedVariants` includes reasonable child utterances (shortened forms, no article, etc.)
- [ ] `acceptedWords` lists the key word(s) that alone should trigger a match
- [ ] `marksTargetWord` accurately tracks which target words are practiced
- [ ] `marksPattern` accurately tracks which patterns are practiced

## Hints & Repairs

- [ ] Every child-response node has a `hint` entry
- [ ] Hint `delayMs` is 6000-10000ms (not too fast, not too slow)
- [ ] Hint text gives a complete example sentence
- [ ] Every child-response node has a `repair` entry with `enabled: true`
- [ ] Repair `maxRetries` is ≥ 1
- [ ] Repair prompt is simpler/clearer than the hint

## Variants

- [ ] At least 2 variants defined in `variants` array
- [ ] Each variant has `id`, `label`, `labelTr`, `promptStyle`

## Success Criteria

- [ ] `minimumAcceptedTurns` ≤ actual number of child-response nodes
- [ ] `minimumTargetWordsHit` ≤ number of target words
- [ ] `requiredPatterns` is a subset of `targetPatterns`
- [ ] `allowCompletionOnHintedAnswer` is explicitly set

## Selection Policy

- [ ] `priority` is set (default 100)
- [ ] `repeatCooldownDays` ≥ 1
- [ ] `preferredIfTagsSeen` includes relevant theme tags

## Technical

- [ ] File is registered in `scenarioIndex.ts`
- [ ] `validateConversationScenario()` passes with no issues
- [ ] Scenario works end-to-end in dev mode (manual test)
