import { test, expect } from '@playwright/test';

test.describe('Sticky Notes Cross-Browser E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test run
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('loads desktop workspace and creates a note of specified size and position', async ({ page }) => {
    await expect(page.locator('.app-toolbar')).toBeVisible();

    // Open "Specify Size & Pos" dialog
    await page.click('button:has-text("Specify Size & Pos")');
    await expect(page.locator('.modal-dialog')).toBeVisible();

    // Fill specified geometry: X=180, Y=140, Width=280, Height=240
    await page.fill('#note-x', '180');
    await page.fill('#note-y', '140');
    await page.fill('#note-width', '280');
    await page.fill('#note-height', '240');
    await page.fill('#note-text', 'Note created at specific coordinates');
    await page.click('.color-choice-btn:has-text("Soft Green")');

    // Submit
    await page.click('.modal-actions button[type="submit"]');
    await expect(page.locator('.modal-dialog')).toBeHidden();

    // Verify note is rendered with specified dimensions and position
    const createdNote = page.locator('.sticky-note').last();
    await expect(createdNote).toBeVisible();
    await expect(createdNote.locator('.dimension-badge')).toHaveText('280 × 240');
    await expect(createdNote.locator('.pos-badge')).toHaveText('X:180 Y:140');
    await expect(createdNote.locator('.note-textarea')).toHaveValue('Note created at specific coordinates');
  });

  test('moves a note by dragging the header handle', async ({ page }) => {
    // There is an initial sample note
    const note = page.locator('.sticky-note').first();
    await expect(note).toBeVisible();

    const header = note.locator('.sticky-note-header');
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();

    if (headerBox) {
      // Drag header by 120px to the right and 80px down
      await page.mouse.move(headerBox.x + 20, headerBox.y + 10);
      await page.mouse.down();
      await page.mouse.move(headerBox.x + 140, headerBox.y + 90, { steps: 5 });
      await page.mouse.up();
    }

    // Verify position updated
    await expect(note.locator('.pos-badge')).not.toHaveText('X:80 Y:80');
  });

  test('resizes a note by dragging the bottom-right resize handle', async ({ page }) => {
    const note = page.locator('.sticky-note').first();
    await expect(note).toBeVisible();

    const resizeHandle = note.locator('.resize-handle');
    const handleBox = await resizeHandle.boundingBox();
    expect(handleBox).not.toBeNull();

    if (handleBox) {
      // Drag handle by +60px right and +40px down
      await page.mouse.move(handleBox.x + 5, handleBox.y + 5);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + 65, handleBox.y + 45, { steps: 5 });
      await page.mouse.up();
    }

    // Verify dimension badge reflects enlarged size
    const badgeText = await note.locator('.dimension-badge').innerText();
    const [w, h] = badgeText.split('×').map((v) => parseInt(v.trim(), 10));
    expect(w).toBeGreaterThan(260);
    expect(h).toBeGreaterThan(220);
  });

  test('changes note color and preserves content on page reload', async ({ page }) => {
    const note = page.locator('.sticky-note').first();
    await expect(note).toBeVisible();

    // Type text
    const textarea = note.locator('.note-textarea');
    await textarea.fill('Persistent cross-browser test content');

    // Change color to Rose Pink
    await note.locator('button[title*="Rose Pink"]').click();

    // Reload page to verify LocalStorage persistence
    await page.reload();

    const reloadedNote = page.locator('.sticky-note').first();
    await expect(reloadedNote.locator('.note-textarea')).toHaveValue('Persistent cross-browser test content');
  });

  test('removes a note by dragging it over the predefined trash zone', async ({ page }) => {
    const note = page.locator('.sticky-note').first();
    await expect(note).toBeVisible();

    const trash = page.locator('.trash-zone');
    await expect(trash).toBeVisible();

    const header = note.locator('.sticky-note-header');
    const headerBox = await header.boundingBox();
    const trashBox = await trash.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(trashBox).not.toBeNull();

    if (headerBox && trashBox) {
      // Drag note over the trash zone center
      await page.mouse.move(headerBox.x + 20, headerBox.y + 10);
      await page.mouse.down();
      await page.mouse.move(trashBox.x + trashBox.width / 2, trashBox.y + trashBox.height / 2, { steps: 10 });

      // Verify trash zone turns into hovered state
      await expect(trash).toHaveClass(/trash-hovered/);

      // Release mouse to delete
      await page.mouse.up();
    }

    // Verify note is removed from the DOM
    await expect(page.locator('.sticky-note')).toHaveCount(0);
    await expect(page.locator('.empty-board-hint')).toBeVisible();
  });
});
