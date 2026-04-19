import { SimulationProperties } from "./simulation_properties"

document.addEventListener('DOMContentLoaded', () => {
	handleGravityInput();
	handlePivotFrictionInput();
	handleMassInput(true);
	handleMassInput(false);
	handleLengthInput(true);
	handleLengthInput(false);
});

function handleGravityInput(): void {
	const [input, valueDisplay] = getInputAndDisplay("gravity-input");

	input.addEventListener("input", () => {
		SimulationProperties.gravity = input.valueAsNumber;
		valueDisplay.textContent = `${SimulationProperties.gravity}m/s`;
	});
}

function handlePivotFrictionInput(): void {
	const [input, valueDisplay] = getInputAndDisplay("friction-input");

	input.addEventListener("input", () => {
		SimulationProperties.pivotFriction = input.valueAsNumber;
		valueDisplay.textContent = `${SimulationProperties.pivotFriction}N⋅m⋅s/rad`;
	});
}

function handleMassInput(isArm1: boolean): void {
	const [input, valueDisplay] = getInputAndDisplay(isArm1 ? "mass1-input" : "mass2-input");

	input.addEventListener("input", () => {
		const value: number = Math.max(1, Math.min(10, input.valueAsNumber));

		if(isArm1)
			SimulationProperties.mass1 = value;
		else
			SimulationProperties.mass2 = value;

		valueDisplay.textContent = `${value}kg`;
	});
}

function handleLengthInput(isArm1: boolean): void {
	const [input, valueDisplay] = getInputAndDisplay(isArm1 ? "length1-input" : "length2-input");

	input.addEventListener("input", () => {
		const value: number = Math.max(0.1, Math.min(10, input.valueAsNumber));

		if(isArm1)
			SimulationProperties.length1 = value;
		else
			SimulationProperties.length2 = value;

		valueDisplay.textContent = `${value}m`;
	});
}

function getInputAndDisplay(inputId: string): [HTMLInputElement, HTMLSpanElement] {
	const input: HTMLInputElement = document.getElementById(inputId) as HTMLInputElement;
	const display: HTMLSpanElement = document.querySelector(`#${inputId} ~ .value-display`) as HTMLSpanElement;
	return [input, display];
}
