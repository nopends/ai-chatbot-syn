import { expect, test } from '../fixtures';
import { ChatPage } from '../pages/chat';
import { ArtifactPage } from '../pages/artifact';

test.describe('Artifacts activity', () => {
  let chatPage: ChatPage;
  let artifactPage: ArtifactPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    artifactPage = new ArtifactPage(page);

    await chatPage.createNewChat();
  });

  test('Create a text artifact', async () => {
    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await chatPage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await chatPage.hasChatIdInUrl();
  });

  test('Toggle artifact visibility', async () => {
    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await chatPage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await artifactPage.closeArtifact();
    await chatPage.isElementNotVisible('artifact');
  });

  test('Send follow up message after generation', async () => {
    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      'Help me write an essay about Silicon Valley',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await artifactPage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await artifactPage.sendUserMessage('Thanks!');
    await artifactPage.isGenerationComplete();

    const secondAssistantMessage = await chatPage.getRecentAssistantMessage();
    expect(secondAssistantMessage.content).toBe("You're welcome!");
  });

  test('Create a notes artifact', async () => {
    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      'Create structured notes about machine learning basics',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    const assistantMessage = await chatPage.getRecentAssistantMessage();
    expect(assistantMessage.content).toBe(
      'A document was created and is now visible to the user.',
    );

    await chatPage.hasChatIdInUrl();
  });

  test('Notes artifact toolbar actions', async () => {
    await chatPage.createNewChat();

    await chatPage.sendUserMessage(
      'Create structured notes about machine learning basics',
    );
    await artifactPage.isGenerationComplete();

    expect(artifactPage.artifact).toBeVisible();

    // Test toolbar actions specific to notes
    const toolbarButtons = await artifactPage.getToolbarButtons();
    expect(toolbarButtons.length).toBeGreaterThan(0);

    // Click on "Add key takeaways" button if it exists
    const keyTakeawaysButton =
      await artifactPage.getToolbarButtonByDescription('Add key takeaways');
    if (keyTakeawaysButton) {
      await keyTakeawaysButton.click();
      await artifactPage.isGenerationComplete();

      // Verify the artifact was updated
      expect(artifactPage.artifact).toBeVisible();
    }
  });
});
