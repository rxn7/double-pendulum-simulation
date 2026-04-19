import { SimulationProperties } from "./simulation_properties";

export interface DoublePendulumState {
	angle1: number;
	angle2: number;
	velocity1: number;
	velocity2: number;
};

export interface DoublePendulumDerivatives {
	velocity1: number;
	velocity2: number;
	acceleration1: number;
	acceleration2: number;
};

export class DoublePendulum {
	public state: DoublePendulumState;

	constructor(public originX: number, public originY: number, angle1: number, angle2: number) {
		this.state = {
			angle1: angle1, 
			angle2: angle2,
			velocity1: 0,
			velocity2: 0
		}
	}

	public update(deltaTime: number): void {
		this.checkAndRecoverState();

		// https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
		const k1: DoublePendulumDerivatives = this.calculateDerivatives(this.state);
		const k2: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k1, deltaTime * 0.5));
		const k3: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k2, deltaTime * 0.5));
		const k4: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k3, deltaTime));

		const scaledDeltaTime = deltaTime / 6.0;

		this.state.angle1 += (k1.velocity1 + 2 * k2.velocity1 + 2 * k3.velocity1 + k4.velocity1) * scaledDeltaTime;
		this.state.angle2 += (k1.velocity2 + 2 * k2.velocity2 + 2 * k3.velocity2 + k4.velocity2) * scaledDeltaTime;
		this.state.velocity1 += (k1.acceleration1 + 2 * k2.acceleration1 + 2 * k3.acceleration1 + k4.acceleration1) * scaledDeltaTime;
		this.state.velocity2 += (k1.acceleration2 + 2 * k2.acceleration2 + 2 * k3.acceleration2 + k4.acceleration2) * scaledDeltaTime;
	
		this.state.angle1 = DoublePendulum.normalizeAngle(this.state.angle1);
		this.state.angle2 = DoublePendulum.normalizeAngle(this.state.angle2);
	}

	private stepState(initial: DoublePendulumState, derivatives: DoublePendulumDerivatives, deltaTime: number): DoublePendulumState {
		return {
			angle1: initial.angle1 + derivatives.velocity1 * deltaTime,
			angle2: initial.angle2 + derivatives.velocity2 * deltaTime,
			velocity1: initial.velocity1 + derivatives.acceleration1 * deltaTime,
			velocity2: initial.velocity2 + derivatives.acceleration2 * deltaTime,
		};
	}

	// https://en.wikipedia.org/wiki/Double_pendulum
	// https://en.wikipedia.org/wiki/Lagrangian_mechanics
	private calculateDerivatives({angle1, angle2, velocity1, velocity2}: DoublePendulumState): DoublePendulumDerivatives {
		const mass1: number = SimulationProperties.mass1;
		const mass2: number = SimulationProperties.mass2;
		const length1: number = SimulationProperties.length1;
		const length2: number = SimulationProperties.length2;
		const gravity: number = SimulationProperties.gravity;
		const pivotFriction: number = SimulationProperties.pivotFriction;

		const angleDelta: number = angle1 - angle2;
		const totalMass: number = mass1 + mass2;
		const adjustedMass: number = 2 * mass1 + mass2;
		const denominator: number = adjustedMass - mass2 * Math.cos(2 * angle1 - 2 * angle2);
		const frictionTorque1: number = -pivotFriction * velocity1;
		const frictionTorque2: number = -pivotFriction * (velocity2 - velocity1);

		const upperGravityPull: number = -gravity * adjustedMass * Math.sin(angle1);
		const lowerGravityDrag: number = -mass2 * gravity * Math.sin(angle1 - 2 * angle2);
		const upperCentrifugalPull: number = -2 * Math.sin(angleDelta) * mass2 * ((velocity2 * velocity2 * length2) + (velocity1 * velocity1 * length1 * Math.cos(angleDelta)));

		const couplingMultiplier: number = 2 * Math.sin(angleDelta);
		const lowerCentrifugalPull: number = velocity1 * velocity1 * length1 * totalMass;
		const lowerGravityPull: number = gravity * totalMass * Math.cos(angle1);
		const coriolisEffect: number = velocity2 * velocity2 * length2 * mass2 * Math.cos(angleDelta);

		const acceleration1: number = (upperGravityPull + lowerGravityDrag + upperCentrifugalPull) / (length1 * denominator) + frictionTorque1 - frictionTorque2;
		const acceleration2: number = (couplingMultiplier * (lowerCentrifugalPull + lowerGravityPull + coriolisEffect)) / (length2 * denominator) + frictionTorque2;

		return {
			velocity1: velocity1,
			velocity2: velocity2,
			acceleration1: acceleration1,
			acceleration2: acceleration2,
		};
	}

	private checkAndRecoverState() {
		const hasExploded: boolean = Object.values(this.state).some((v: number) => isNaN(v) || !isFinite(v));

		if(hasExploded) {
			this.state = {
				angle1: Math.PI / 2, 
				angle2: 0,
				velocity1: 0,
				velocity2: 0
			}

			alert("Wystąpił błąd w symulacji. Symulacja została zrestartowana do bezpiecznego stanu.");
		}
	}

	static normalizeAngle(angle: number): number {
		let a: number = angle % (2 * Math.PI);

		if(a > Math.PI) a -= 2 * Math.PI;
		if(a < Math.PI) a += 2 * Math.PI;

		return a;
	}
}
