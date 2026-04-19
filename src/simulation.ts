import { DoublePendulum } from "./double_pendulum";
import Renderer from "./renderer";

const FIXED_TIME_STEP: number = 1.0 / 120; // 120hz

export default class Simulation {
	public pendulums: DoublePendulum[];
	private lastStepTime: DOMHighResTimeStamp = 0;
	private accumulator: number = 0;

	constructor(private readonly renderer: Renderer) {
		this.step = this.step.bind(this); // bind this so the animationFrame callback works

		this.pendulums = [];

		this.addPendulum(0, 0, 45, -45);
	}

	public run(): void {
		this.lastStepTime = performance.now();
		window.requestAnimationFrame(this.step);
	}

	private step(time: DOMHighResTimeStamp): void {
		const frameTime: number = Math.min(0.1, (time - this.lastStepTime) * 0.001);
		this.lastStepTime = time;

		this.accumulator += frameTime;

		while(this.accumulator >= FIXED_TIME_STEP) {
			for(const pendulum of this.pendulums) {
				pendulum.update(FIXED_TIME_STEP);
			}

			this.accumulator -= FIXED_TIME_STEP;
		}

		this.renderer.clear();
		for(const pendulum of this.pendulums) {
			this.renderer.renderPendulum(pendulum);
		}

		window.requestAnimationFrame(this.step);
	};

	private addPendulum(x: number, y: number, angle1: number, angle2: number): void {
		this.pendulums.push(new DoublePendulum(
			x, y,
			angle1,
			angle2,
		));
	}
}
