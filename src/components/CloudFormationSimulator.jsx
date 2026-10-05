import { useEffect, useRef, useState } from "react";

// PHYSICS + CSS
import "./cloudFormationSimulator.css";
import { pressureFromIdealGas } from "./physics/gas";

const INITIAL_STATE = {
  temperature: 20, // °C
  volume: 1.0, // L
  moles: 0.041, // mol
};

const MIN_TEMPERATURE = -20;
const MAX_TEMPERATURE = 50;

const MIN_VOLUME = 0.5;
const MAX_VOLUME = 2.0;

const MIN_MOLES = 0.01;
const MAX_MOLES = 0.08;

function CloudFormationSimulator() {
  const [temperature, setTemperature] = useState(
    INITIAL_STATE.temperature
  );

  const [volume, setVolume] = useState(INITIAL_STATE.volume);

  const [moles, setMoles] = useState(INITIAL_STATE.moles);

  // Used later for the time-series history.
  const [history, setHistory] = useState([]);

  const simulationTime = useRef(0);
  const lastRecordedState = useRef(null);

  const pressure = pressureFromIdealGas(
    moles,
    temperature,
    volume
  );

  /*
   * --------------------------------------------------
   * Record state
   * --------------------------------------------------
   *
   * We already store a time history, even though the
   * graph is intentionally not implemented yet.
   *
   * This means adding Recharts later will be trivial.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      simulationTime.current += 1;

      const newState = {
        time: simulationTime.current,
        temperature,
        volume,
        moles,
        pressure,
      };

      setHistory((previous) => {
        const updated = [...previous, newState];

        // Keep the last 120 seconds for now.
        return updated.slice(-120);
      });

      lastRecordedState.current = newState;
    }, 1000);

    return () => clearInterval(timer);
  }, [temperature, volume, moles, pressure]);

  const resetSimulation = () => {
    setTemperature(INITIAL_STATE.temperature);
    setVolume(INITIAL_STATE.volume);
    setMoles(INITIAL_STATE.moles);

    simulationTime.current = 0;
    lastRecordedState.current = null;
    setHistory([]);
  };

  return (
    <section className="cloud-simulator">

      <div className="cloud-simulator-header">
        <h2>Cloud Formation Simulator</h2>

        <p>
          Explore how temperature, volume, pressure and the
          amount of air interact inside a closed container.
        </p>
      </div>

      <div className="simulator-layout">

        {/* ==========================================
            BOTTLE
        ========================================== */}

        <div className="bottle-panel">

          <div className="bottle">

            <div className="bottle-neck" />

            <div
              className="bottle-chamber"
              style={{
                "--bottle-volume":
                  (volume / MAX_VOLUME) * 100 + "%",
              }}
            >

              {/* Gas particles */}
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className="gas-particle"
                  style={{
                    "--particle-x":
                      `${15 + ((index * 37) % 70)}%`,
                    "--particle-y":
                      `${15 + ((index * 53) % 70)}%`,
                    "--particle-delay":
                      `${(index % 6) * -0.4}s`,
                  }}
                />
              ))}

              <div className="bottle-label">
                <span>Air</span>
                <strong>{temperature.toFixed(1)} °C</strong>
              </div>

            </div>

          </div>

          <div className="bottle-caption">
            Closed container
          </div>

        </div>


        {/* ==========================================
            CONTROLS
        ========================================== */}

        <div className="controls-panel">

          <h3>Controls</h3>

          {/* Temperature */}

          <div className="control-group">

            <div className="control-header">
              <label htmlFor="temperature">
                Temperature
              </label>

              <span>
                {temperature.toFixed(1)} °C
              </span>
            </div>

            <input
              id="temperature"
              type="range"
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step="0.5"
              value={temperature}
              onChange={(event) =>
                setTemperature(Number(event.target.value))
              }
            />

          </div>


          {/* Volume */}

          <div className="control-group">

            <div className="control-header">
              <label htmlFor="volume">
                Volume
              </label>

              <span>
                {volume.toFixed(2)} L
              </span>
            </div>

            <input
              id="volume"
              type="range"
              min={MIN_VOLUME}
              max={MAX_VOLUME}
              step="0.01"
              value={volume}
              onChange={(event) =>
                setVolume(Number(event.target.value))
              }
            />

          </div>


          {/* Moles */}

          <div className="control-group">

            <div className="control-header">
              <label htmlFor="moles">
                Amount of air
              </label>

              <span>
                {moles.toFixed(3)} mol
              </span>
            </div>

            <input
              id="moles"
              type="range"
              min={MIN_MOLES}
              max={MAX_MOLES}
              step="0.001"
              value={moles}
              onChange={(event) =>
                setMoles(Number(event.target.value))
              }
            />

          </div>


          <button
            className="reset-button"
            onClick={resetSimulation}
          >
            Reset simulation
          </button>

        </div>


        {/* ==========================================
            OUTPUTS
        ========================================== */}

        <div className="outputs-panel">

          <h3>Current State</h3>

          <div className="output-grid">

            <div className="output-card">
              <span>Temperature</span>
              <strong>
                {temperature.toFixed(1)} °C
              </strong>
            </div>

            <div className="output-card">
              <span>Pressure</span>
              <strong>
                {pressure.toFixed(0)} hPa
              </strong>
            </div>

            <div className="output-card">
              <span>Volume</span>
              <strong>
                {volume.toFixed(2)} L
              </strong>
            </div>

            <div className="output-card">
              <span>Amount of air</span>
              <strong>
                {moles.toFixed(3)} mol
              </strong>
            </div>

          </div>

          <div className="equation-box">

            <span>Ideal gas equation</span>

            <strong>
              PV = nRT
            </strong>

            <p>
              Pressure is calculated from the current
              temperature, volume and amount of air.
            </p>

          </div>

        </div>

      </div>


      {/* ==========================================
          TIME SERIES
      ========================================== */}

      <div className="history-panel">

        <div className="history-header">
          <div>
            <h3>Simulation History</h3>
            <p>
              {history.length > 0
                ? `Simulation time: ${simulationTime.current} s`
                : "The time-series plot will appear here."
              }
            </p>
          </div>

          <div className="history-status">
            {history.length} samples
          </div>
        </div>

        <div className="chart-placeholder">

          <span>
            Time-series visualization
          </span>

          <small>
            T · P · V · n
          </small>

        </div>

      </div>

    </section>
  );
}

export default CloudFormationSimulator;