import { SimulationProperties } from "./simulation_properties";

export enum DoublePendulumPart {
	None,
	Mass1,
	Mass2
};

const MAX_HISTORY_SIZE: number = 120;
const MAX_MOUSE_DRAG_VELOCITY: number = 5.0; // Radians per second

export interface HistoryEntry {
	time: number;
	x: number;
	y: number;
};

export interface MassState {
	angle: number;
	velocity: number;
}

export interface DoublePendulumState {
	mass1: MassState;
	mass2: MassState;
};

export interface MassDerivatives {
	velocity: number;
	acceleration: number;
}

export interface DoublePendulumDerivatives {
	mass1: MassDerivatives;
	mass2: MassDerivatives;
};

export class DoublePendulum {
	public history: HistoryEntry[] = []
	public dragTarget: DoublePendulumPart = DoublePendulumPart.None;
	public state: DoublePendulumState;

	constructor(public originX: number, public originY: number, angle1: number, angle2: number) {
		this.state = {
			mass1: {
				angle: angle1,
				velocity: 0
			},
			mass2: {
				angle: angle2,
				velocity: 0
			},
		}
	}

	public getPositions(): { x1: number, y1: number, x2: number, y2: number } {
		const x1: number = this.originX + SimulationProperties.length1 * Math.sin(this.state.mass1.angle);
		const y1: number = this.originY + SimulationProperties.length1 * Math.cos(this.state.mass1.angle);

		const x2: number = x1 + SimulationProperties.length2 * Math.sin(this.state.mass2.angle);
		const y2: number = y1 + SimulationProperties.length2 * Math.cos(this.state.mass2.angle);

		return { x1, y1, x2, y2 };
	}

	public simulationStep(tick: number, deltaTime: number): void {
		if(tick % 2 == 0) { // Push state to history every other tick (60hz)
			this.pushStateToHistory();
		}

		this.checkAndRecoverState();
		this.updatePhysics(deltaTime);
		this.normalizeAngles();
	}

	public handleMouseDrag(mouseX: number, mouseY: number, deltaTime: number): void {
		if(deltaTime <= 0) {
			return;
		}

		const handleDragMass = (x: number, y: number, mass: MassState): void => {
			const targetAngle: number = Math.atan2(mouseX - x, mouseY - y);
			const angleDelta: number = DoublePendulum.normalizeAngle(targetAngle - mass.angle);

			mass.angle = targetAngle;

			const rawVelocity: number = angleDelta / deltaTime;
			mass.velocity = Math.max(-MAX_MOUSE_DRAG_VELOCITY, Math.min(MAX_MOUSE_DRAG_VELOCITY, rawVelocity));
		}

		switch(this.dragTarget) {
			case DoublePendulumPart.None:
				break;

			case DoublePendulumPart.Mass1: {
				handleDragMass(this.originX, this.originY, this.state.mass1);
				break;
			}

			case DoublePendulumPart.Mass2: {
				const { x1, y1 } = this.getPositions();
				handleDragMass(x1, y1, this.state.mass2);
				break;
			}
		}
	}

