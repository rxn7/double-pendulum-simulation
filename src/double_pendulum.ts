import { SimulationProperties } from "./simulation_properties";

export interface PendulumArmState {
	angle: number;
	angularVelocity: number;
};

export class DoublePendulum {
	constructor(
		public originX: number, 
		public originY: number, 
		public arm1: PendulumArmState, 
		public arm2: PendulumArmState
	) {
	}

	public update(deltaTime: number): void {
		const angleDelta: number = this.arm1.angle - this.arm2.angle;
		const adjustedMass: number = 2 * SimulationProperties.mass1 + SimulationProperties.mass2;
		const commonDenominatorFactor: number = adjustedMass - SimulationProperties.mass2 * Math.cos(2 * this.arm1.angle - 2 * this.arm2.angle);

		const arm1AngularAcceleration: number = this.calculateArm1AngularAcceleration(angleDelta, adjustedMass, commonDenominatorFactor);
		const arm2AngularAcceleration: number = this.calculateArm2AngularAcceleration(angleDelta, commonDenominatorFactor);

		this.updateArm(this.arm1, arm1AngularAcceleration, deltaTime);
		this.updateArm(this.arm2, arm2AngularAcceleration, deltaTime);
	}

	private updateArm(arm: PendulumArmState, angularAcceleration: number, deltaTime: number): void {
		arm.angularVelocity += angularAcceleration * deltaTime;
		arm.angle += arm.angularVelocity * deltaTime;
	}

	private calculateArm1AngularAcceleration(angleDelta: number, adjustedMass: number, commonDenominatorFactor: number): number {
		const upperGravityPull: number = -SimulationProperties.gravity * adjustedMass * Math.sin(this.arm1.angle);
		const lowerGravityDragOnUpper: number = -SimulationProperties.mass2 * SimulationProperties.gravity * Math.sin(this.arm1.angle - 2 * this.arm2.angle);

		const centrifugalPull: number = -2 * Math.sin(angleDelta) * SimulationProperties.mass2 * (
			(this.arm2.angularVelocity * this.arm2.angularVelocity * SimulationProperties.length2) +
			(this.arm1.angularVelocity * this.arm1.angularVelocity * SimulationProperties.length1 * Math.cos(angleDelta))
		);

		return (upperGravityPull + lowerGravityDragOnUpper + centrifugalPull) / (SimulationProperties.length1 * commonDenominatorFactor);
	}

	private calculateArm2AngularAcceleration(angleDelta: number, commonDenominatorFactor: number): number {
		const totalMass: number = SimulationProperties.mass1 + SimulationProperties.mass2;
		const forceCouplingMultiplier = 2 * Math.sin(angleDelta);

		const centrifugalAndGravityForce =
			(this.arm1.angularVelocity * this.arm1.angularVelocity * SimulationProperties.length1 * totalMass) +
			(SimulationProperties.gravity * totalMass * Math.cos(this.arm1.angle) +
			(this.arm2.angularVelocity * this.arm2.angularVelocity * SimulationProperties.length2 * SimulationProperties.mass2 * Math.cos(angleDelta))
		);

		return (forceCouplingMultiplier * centrifugalAndGravityForce) / (SimulationProperties.length2 * commonDenominatorFactor);
	}
}
