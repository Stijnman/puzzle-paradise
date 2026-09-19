import fs from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function seriousViolations(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] }
    });
    return result.violations
      .filter(item => ['serious','critical'].includes(item.impact))
      .map(item => ({
        id:item.id,
        impact:item.impact,
        help:item.help,
        targets:item.nodes.map(node => node.target)
      }));
  });
}

test('arcade has no serious or critical WCAG violations', async ({ page }) => {
  await page.goto('/');
  expect(await seriousViolations(page)).toEqual([]);
});

test('representative player states have no serious or critical WCAG violations', async ({ page }) => {
  for (const id of ['sudoku','arrow-escape','blackbox','loopy','undead']) {
    await page.goto(`/player.html?game=${id}&difficulty=medium&seed=a11y-${id}`);
    expect(await seriousViolations(page), id).toEqual([]);
  }
});

test('keyboard focus can enter the puzzle and Escape closes drawers', async ({ page }) => {
  await page.goto('/player.html?game=sudoku&difficulty=medium&seed=keyboard');
  await page.locator('#rules').click();
  await expect(page.locator('#rules-drawer')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#rules-drawer')).not.toHaveClass(/open/);

  const firstCell = page.locator('.grid-board:visible .grid-cell[tabindex="0"]').first();
  await firstCell.focus();
  await page.keyboard.press('ArrowRight');
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('grid-cell'));
  expect(focused).toBe(true);
});
