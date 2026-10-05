const R = 8.314462618; // J mol⁻¹ K⁻¹

/**
 * Convert Celsius to Kelvin.
 */
export function celsiusToKelvin(temperatureC) {
  return temperatureC + 273.15;
}

/**
 * Ideal gas law:
 *
 * P = nRT / V
 *
 * Inputs:
 *   n = mol
 *   T = °C
 *   V = L
 *
 * Output:
 *   pressure in hPa
 */
export function pressureFromIdealGas(
  moles,
  temperatureC,
  volumeL
) {
  const temperatureK = celsiusToKelvin(temperatureC);

  // Convert L -> m³
  const volumeM3 = volumeL / 1000;

  // Pa
  const pressurePa =
    (moles * R * temperatureK) / volumeM3;

  // Pa -> hPa
  return pressurePa / 100;
}

/**
 * Calculate gas density.
 *
 * rho = m / V
 *
 * For now we approximate the gas as dry air.
 */
export function airDensity(
  pressureHpa,
  temperatureC
) {
  const Rd = 287.05; // J kg⁻¹ K⁻¹
  const temperatureK = celsiusToKelvin(temperatureC);
  const pressurePa = pressureHpa * 100;

  return pressurePa / (Rd * temperatureK);
}