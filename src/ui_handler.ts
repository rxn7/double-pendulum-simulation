import { SimulationProperties } from "./simulation_properties"

document.addEventListener('DOMContentLoaded', () => {
	handlePauseButton();
	handleGravityInput();
	handlePivotFrictionInput(true);
	handlePivotFrictionInput(false);
	handleMassInput(true);
	handleMassInput(false);
	handleLengthInput(true);
	handleLengthInput(false);
});

function handlePauseButton(): void {
	const btn: HTMLButtonElement  = document.getElementById("pause-btn") as HTMLButtonElement;

	btn.addEventListener("click", () => {
		console.log("test");
		SimulationProperties.isPaused = !SimulationProperties.isPaused;
		btn.textContent = SimulationProperties.isPaused ? "Wznów symulację" : "Zatrzymaj symulację";
	});
}

function handleGravityInput(): void {
	const [input, valueDisplay] = getInputAndDisplay("gravity-input");

	input.addEventListener("input", () => {
		SimulationProperties.gravity = input.valueAsNumber;
		valueDisplay.textContent = `${SimulationProperties.gravity}m/s²`;
	});
}

function handlePivotFrictionInput(isArm1: boolean): void {
	const [input, valueDisplay] = getInputAndDisplay(isArm1 ? "friction1-input" : "friction2-input");

	input.addEventListener("input", () => {
		const value: number = input.valueAsNumber;

		if(isArm1)
			SimulationProperties.pivotFriction1 = value;
		else
			SimulationProperties.pivotFriction2 = value;
		
		valueDisplay.textContent = `${value}N⋅m⋅s/rad`;
	});
}

function handleMassInput(isMass1: boolean): void {
	const [input, valueDisplay] = getInputAndDisplay(isMass1 ? "mass1-input" : "mass2-input");

	input.addEventListener("input", () => {
		const value: number = Math.max(1, Math.min(10, input.valueAsNumber));

		if(isMass1)
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
