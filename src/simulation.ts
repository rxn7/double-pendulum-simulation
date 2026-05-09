import { DoublePendulum, DragTarget } from "./double_pendulum";
import { SimulationProperties } from "./simulation_properties";
import Renderer from "./renderer";

const DRAG_DISTANCE_LIMIT: number = 50.0;
const FIXED_TIME_STEP: number = 1.0 / 120; // 120hz

export default class Simulation {
	public pendulum: DoublePendulum;
	private lastStepTime: DOMHighResTimeStamp = 0;
	private accumulator: number = 0;

	constructor(private readonly renderer: Renderer) {
		this.renderer.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
		window.addEventListener("mouseup", this.onMouseUp.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));

		this.step = this.step.bind(this); // bind this so the animationFrame callback works

		this.pendulum = new DoublePendulum(0, 0, 45, -45);
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
			if(!SimulationProperties.isPaused) {
				this.pendulum.simulationStep(FIXED_TIME_STEP);
			}
			
			this.accumulator -= FIXED_TIME_STEP;
		}

		if(!SimulationProperties.isPaused) {
			this.pendulum.update();
		}

		this.renderer.clear();
		this.renderer.renderPendulumHistory(this.pendulum);
		this.renderer.renderPendulum(this.pendulum);

		window.requestAnimationFrame(this.step);
	};

	private onMouseDown(e: MouseEvent): void {
		const { mouseX, mouseY } = this.getMouseXY(e);

		const { x1, y1, x2, y2 } = this.pendulum.getPositions();
		const scale: number = this.renderer.getPixelsPerMeter();

		const dist1 = Math.hypot(mouseX - x1,  mouseY - y1);
		const dist2 = Math.hypot(mouseX - x2,  mouseY - y2);

		if(dist1 <= dist2 && dist1 <= DRAG_DISTANCE_LIMIT / scale) {
			this.pendulum.dragTarget = DragTarget.Mass1;
		} else if(dist2 <= dist1 && dist2 <= DRAG_DISTANCE_LIMIT / scale) {
			this.pendulum.dragTarget = DragTarget.Mass2;
		} else {
			this.pendulum.dragTarget = DragTarget.None;
		}
	}

	private onMouseUp(e: MouseEvent): void {
		this.pendulum.dragTarget = DragTarget.None;
	}

	private onMouseMove(e: MouseEvent): void {
		const { mouseX, mouseY } = this.getMouseXY(e);
		this.pendulum.handleDrag(this.pendulum.dragTarget, mouseX, mouseY);
	}

	private getMouseXY(e: MouseEvent): { mouseX: number, mouseY: number } {
		const canvasRect: DOMRect = this.renderer.canvas.getBoundingClientRect();
		const scale: number = this.renderer.getPixelsPerMeter();

		const mouseX: number = (e.clientX - canvasRect.left - this.renderer.canvas.width * 0.5) / scale;
		const mouseY: number = (e.clientY - canvasRect.top - this.renderer.canvas.height * 0.5) / scale;

		return { mouseX, mouseY };
	}
}
