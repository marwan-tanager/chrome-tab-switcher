# Chrome Tab Switcher

A lightweight Chrome extension that provides instant MRU (Most Recently Used) tab switching with a single keyboard shortcut, similar to Alt+Tab functionality in operating systems.

## Features

- **Instant Tab Switching**: Press `Ctrl+J` (or `Cmd+J` on Mac) to instantly switch to your most recently used tab
- **Cross-Window Support**: Seamlessly switch between tabs across different Chrome windows
- **Persistent History**: Tab history survives browser restarts and service worker suspensions
- **Smart Window Focus**: Automatically focuses the correct window when switching to a tab in a different window
- **Minimal Footprint**: No UI elements, just a simple keyboard shortcut that works in the background

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## Usage

Simply press `Ctrl+J` (Windows/Linux) or `Cmd+J` (Mac) to switch to your most recently used tab. The extension maintains a history of your last 10 tabs and intelligently handles:

- Tabs that have been closed (automatically removed from history)
- Multiple browser windows (switches focus as needed)
- Browser restarts (history is preserved)

## How It Works

The extension tracks tab activation events and maintains an ordered list of recently used tabs. When you press the keyboard shortcut, it:

1. Finds the most recent tab that isn't the current one
2. Switches to that tab (and its window if different)
3. Updates the history for future switches

## Technical Details

- Built with Manifest V3
- Uses Chrome's `tabs`, `windows`, and `storage` APIs
- Implements a service worker for background processing
- Stores up to 10 recent tabs to balance functionality with performance

## Permissions

The extension requires the following permissions:
- `tabs`: To access tab information and switch between tabs
- `windows`: To handle multi-window scenarios
- `storage`: To persist tab history across sessions

## License

MIT License - feel free to modify and distribute as needed.