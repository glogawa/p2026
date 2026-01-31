import { useEffect, useRef } from 'react';
import nipplejs, { JoystickManager } from 'nipplejs';

interface UseGameJoystickOptions {
  isGameActive: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (x: number, z: number) => void;
  enabled?: boolean;
}

// Detect if device is mobile
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function useGameJoystick({
  isGameActive,
  containerRef,
  onMove,
  enabled = true,
}: UseGameJoystickOptions) {
  const joystickManagerRef = useRef<JoystickManager | null>(null);
  const joystickStateRef = useRef({ x: 0, y: 0, active: false });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only create joystick on mobile devices
    if (!isMobileDevice() || !isGameActive || !enabled || !containerRef.current) return;

    // Create joystick
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { right: '80px', bottom: '80px' },
      color: 'rgba(255, 255, 255, 0.5)',
      size: 120,
      threshold: 0.1,
    });

    joystickManagerRef.current = manager;

    // Handle joystick movement
    manager.on('move', (evt, data) => {
      if (!data.vector) return;

      const force = Math.min(data.force, 1); // Clamp to max 1

      // Store joystick input as x (rotate) and y (forward/backward)
      // Joystick X-right = rotation
      // Joystick Y-up = forward movement
      joystickStateRef.current.x = data.vector.x * force; // rotation
      joystickStateRef.current.y = data.vector.y * force; // forward/backward
      joystickStateRef.current.active = true;
    });

    // Handle joystick end (reset movement)
    manager.on('end', () => {
      joystickStateRef.current.x = 0;
      joystickStateRef.current.y = 0;
      joystickStateRef.current.active = false;
    });

    // Animation loop for smooth movement
    const updateMovement = () => {
      if (joystickStateRef.current.active) {
        // Send both x (rotation) and y (forward/backward) to emulate WASD behavior
        onMove(joystickStateRef.current.x, joystickStateRef.current.y);
      } else {
        // Send zeros when not active
        onMove(0, 0);
      }
      animationFrameRef.current = requestAnimationFrame(updateMovement);
    };

    animationFrameRef.current = requestAnimationFrame(updateMovement);

    // Cleanup
    return () => {
      if (joystickManagerRef.current) {
        joystickManagerRef.current.destroy();
        joystickManagerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      joystickStateRef.current = { x: 0, y: 0, active: false };
    };
  }, [isGameActive, enabled, containerRef, onMove]);

  return {
    isActive: !!joystickManagerRef.current,
  };
}
