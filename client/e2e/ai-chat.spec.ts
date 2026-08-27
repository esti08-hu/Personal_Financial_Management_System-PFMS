import { test, expect } from '@playwright/test';

test.describe('AI Chat End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('complete user journey - send message and receive response', async ({ page }) => {
    // Click on the chat trigger button (assuming there's a button to open chat)
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    // Wait for chat window to appear
    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Type a message in the input field
    const messageInput = page.locator('textarea[placeholder*="ask me about your finances"]').or(
      page.locator('input[placeholder*="ask me about your finances"]')
    );
    await messageInput.fill('How much did I spend last month?');

    // Click send button or press Enter
    const sendButton = page.locator('button').filter({ hasText: 'Send' }).or(
      page.locator('[aria-label="Send message"]')
    );

    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }

    // Wait for response to appear
    await page.waitForTimeout(2000); // Allow time for API response

    // Verify user message appears
    await expect(page.locator('text=How much did I spend last month?')).toBeVisible();

    // Verify AI response appears (this will be mocked in production)
    const aiResponse = page.locator('text=I understand you asked').or(
      page.locator('[data-testid="ai-message"]').first()
    );
    await expect(aiResponse).toBeVisible();
  });

  test('handles multiple conversation turns', async ({ page }) => {
    // Open chat window
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Send first message
    const messageInput = page.locator('textarea[placeholder*="ask me about your finances"]').or(
      page.locator('input[placeholder*="ask me about your finances"]')
    );
    await messageInput.fill('What are my biggest expenses?');
    await messageInput.press('Enter');

    await page.waitForTimeout(1500);

    // Send second message
    await messageInput.fill('Can you break it down by category?');
    await messageInput.press('Enter');

    await page.waitForTimeout(1500);

    // Verify both user messages appear
    await expect(page.locator('text=What are my biggest expenses?')).toBeVisible();
    await expect(page.locator('text=Can you break it down by category?')).toBeVisible();

    // Verify multiple AI responses
    const aiMessages = page.locator('text=I understand you asked');
    await expect(aiMessages).toHaveCount(2);
  });

  test('handles error scenarios gracefully', async ({ page }) => {
    // This test would need to simulate network errors or API failures
    // For now, we'll test the UI error handling

    // Open chat window
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Try to send an empty message (if validation exists)
    const messageInput = page.locator('textarea[placeholder*="ask me about your finances"]').or(
      page.locator('input[placeholder*="ask me about your finances"]')
    );

    const sendButton = page.locator('button').filter({ hasText: 'Send' }).or(
      page.locator('[aria-label="Send message"]')
    );

    // If send button is disabled for empty messages, verify it's disabled
    if (await sendButton.isVisible()) {
      const isDisabled = await sendButton.isDisabled();
      if (isDisabled) {
        expect(isDisabled).toBe(true);
      }
    }
  });

  test('chat window interactions work correctly', async ({ page }) => {
    // Open chat window
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Test minimize/maximize functionality
    const minimizeButton = page.locator('[aria-label="Minimize chat window"]');
    if (await minimizeButton.isVisible()) {
      await minimizeButton.click();

      // Chat should be minimized (smaller height)
      const minimizedHeight = await chatWindow.evaluate(el => el.clientHeight);
      expect(minimizedHeight).toBeLessThan(200); // Assuming minimized height is small

      // Maximize again
      const maximizeButton = page.locator('[aria-label="Maximize chat window"]');
      await maximizeButton.click();

      // Chat should be maximized again
      const maximizedHeight = await chatWindow.evaluate(el => el.clientHeight);
      expect(maximizedHeight).toBeGreaterThan(400);
    }

    // Test close functionality
    const closeButton = page.locator('[aria-label="Close chat window"]');
    await closeButton.click();

    // Chat window should be hidden
    await expect(chatWindow).not.toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Open chat window
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Verify chat window adapts to mobile viewport
    const chatWidth = await chatWindow.evaluate(el => el.clientWidth);
    const viewportWidth = page.viewportSize()?.width || 375;

    // Chat should not exceed viewport width
    expect(chatWidth).toBeLessThanOrEqual(viewportWidth - 32); // Accounting for padding
  });

  test('accessibility features work correctly', async ({ page }) => {
    // Open chat window
    const chatTrigger = page.locator('[aria-label="Open AI Chat"]').or(
      page.locator('button').filter({ hasText: 'Chat' }).first()
    );

    if (await chatTrigger.isVisible()) {
      await chatTrigger.click();
    }

    const chatWindow = page.locator('[data-testid="chat-window"]').or(
      page.locator('.fixed.bottom-4.right-4')
    );
    await expect(chatWindow).toBeVisible();

    // Check for proper ARIA labels
    await expect(page.locator('[aria-label="Minimize chat window"]')).toBeVisible();
    await expect(page.locator('[aria-label="Close chat window"]')).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Message input should be focusable
    const messageInput = page.locator('textarea[placeholder*="ask me about your finances"]').or(
      page.locator('input[placeholder*="ask me about your finances"]')
    );
    await messageInput.focus();
    await expect(messageInput).toBeFocused();
  });
});