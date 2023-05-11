let templatePromptInput = document.getElementById("template-prompt");
let saveButton = document.getElementById("save-btn");

// Set placeholder text to current template prompt
chrome.storage.local.get("prompt", ({ prompt }) => {
  if (prompt) {
    templatePromptInput.placeholder = prompt;
  }
});

saveButton.addEventListener("click", () => {
  // Update prompt variable
  let templatePrompt = templatePromptInput.value;
  // Store it locally
  chrome.storage.local.set({
    prompt: templatePrompt,
  });
  // Send it to the background.js file
  chrome.runtime.sendMessage({
    type: "updatePrompt",
    prompt: templatePrompt,
  });

  // Update HTML elements accordingly
  templatePromptInput.placeholder = templatePrompt;
  templatePromptInput.value = "";
  templatePromptInput.focus();
});

// Simulate clicking "Save Changes" button on enter key press
templatePromptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveButton.click();
  }
});
