import { DoublePendulum, DoublePendulumPart } from "./double_pendulum";
import { SimulationProperties } from "./simulation_properties";
import Renderer from "./renderer";

const DRAG_DISTANCE_LIMIT: number = 50.0;
const FIXED_TIME_STEP: number = 1.0 / 120; // 120hz

export default class Simulation {
	public pendulum: DoublePendulum;
	private hoverTarget: DoublePendulumPart = DoublePendulumPart.None; 
	private isDragging: boolean = false;
	private mouseX: number = 0;
	private mouseY: number = 0;
	private lastStepTime: DOMHighResTimeStamp = 0;
	private accumulator: number = 0;

	constructor(private readonly renderer: Renderer) {
		this.renderer.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
		window.addEventListener("mouseup", this.onMouseUp.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));

		this.update = this.update.bind(this); // bind this so the animationFrame callback works

		this.pendulum = new DoublePendulum(0, 0, Math.PI - 0.01, Math.PI);
	}

	public run(): void {
		this.lastStepTime = performance.now();
		window.requestAnimationFrame(this.update);
	}

	private update(time: DOMHighResTimeStamp): void {
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

		this.handleMouseDrag(frameTime);

		this.renderer.clear();
		this.renderer.renderPendulumHistory(this.pendulum);
		this.renderer.renderPendulum(this.pendulum);
		this.renderer.renderBorderRuler();

		window.requestAnimationFrame(this.update);
	};
	
	private handleMouseDrag(deltaTime: number): void {
		if(!this.isDragging) {
			const { x1, y1, x2, y2 } = this.pendulum.getPositions();
			const scale: number = this.renderer.getPixelsPerMeter();

			const dist1 = Math.hypot(this.mouseX - x1, this.mouseY - y1);
			const dist2 = Math.hypot(this.mouseX - x2, this.mouseY - y2);

			if(dist1 <= dist2 && dist1 <= DRAG_DISTANCE_LIMIT / scale) {
				this.hoverTarget = DoublePendulumPart.Mass1;
			} else if(dist2 <= dist1 && dist2 <= DRAG_DISTANCE_LIMIT / scale) {
				this.hoverTarget = DoublePendulumPart.Mass2;
			} else {
				this.hoverTarget = DoublePendulumPart.None;
			}
		}

		if(this.hoverTarget !== DoublePendulumPart.None || this.isDragging) {
			this.renderer.canvas.style.cursor = "pointer";
		} else {
			this.renderer.canvas.style.cursor = "default";
		}

		if(this.isDragging && this.pendulum.dragTarget !== DoublePendulumPart.None) {
			this.pendulum.handleMouseDrag(this.mouseX, this.mouseY, deltaTime);
		}
	}

	private onMouseDown(_: MouseEvent): void {
		if(this.hoverTarget != DoublePendulumPart.None) {
			this.isDragging = true;
			this.pendulum.dragTarget = this.hoverTarget;
		}
	}

	private onMouseUp(_: MouseEvent): void {
		this.pendulum.dragTarget = DoublePendulumPart.None;
		this.isDragging = false;
	}

	private onMouseMove(e: MouseEvent): void {
		const canvasRect: DOMRect = this.renderer.canvas.getBoundingClientRect();
		const scale: number = this.renderer.getPixelsPerMeter();

		this.mouseX = (e.clientX - canvasRect.left - this.renderer.canvas.width * 0.5) / scale;
		this.mouseY = (e.clientY - canvasRect.top - this.renderer.canvas.height * 0.5) / scale;
	}
}
