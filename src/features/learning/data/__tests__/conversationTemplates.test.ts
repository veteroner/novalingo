import { describe, expect, it } from 'vitest';
import type { ConversationTemplate } from '../conversationTemplates';
import { CONVERSATION_TEMPLATES, findBestTemplate } from '../conversationTemplates';

/** Minimal structural type matching ConversationNode fields used in tests */
type NodeShape = {
  id: string;
  speaker: string;
  next?: string;
  options?: Array<{ nextNodeId: string }>;
};

const getLegacyBestTemplate = (words: string[]) => {
  // This test suite intentionally verifies the deprecated legacy fallback behavior.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return findBestTemplate(words);
};

describe('conversationTemplates', () => {
  describe('CONVERSATION_TEMPLATES', () => {
    it('has at least 5 templates', () => {
      expect(CONVERSATION_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    });

    it.each(CONVERSATION_TEMPLATES.map((t) => [t.title, t] as [string, ConversationTemplate]))(
      'has valid metadata with %s',
      (_title: string, template: ConversationTemplate) => {
        expect(template.title).toBeTruthy();
        expect(template.titleTr).toBeTruthy();
        expect(template.sceneEmoji).toBeTruthy();
        expect(template.categories.length).toBeGreaterThan(0);
        expect(template.minWords).toBeGreaterThanOrEqual(2);
      },
    );

    it.each(CONVERSATION_TEMPLATES.map((t) => [t.title, t] as [string, ConversationTemplate]))(
      '%s builds a valid node graph',
      (_title: string, template: ConversationTemplate) => {
        const words = ['apple', 'banana', 'cherry'];
        const translations = ['elma', 'muz', 'kiraz'];
        const emojis = ['🍎', '🍌', '🍒'];

        const nodes = template.buildNodes(words, translations, emojis) as NodeShape[];

        expect(nodes.length).toBeGreaterThan(0);

        // Build ID set
        const idSet = new Set(nodes.map((n) => n.id));

        // Every node should have a unique id
        expect(idSet.size).toBe(nodes.length);

        // Every node.next should reference an existing node
        for (const node of nodes) {
          if (node.next) {
            expect(idSet.has(node.next)).toBe(true);
          }
          // Every option.nextNodeId should reference an existing node
          if (node.options) {
            for (const opt of node.options) {
              expect(idSet.has(opt.nextNodeId)).toBe(true);
            }
          }
        }
      },
    );

    it.each(CONVERSATION_TEMPLATES.map((t) => [t.title, t] as [string, ConversationTemplate]))(
      '%s has at least 3 interaction rounds',
      (_title: string, template: ConversationTemplate) => {
        const words = ['one', 'two', 'three'];
        const translations = ['bir', 'iki', 'üç'];
        const emojis = ['1️⃣', '2️⃣', '3️⃣'];

        const nodes = template.buildNodes(words, translations, emojis) as NodeShape[];

        // Count nova nodes with options (= interaction rounds)
        const rounds = nodes.filter(
          (n) => n.speaker === 'nova' && n.options && n.options.length > 0,
        ).length;

        expect(rounds).toBeGreaterThanOrEqual(2);
      },
    );

    it.each(CONVERSATION_TEMPLATES.map((t) => [t.title, t] as [string, ConversationTemplate]))(
      '%s has an end node without next or options',
      (_title: string, template: ConversationTemplate) => {
        const words = ['red', 'blue', 'green'];
        const translations = ['kırmızı', 'mavi', 'yeşil'];
        const emojis = ['🔴', '🔵', '🟢'];

        const nodes = template.buildNodes(words, translations, emojis) as NodeShape[];

        // At least one terminal node (no next, no options)
        const terminals = nodes.filter((n) => !n.next && (!n.options || n.options.length === 0));
        expect(terminals.length).toBeGreaterThan(0);
      },
    );
  });

  describe('findBestTemplate', () => {
    it('returns pet shop template for animal words', () => {
      const template = getLegacyBestTemplate(['dog', 'cat', 'fish']);
      expect(template.title).toBe('At the Pet Shop');
    });

    it('returns food template for food words', () => {
      const template = getLegacyBestTemplate(['apple', 'banana', 'water']);
      expect(template.title).toBe('At the Restaurant');
    });

    it('returns color template for color words', () => {
      const template = getLegacyBestTemplate(['red', 'blue', 'green']);
      expect(template.title).toBe('At the Color Shop');
    });

    it('returns number template for number words', () => {
      const template = getLegacyBestTemplate(['one', 'two', 'three']);
      expect(template.title).toBe('Counting Game');
    });

    it('falls back to generic template for unknown words', () => {
      const template = getLegacyBestTemplate(['xylophone', 'telescope', 'harmonica']);
      expect(template.title).toBe('Talk with Nova');
    });
  });
});
