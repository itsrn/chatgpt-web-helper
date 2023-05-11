// This is the default background page prompt
let prompt = "Explain the above text/code/data/etc. in a few sentences.";

// This adds to the context menu on text selection the part for our extension
chrome.contextMenus.create({
  title: 'Ask ChatGPT about "%s"',
  id: "chatgpt-web-helper",
  contexts: ["selection"],
});

// Get template prompt from popup.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "updatePrompt") {
    prompt = message.prompt;
    // Store the new prompt value in the storage API
    chrome.storage.sync.set({
      prompt: prompt,
    });
  }
});

// Load the prompt value from storage when the background script starts
chrome.storage.sync.get(
  {
    prompt: prompt,
  },
  function (items) {
    prompt = items.prompt;
  }
);

// Populate prompt text box and simulate "Enter" key press event to submit the prompt automatically
function injectedFunction(selectedText, prompt) {
  const textarea = document.querySelector("textarea");
  textarea.innerText = `${selectedText}
    ${prompt}`;
  // Creates the keyboard enter event
  const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    keyCode: 13,
    bubbles: true,
    cancelable: true,
  });
  textarea.dispatchEvent(enterEvent);
}

// Open ChatGPT in new tab and inject function when context menu is clicked
chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === "chatgpt-web-helper") {
    const selectedText = info.selectionText;
    chrome.tabs.create(
      {
        url: "https://chat.openai.com/",
        // Currently, this is the only link that is working quite good for that extension.
      },
      function (newTab) {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === newTab.id && changeInfo.status === "complete") {
            setTimeout(() => {
              chrome.scripting.executeScript({
                target: {
                  tabId: newTab.id,
                },
                func: injectedFunction,
                args: [selectedText, prompt],
              });
            }, 1000);
          }
        });
      }
    );
  }
});
