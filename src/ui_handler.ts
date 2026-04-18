import { SimulationProperties } from "./simulation_properties"

document.addEventListener('DOMContentLoaded', () => {
	handleGravityInput();
	handleMassInput(true);
	handleMassInput(false);
	handleLengthInput(true);
	handleLengthInput(false);
});

function handleGravityInput(): void {
	const gravityInput: HTMLInputElement = document.querySelector<HTMLInputElement>("#gravity-input") as HTMLInputElement;
	const valueDisplay: HTMLSpanElement = document.querySelector<HTMLSpanElement>("#gravity-value-display") as HTMLSpanElement;

	gravityInput.addEventListener("change", () => {
		SimulationProperties.gravity = gravityInput.valueAsNumber;
		valueDisplay.textContent = `${SimulationProperties.gravity}m/s`;
	});
}

function handleMassInput(isArm1: boolean): void {
	const query = isArm1 ? "#mass1-input" : "#mass2-input";
	const input: HTMLInputElement = document.querySelector<HTMLInputElement>(query) as HTMLInputElement;
	const valueDisplay: HTMLSpanElement = document.querySelector<HTMLSpanElement>(`${query} ~ .value-display`) as HTMLSpanElement

	input.addEventListener("change", () => {
		const value: number = Math.max(1, Math.min(10, input.valueAsNumber));

		if(isArm1)
			SimulationProperties.mass1 = value;
		else
			SimulationProperties.mass2 = value;

		valueDisplay.textContent = `${value}kg`;
	});
}

function handleLengthInput(isArm1: boolean): void {
	const query = isArm1 ? "#length1-input" : "#length2-input";
	const input: HTMLInputElement = document.querySelector<HTMLInputElement>(query) as HTMLInputElement;
	const valueDisplay: HTMLSpanElement = document.querySelector<HTMLSpanElement>(`${query} ~ .value-display`) as HTMLSpanElement

	input.addEventListener("change", () => {
		const value: number = Math.max(0.1, Math.min(10, input.valueAsNumber));

		if(isArm1)
			SimulationProperties.length1 = value;
		else
			SimulationProperties.length2 = value;

		valueDisplay.textContent = `${value}m`;
	});
}
