# Om.ai

## Current State
- App has a visible WakeWordBadge green button at top/bottom-right that shows even without "Suno Om" command
- SunoOmOverlay is the bottom-sheet wake word UI with voice commands
- VoiceModePage has 25+ app-opening voice commands
- ChatPage has STT mic input
- No screenshot or "copy all text" voice commands exist yet

## Requested Changes (Diff)

### Add
- Screenshot voice command: When user says "screenshot lo" or "screenshot" in SunoOmOverlay or VoiceModePage, use browser's built-in screen capture approach (window.print() or html2canvas if available, otherwise open browser print dialog)
- "Copy all text" voice command: When user says "copy all text", "saara text copy karo", "copy karo saara text" etc. in SunoOmOverlay, copy all chat messages (passed as prop) to clipboard and confirm via voice
- "Copy all text" voice command in ChatPage's STT mic handler: detect this phrase and copy all messages

### Modify
- WakeWordBadge: Remove the visible button/badge entirely. Keep ONLY the background SpeechRecognition listener for "Suno Om" wake word. The component should render nothing (return null for JSX) but keep the useEffect listener logic intact.
- SunoOmOverlay: Accept optional `messages` prop (array of {role, content}) from ChatPage. Add screenshot and copy-all-text commands.
- ChatPage: Pass current conversation messages to SunoOmOverlay as prop. In STT mic handler, detect "copy all text" phrase and copy all messages to clipboard.
- VoiceModePage: Add screenshot voice command in handleSpecialCommand.

### Remove
- The visible green pulsing badge/button from WakeWordBadge

## Implementation Plan
1. Edit WakeWordBadge.tsx - remove JSX button, keep only speech recognition listener that triggers onActivate
2. Edit SunoOmOverlay.tsx - add `messages?: Array<{role:string, content:string}>` prop, add screenshot command (window.print()), add copy-all-text command using navigator.clipboard.writeText
3. Edit ChatPage.tsx - pass messages to SunoOmOverlay, detect "copy all text" in STT handler
4. Edit VoiceModePage.tsx - add screenshot command in handleSpecialCommand
