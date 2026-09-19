import { expect, test } from '@playwright/test';

const PUZZLES = [
  'sudoku','arrow-escape','net','mines','fifteen','keen','hitori','lightup','loopy','bridges',
  'samegame','untangle','blackbox','dominosa','galaxies','guess','inertia','ink','magnets','maps',
  'net2','netslide','nullgame','pattern','pearl','pegs','range','rect','sequencing','signpost',
  'singles','sixteen','slant','solo','tents','towers','twiddle','undead','unequal','unruly',
  'cube','filling','flip'
];

test('arcade consumes the viewport without outer scrolling', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(43);
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);
});

test('all 43 engines load, render, and expose an interaction', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  for (const id of PUZZLES) {
    await page.goto(`/player.html?game=${id}&difficulty=medium&seed=e2e-${id}`);
    await expect(page.locator('#game-name')).not.toHaveText('Puzzle');
    const activeBoard = page.locator('.grid-board:visible');
    await expect(activeBoard).toHaveCount(1);
    await expect(activeBoard.locator('.grid-cell')).not.toHaveCount(0);
    await expect(page.locator('[data-pp-action-key]').first()).toBeVisible();
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

test('same seed survives reload and restores move history', async ({ page }) => {
  await page.goto('/player.html?game=arrow-escape&difficulty=easy&seed=persist-e2e');
  const before = await page.locator('#arrow-board').innerText();
  const action = page.locator('[data-pp-action-key]').first();
  await action.click();
  await expect(page.locator('#move-count')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#move-count')).toHaveText('1');
  const afterReload = await page.locator('#arrow-board').innerText();

  await page.getByRole('button', { name:/reset/i }).click();
  await expect(page.locator('#move-count')).toHaveText('0');
  const reset = await page.locator('#arrow-board').innerText();
  expect(reset).toBe(before);
  expect(afterReload).not.toBe('');
});

test('undo and redo replay deterministic state', async ({ page }) => {
  await page.goto('/player.html?game=arrow-escape&difficulty=easy&seed=undo-e2e');
  const initial = await page.locator('#arrow-board').innerText();
  await page.locator('[data-pp-action-key]').first().click();
  const moved = await page.locator('#arrow-board').innerText();
  expect(moved).not.toBe(initial);

  await page.locator('#undo').click();
  await expect(page.locator('#move-count')).toHaveText('0');
  expect(await page.locator('#arrow-board').innerText()).toBe(initial);

  await page.locator('#redo').click();
  await expect(page.locator('#move-count')).toHaveText('1');
  expect(await page.locator('#arrow-board').innerText()).toBe(moved);
});

test('daily challenge creates a fixed shareable seed URL', async ({ page }) => {
  await page.goto('/');
  await page.locator('#daily-play').click();
  const src = await page.locator('#game-frame').getAttribute('src');
  expect(src).toContain('seed=daily%3A');
  expect(src).toContain('daily=');
  expect(src).toContain('difficulty=medium');
});

test('language and theme choices persist across reloads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#language').selectOption('nl');
  await expect(page.locator('#search')).toHaveAttribute('placeholder', /puzzel/i);
  await page.locator('#theme').selectOption('oled');
  await expect(page.locator('html')).toHaveAttribute('data-theme','oled');
  await page.reload();
  await expect(page.locator('#language')).toHaveValue('nl');
  await expect(page.locator('html')).toHaveAttribute('data-theme','oled');
});
