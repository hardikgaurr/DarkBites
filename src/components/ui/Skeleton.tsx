export function Skeleton({ ratio = '4 / 5', lines = 2 }: { ratio?: string; lines?: number }) {
  return (
    <div className="skel" aria-hidden>
      <div className="skel-block shimmer" style={{ aspectRatio: ratio }} />
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skel-line shimmer" style={{ width: i === 0 ? '78%' : '42%' }} />
      ))}
    </div>
  );
}
