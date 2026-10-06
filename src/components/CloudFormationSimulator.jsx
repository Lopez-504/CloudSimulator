import { useEffect, useRef, useState } from "react"; 

// COMPONENTS 
import GasHistoryChart from "./GasHistoryChart"; 

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
const MAX_VOLUME = 3.0; 
const MIN_MOLES = 0.01; 
const MAX_MOLES = 0.08; 

// Visual particle limits. 
// These are NOT physical particle numbers. 

const MIN_PARTICLES = 10; 
const MAX_PARTICLES = 200; 

//  // COMPONENT // ===  //  
function CloudFormationSimulator() { 
    
// TEMPERATURE / VOLUME / MOLES // 

const [temperature, setTemperature] = useState( INITIAL_STATE.temperature ); 
const [volume, setVolume] = useState( INITIAL_STATE.volume ); 
const [moles, setMoles] = useState( INITIAL_STATE.moles ); 

// ==// PARTICLES // == 

const [particles, setParticles] = useState([]); 

// Convert amount of air into a visual number // of particles. // // 0.01 mol -> 10 particles // 0.08 mol -> 200 particles  

const particleCount = Math.round( MIN_PARTICLES + ((moles - MIN_MOLES) / (MAX_MOLES - MIN_MOLES)) * (MAX_PARTICLES - MIN_PARTICLES) ); 

//  // BOTTLE SIZE // ==  
const bottleWidth = 170 + ((volume - 0.5) / 1.4) * 100; 
const bottleHeight = 310 + ((volume - 0.5) / 1.5) * 80; 

// === // HISTORY // == 
const [history, setHistory] = useState([]); 
const simulationTime = useRef(0); 
const lastRecordedState = useRef(null); 

// == // PHYSICS // ===  
const pressure = pressureFromIdealGas( moles, temperature, volume ); 

/* * Temperature-dependent particle speed. * * We use absolute temperature (Kelvin) because * molecular kinetic energy depends on absolute * temperature. * * This is currently just a visual scaling factor. */ 

const particleSpeed = Math.sqrt( (temperature + 273.15) / 273.15 ); 

// == CREATE / REMOVE PARTICLES  
useEffect(() => { setParticles((previousParticles) => { 
     // MORE AIR //   
     if (particleCount > previousParticles.length) { 
        const additionalParticles = Array.from( { 
            length: particleCount - previousParticles.length, 
        }, (_, index) => ({ id: previousParticles.length + index, 
        // Random starting position 
        x: Math.random() * 100, y: Math.random() * 100, 
        // Random starting velocity // // Small values keep the initial motion // relatively gentle.
        vx: (Math.random() - 0.5) * 0.45, 
        vy: (Math.random() - 0.5) * 0.45, }) ); 
        return [ ...previousParticles, ...additionalParticles, ]; } 
        // LESS AIR // -- 
        if (particleCount < previousParticles.length) { return previousParticles.slice( 0, particleCount ); } 
        // SAME AMOUNT //  
        return previousParticles; 
});}, [particleCount]); 
        
// PARTICLE ANIMATION 
useEffect(() => { let animationFrame; 
  const animate = () => { 
    setParticles((previousParticles) => { return previousParticles.map((particle) => { 
    
      // MOVE PARTICLE 
      let newX = particle.x + particle.vx * particleSpeed; 
      let newY = particle.y + particle.vy * particleSpeed; 
      
      // Keep velocity immutable.   ?? 
      let newVx = particle.vx; 
      let newVy = particle.vy; 
    
      // LEFT WALL //  
      if (newX <= 0) { newX = 0; newVx = Math.abs(particle.vx); } 
      // RIGHT WALL //  
      if (newX >= 100) { newX = 100; newVx = -Math.abs(particle.vx); } 
      // TOP WALL //  
      if (newY <= 0) { newY = 0; newVy = Math.abs(particle.vy); } 
      // BOTTOM WALL 
      if (newY >= 100) { newY = 100; newVy = -Math.abs(particle.vy); } 
    
      // RETURN UPDATED PARTICLE  
      return { ...particle, x: newX, y: newY, vx: newVx, vy: newVy, }; 
    }); }); 
    
    animationFrame = requestAnimationFrame(animate); }; 
    
    // Start animation 
    animationFrame = requestAnimationFrame(animate); 
    
    // Clean up animation when component // unmounts or particleSpeed changes. 
    return () => { cancelAnimationFrame( animationFrame ); }; 
}, [particleSpeed]);

// RECORD STATE  
useEffect(() => { 
  const timer = setInterval(() => {
    simulationTime.current += 1; 
    const newState = { time: simulationTime.current, temperature, volume, moles, pressure, }; 
    
    setHistory((previous) => { const updated = [ ...previous, newState, ]; 
      // Keep the last 90 seconds. 
      return updated.slice(-90); 
    }); 
    
    lastRecordedState.current = newState; 
  }, 700); 
    
  return () => clearInterval(timer); 
}, [ temperature, volume, moles, pressure, ]); 

// RESET 
const resetSimulation = () => { setTemperature( INITIAL_STATE.temperature ); setVolume( INITIAL_STATE.volume ); setMoles( INITIAL_STATE.moles ); simulationTime.current = 0; lastRecordedState.current = null; setHistory([]); 

// Clear particles. The particle-count effect will immediately recreate the correct number for the initial amount of air. 
setParticles([]); }; 

// RENDER 
return ( 
  <section className="cloud-simulator"> 
  {/* == HEADER == */} 
    <div className="cloud-simulator-header"> 
      <h2> Cloud Formation Simulator </h2> 
      <p> 
        Explore how temperature, volume, pressure and the amount of air interact inside a closed container. 
      </p> 
    </div> 
    <div className="simulator-layout"> 
      {/* == BOTTLE == */} 
      <div className="bottle-panel"> 
        <div className="bottle"> 
          <div className="bottle-neck" /> 
          <div 
            className="gas-bottle" 
            style={{ width: `${bottleWidth}px`, height: `${bottleHeight}px`, }}
          >
            {/* Gas particles */} 
            {particles.map((particle) => ( 
              <div 
                key={particle.id} 
                className="gas-particle" 
                style={{ left: `${particle.x}%`, top: `${particle.y}%`, }} 
              /> ))} 
          </div> 
        </div> 
        <div className="bottle-caption"> 
          Closed container 
        </div> 
      </div> 
      
      {/* == CONTROLS == */} 
      <div className="controls-panel"> 
        <h3> Controls </h3> 
        {/* Temperature */} 
        <div className="control-group"> 
          <div className="control-header"> 
            <label htmlFor="temperature"> 
              Temperature 
            </label> 
            <span> {temperature.toFixed(1)} °C </span> 
          </div> 
          <input 
            id="temperature" 
            type="range" 
            className="slider" 
            min={MIN_TEMPERATURE} 
            max={MAX_TEMPERATURE} 
            step="0.5" 
            value={temperature} 
            onChange={(event) => setTemperature( Number( event.target.value ) ) } 
          /> 
        </div> 
        
        {/* Volume */} 
        <div className="control-group"> 
          <div className="control-header"> 
            <label htmlFor="volume"> Volume </label> 
            <span> {volume.toFixed(2)} L </span> 
          </div> 
          <input 
            id="volume" 
            type="range" 
            min={MIN_VOLUME} 
            max={MAX_VOLUME} 
            step="0.01" 
            value={volume} 
            onChange={(event) => setVolume( Number( event.target.value ) ) } 
          /> 
          </div> 
          
          {/* Moles */} 
          <div className="control-group"> 
            <div className="control-header"> 
              <label htmlFor="moles"> Amount of air </label> 
              <span> {moles.toFixed(3)} mol </span> 
            </div> 
            <input 
              id="moles" 
              type="range" 
              min={MIN_MOLES} 
              max={MAX_MOLES} 
              step="0.001" 
              value={moles} 
              onChange={(event) => setMoles( Number( event.target.value ) ) } 
            /> 
          </div> 

          <button className="reset-button" onClick={resetSimulation} > 
            Reset simulation 
          </button> 
        </div> 
        
        {/* == OUTPUTS == */} 
        <div className="outputs-panel"> 
          <h3> Current State </h3> 
          <div className="output-grid"> 
            <div className="output-card"> 
              <span> Temperature </span> 
              <strong> {temperature.toFixed(1)} °C </strong> 
            </div> 
            <div className="output-card"> 
              <span> Pressure </span> 
              <strong> {pressure.toFixed(0)} hPa </strong> 
            </div> 
            <div className="output-card"> 
              <span> Volume </span> 
              <strong> {volume.toFixed(2)} L </strong> 
            </div> 
            <div className="output-card"> 
              <span> Amount of air </span> 
              <strong> {moles.toFixed(3)} mol </strong> 
            </div> 
          </div> 
          <div className="equation-box"> 
            <span> Ideal gas equation </span> 
            <strong> PV = nRT </strong> 
            <p> Pressure is calculated from the current temperature, volume and amount of air. </p>
          </div> 
        </div> 
      </div> 
      
      {/* == TIME SERIES == */}
      <div className="history-panel"> 
        <div className="history-header"> 
          <div> 
            <h3> Simulation History </h3> 
            <p> 
              {history.length > 0 ? `Simulation time: ${simulationTime.current} s` : "The time-series plot will appear here." } 
            </p> 
          </div> 
          <div className="history-status"> 
            {history.length} samples 
          </div> 
        </div> 
        <div className="chart-placeholder"> 
          <GasHistoryChart history={history} /> 
        </div> 
      </div> 
    </section> ); } 

export default CloudFormationSimulator;