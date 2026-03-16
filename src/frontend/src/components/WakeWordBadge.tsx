interface WakeWordBadgeProps {
  isListening: boolean;
  onTrigger: () => void;
  supported: boolean;
}

export function WakeWordBadge({
  isListening: _isListening,
  onTrigger: _onTrigger,
  supported: _supported,
}: WakeWordBadgeProps) {
  // Badge is intentionally hidden — wake word listener runs in background via ChatPage
  return null;
}
