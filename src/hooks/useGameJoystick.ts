import { useEffect, useRef } from 'react';
import nipplejs, { JoystickManager } from 'nipplejs';

interface UseGameJoystickOptions {
  isGameActive: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (x: number, z: number) => void;
  enabled?: boolean;
}

export function useGameJoystick({
  isGameActive,
  containerRef,
  onMove,
  enabled = true,
}: UseGameJoystickOptions) {
  const joystickManagerRef = useRef<JoystickManager | null>(null);
  const movementRef = useRef({ x: 0, z: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isGameActive || !enabled || !containerRef.current) return;

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

      const moveSpeed = 0.1; // Units per frame
      const force = Math.min(data.force, 1); // Clamp to max 1

      // Map joystick coordinates to game world
      // Joystick Y-up = Game Z-forward
      // Joystick X-right = Game X-right
      movementRef.current.x = data.vector.x * moveSpeed * force;
      movementRef.current.z = data.vector.y * moveSpeed * force;
    });

    // Handle joystick end (reset movement)
    manager.on('end', () => {
      movementRef.current.x = 0;
      movementRef.current.z = 0;
    });

    // Animation loop for smooth movement
    const updateMovement = () => {
      if (movementRef.current.x !== 0 || movementRef.current.z !== 0) {
        onMove(movementRef.current.x, movementRef.current.z);
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
      movementRef.current = { x: 0, z: 0 };
    };
  }, [isGameActive, enabled, containerRef, onMove]);

  return {
    isActive: !!joystickManagerRef.current,
  };
}
