import { SimulationProperties } from "./simulation_properties"

document.addEventListener('DOMContentLoaded', () => {
	const gravityInput: HTMLInputElement = document.querySelector<HTMLInputElement>("#gravity-input") as HTMLInputElement
	const gravityValueDisplay: HTMLSpanElement = document.querySelector<HTMLSpanElement>("#gravity-value-display") as HTMLSpanElement

	gravityInput.addEventListener("change", () => {
		SimulationProperties.gravity = gravityInput.valueAsNumber;
		gravityValueDisplay.textContent = `${SimulationProperties.gravity}m/s`;
	});

	const mass1Input: HTMLInputElement = document.querySelector<HTMLInputElement>("#mass1-input") as HTMLInputElement
	const mass2Input: HTMLInputElement = document.querySelector<HTMLInputElement>("#mass2-input") as HTMLInputElement
	const length1Input: HTMLInputElement = document.querySelector<HTMLInputElement>("#length1-input") as HTMLInputElement
	const length2Input: HTMLInputElement = document.querySelector<HTMLInputElement>("#length2-input") as HTMLInputElement
});
