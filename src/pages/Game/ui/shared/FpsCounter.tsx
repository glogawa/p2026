import './FpsCounter.css';

interface FpsCounterProps {
  fps: number;
}

export function FpsCounter({ fps }: FpsCounterProps) {
  return <div className="fps-counter">{fps} FPS</div>;
}
