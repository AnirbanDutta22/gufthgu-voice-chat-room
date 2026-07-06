const AudioBars = ({ active = true, color = "#f59e0b" }) => {
  if (!active) {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full opacity-20"
            style={{ height: 4, background: color }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="audio-bar" style={{ background: color }} />
      ))}
    </div>
  );
};

export default AudioBars;
