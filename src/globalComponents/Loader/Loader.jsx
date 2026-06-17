import "./Loader.css";

// Branded full-screen loader — Leadnator logo pulsing inside a spinning ring.
export default function Loader({ label = "Loading…", fullscreen = true }) {
  return (
    <div className={`ldn-loader${fullscreen ? " ldn-loader--full" : ""}`}>
      <div className="ldn-loader__ring">
        <span className="ldn-loader__spin" />
        <img src="/leadnator_logo.png" alt="Leadnator" className="ldn-loader__logo" />
      </div>
      {label && <div className="ldn-loader__text">{label}</div>}
    </div>
  );
}
