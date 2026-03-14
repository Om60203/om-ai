# Om.ai

## Current State
Om.ai is a full-stack AI chat app with backend-proxied NVIDIA NIM API, mock AI fallback, voice input/output (Hindi/English), animated robot mascot, guest mode, user auth, admin panel. ChatPage has a textarea input with mic and send buttons.

## Requested Changes (Diff)

### Add
- "Voice Mode" button in ChatPage input area (next to mic button)
- New VoiceModePage: full-screen immersive page with Doraemon-style animated character
- Character animates (pulse/bounce) when listening and when speaking
- Pure voice interaction: user speaks -> AI responds with voice (no text typing needed)
- Hindi/English language toggle on VoiceModePage
- Special command handling:
  - "open youtube" / "youtube kholo" -> window.open YouTube in new tab
  - "screenshot", "phone off", "camera", device commands -> polite "I can't do that on web" response
- Back button to return to ChatPage
- Transcript shown as floating text bubbles (user speech + AI response text)
- AI responses fetched via same getDeepSeekResponse + getMockResponse pipeline

### Modify
- ChatPage.tsx: add Voice Mode button in input toolbar
- App.tsx: add "voice-mode" view state, pass navigation to ChatPage

### Remove
- Nothing removed

## Implementation Plan
1. Create VoiceModePage.tsx with animated Doraemon character, voice loop, command handler
2. Add Voice Mode button to ChatPage input area
3. Update App.tsx to route to VoiceModePage
