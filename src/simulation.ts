import { DoublePendulum } from "./double_pendulum";
import Renderer from "./renderer";

export default class Simulation {
	public pendulums: DoublePendulum[];
	private lastStepTime: DOMHighResTimeStamp = 0;

	constructor(private readonly renderer: Renderer) {
		this.step = this.step.bind(this); // bind this so the animationFrame callback works

		this.pendulums = [];

		const pendulum: DoublePendulum = new DoublePendulum(
			0, 0,
			{
				angle: 0,
				angularVelocity: 3,
			},
			{
				angle: 0,
				angularVelocity: -1,
			}
		);

		this.addPendulum(pendulum);
	}

	public run(): void {
		this.lastStepTime = performance.now();
		window.requestAnimationFrame(this.step);
	}

	public addPendulum(pendulum: DoublePendulum): void {
		this.pendulums.push(pendulum);
	}

	private step(time: DOMHighResTimeStamp): void {
		const deltaTime: number = Math.min(0.1, (time - this.lastStepTime) * 0.001);

		this.renderer.clear();

		for(const pendulum of this.pendulums) {
			pendulum.update(deltaTime);
			this.renderer.renderPendulum(pendulum);
		}

		this.lastStepTime = time;
		window.requestAnimationFrame(this.step);
	};
}