	// https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
	private updatePhysics(deltaTime: number): void {
		const k1: DoublePendulumDerivatives = this.calculateDerivatives(this.state);
		const k2: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k1, deltaTime * 0.5));
		const k3: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k2, deltaTime * 0.5));
		const k4: DoublePendulumDerivatives = this.calculateDerivatives(this.stepState(this.state, k3, deltaTime));

		const scaledDeltaTime = deltaTime / 6.0;

		const updateMassPhysics = (mass: MassState, k1: MassDerivatives, k2: MassDerivatives, k3: MassDerivatives, k4: MassDerivatives): void => {
			mass.angle += (k1.velocity + 2 * k2.velocity + 2 * k3.velocity + k4.velocity) * scaledDeltaTime;
			mass.velocity += (k1.acceleration + 2 * k2.acceleration + 2 * k3.acceleration + k4.acceleration) * scaledDeltaTime;
		}

		if(this.dragTarget !== DoublePendulumPart.Mass1) {
			updateMassPhysics(this.state.mass1, k1.mass1, k2.mass1, k3.mass1, k4.mass1);
		} 

		if(this.dragTarget !== DoublePendulumPart.Mass2) {
			updateMassPhysics(this.state.mass2, k1.mass2, k2.mass2, k3.mass2, k4.mass2);
		}
	}

	private normalizeAngles(): void {
		this.state.mass1.angle = DoublePendulum.normalizeAngle(this.state.mass1.angle);
		this.state.mass2.angle = DoublePendulum.normalizeAngle(this.state.mass2.angle);
	}

	private stepState(initial: DoublePendulumState, derivatives: DoublePendulumDerivatives, deltaTime: number): DoublePendulumState {
		const stepMass = (i: MassState, d: MassDerivatives): MassState => {
			return {
				angle: i.angle + d.velocity * deltaTime,
				velocity: i.velocity + d.acceleration * deltaTime
			};
		};

		return {
			mass1: stepMass(initial.mass1, derivatives.mass1),
			mass2: stepMass(initial.mass2, derivatives.mass2),
		};
	}

	// https://en.wikipedia.org/wiki/Double_pendulum
	// https://en.wikipedia.org/wiki/Lagrangian_mechanics
	private calculateDerivatives(state: DoublePendulumState): DoublePendulumDerivatives {
		const mass1: number = SimulationProperties.mass1;
		const mass2: number = SimulationProperties.mass2;
		const length1: number = SimulationProperties.length1;
		const length2: number = SimulationProperties.length2;
		const gravity: number = SimulationProperties.gravity;
		const pivotFriction1: number = SimulationProperties.pivotFriction1;
		const pivotFriction2: number = SimulationProperties.pivotFriction2;

		const angle1: number = state.mass1.angle;
		const angle2: number = state.mass2.angle;
		const velocity1: number = state.mass1.velocity;
		const velocity2: number = state.mass2.velocity;

		const angleDelta: number = angle1 - angle2;
		const totalMass: number = mass1 + mass2;
		const adjustedMass: number = 2 * mass1 + mass2;
		const denominator: number = adjustedMass - mass2 * Math.cos(2 * angle1 - 2 * angle2);

		const frictionTorque1: number = -pivotFriction1 * velocity1;
		const frictionTorque2: number = -pivotFriction2 * (velocity2 - velocity1);
		const netFrictionTorque1: number = frictionTorque1 - frictionTorque2;
		const netFrictionTorque2: number = frictionTorque2;

		const frictionForce1: number = (2 / length1) * netFrictionTorque1 - (2 * Math.cos(angleDelta) / length2) * netFrictionTorque2;
		const frictionForce2: number = (2 * totalMass / (mass2 * length2)) * netFrictionTorque2 - (2 * Math.cos(angleDelta) / length1) * netFrictionTorque1;

		const upperGravityPull: number = -gravity * adjustedMass * Math.sin(angle1);
		const lowerGravityDrag: number = -mass2 * gravity * Math.sin(angle1 - 2 * angle2);
		const upperCentrifugalPull: number = -2 * Math.sin(angleDelta) * mass2 * ((velocity2 * velocity2 * length2) + (velocity1 * velocity1 * length1 * Math.cos(angleDelta)));

		const couplingMultiplier: number = 2 * Math.sin(angleDelta);
		const lowerCentrifugalPull: number = velocity1 * velocity1 * length1 * totalMass;
		const lowerGravityPull: number = gravity * totalMass * Math.cos(angle1);
		const coriolisEffect: number = velocity2 * velocity2 * length2 * mass2 * Math.cos(angleDelta);

		const acceleration1: number = (upperGravityPull + lowerGravityDrag + upperCentrifugalPull + frictionForce1) / (length1 * denominator);
		const acceleration2: number = (couplingMultiplier * (lowerCentrifugalPull + lowerGravityPull + coriolisEffect) + frictionForce2) / (length2 * denominator);

		return {
			mass1: {
				acceleration: acceleration1,
				velocity: velocity1,
			},
			mass2: {
				acceleration: acceleration2,
				velocity: velocity2,
			}
		};
	}

	private checkAndRecoverState() {
		const values: number[] = [
			this.state.mass1.angle, 
			this.state.mass1.velocity,
			this.state.mass2.angle, 
			this.state.mass2.velocity,
		];
		const hasExploded: boolean = Object.values(values).some((v: number) => isNaN(v) || !isFinite(v));

		if(hasExploded) {
			this.state = {
				mass1: {
					angle: Math.PI / 2, 
					velocity: 0,
				},
				mass2: {
					angle: 0,
					velocity: 0,
				}
			}

			alert("Wystąpił błąd w symulacji. Symulacja została zrestartowana do bezpiecznego stanu.");
		}
	}

	private pushStateToHistory() {
		const { x2, y2 } = this.getPositions();

		const entry: HistoryEntry = {
			time: performance.now(),
			x: x2,
			y: y2,
		};

		this.history.push(entry);

		if(this.history.length > MAX_HISTORY_SIZE) {
			this.history.shift();
		}
	}

	private static normalizeAngle(angle: number): number {
		let a: number = angle % (2 * Math.PI);

		if(a > Math.PI) a -= 2 * Math.PI;
		if(a < -Math.PI) a += 2 * Math.PI;

		return a;
	}
}
