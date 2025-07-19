let recentTabs = [];
let lastWindowId = null;

// Load persisted state on startup
chrome.storage.local.get(['recentTabs', 'lastWindowId'], (result) => {
  if (result.recentTabs) {
    recentTabs = result.recentTabs;
  }
  if (result.lastWindowId) {
    lastWindowId = result.lastWindowId;
  }
});

// Function to persist state
function persistState() {
  chrome.storage.local.set({
    recentTabs: recentTabs,
    lastWindowId: lastWindowId
  });
}

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    // Get the current active tab in the newly focused window
    const [activeTab] = await chrome.tabs.query({ active: true, windowId: windowId });
    if (activeTab) {
      // If we switched windows, update the list
      if (lastWindowId && lastWindowId !== windowId) {
        // Move the active tab of the new window to the front
        recentTabs = recentTabs.filter(id => id !== activeTab.id);
        recentTabs.unshift(activeTab.id);
        if (recentTabs.length > 10) {
          recentTabs = recentTabs.slice(0, 10);
        }
        persistState();
      }
      lastWindowId = windowId;
    }
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Always update the recent tabs list
  recentTabs = recentTabs.filter(id => id !== activeInfo.tabId);
  recentTabs.unshift(activeInfo.tabId);
  if (recentTabs.length > 10) {
    recentTabs = recentTabs.slice(0, 10);
  }

  // Update last window ID
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab) {
      lastWindowId = tab.windowId;
    }
  } catch (e) {
    console.error('Error getting tab info:', e);
  }

  persistState();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  recentTabs = recentTabs.filter(id => id !== tabId);
  persistState();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "switch-tabs") {
    try {
      // Get current tab to ensure we have the right window context
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!currentTab) {
        console.error('No active tab found in current window');
        return;
      }

      // Debug logging
      console.log('Current tab:', currentTab.id, 'Recent tabs:', recentTabs);

      // Find the most recent tab that's not the current one
      let switched = false;
      for (let i = 0; i < recentTabs.length; i++) {
        if (recentTabs[i] !== currentTab.id) {
          const success = await switchToTabAtIndex(i);
          if (success) {
            switched = true;
            break;
          }
        }
      }

      if (!switched) {
        console.log('No suitable tab found to switch to');
      }
    } catch (error) {
      console.error('Error in switch-tabs command:', error);
    }
  }
});

async function switchToTabAtIndex(targetIndex) {
  try {
    const tab = await chrome.tabs.get(recentTabs[targetIndex]);
    if (tab) {
      // Also focus the window if it's different
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (currentTab && tab.windowId !== currentTab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      await chrome.tabs.update(recentTabs[targetIndex], { active: true });
      return true;
    }
  } catch (e) {
    // Tab doesn't exist, remove it from the list
    recentTabs = recentTabs.filter(id => id !== recentTabs[targetIndex]);
  }
  return false;
}

chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
  recentTabs = tabs.map(tab => tab.id);

  // Set initial window
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    lastWindowId = activeTab.windowId;
  }

  persistState();
});