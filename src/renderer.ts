import { DoublePendulum } from "./double_pendulum";
import { SimulationProperties } from "./simulation_properties";

export default class Renderer {
	private ctx: CanvasRenderingContext2D;

	constructor(private readonly canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

		if(!this.ctx) {
			alert("Nie udało się stworzyć kontekstu 2D");
			return;
		}

		window.addEventListener("resize", () => {
			const canvasStyle: CSSStyleDeclaration = getComputedStyle(canvas);
			canvas.width = parseInt(canvasStyle.width);
			canvas.height = parseInt(canvasStyle.height);
		});
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
	}

	public renderPendulum(pendulum: DoublePendulum): void {
		const totalLength = SimulationProperties.length1 + SimulationProperties.length2;
		const metersToPixels: number = Math.max(this.canvas.clientWidth, this.canvas.clientHeight) / totalLength * 0.5 * 0.99;
	
		const originX: number = this.canvas.clientWidth * 0.5;
		const originY: number = this.canvas.clientHeight * 0.5;

		const positionX: number = originX + pendulum.originX;
		const positionY: number = originY + pendulum.originY;

		const x1: number = positionX + SimulationProperties.length1 * Math.sin(pendulum.state.angle1) * metersToPixels;
		const y1: number = positionY + SimulationProperties.length1 * Math.cos(pendulum.state.angle1) * metersToPixels;

		const x2: number = x1 + SimulationProperties.length2 * Math.sin(pendulum.state.angle2) * metersToPixels;
		const y2: number = y1 + SimulationProperties.length2 * Math.cos(pendulum.state.angle2) * metersToPixels;

		this.ctx.beginPath();
		this.ctx.moveTo(positionX, positionY);
		this.ctx.lineTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.strokeStyle = "#666";
		this.ctx.lineWidth = 4;
		this.ctx.stroke();

		this.renderCircle(x1, y1, 5, "#00f");
		this.renderCircle(x2, y2, 5, "#00f");
	}

	public renderCircle(x: number, y: number, radius: number, color: string): void {
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}
}
