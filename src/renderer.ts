import { DoublePendulum } from "./double_pendulum";

const METERS_TO_PIXELS: number = 100;

export default class Renderer {
	private ctx: CanvasRenderingContext2D;

	constructor(private readonly canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		if(!this.ctx) {
			alert("Nie udało się stworzyć kontekstu 2D");
			return;
		}
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
	}

	public renderPendulum(pendulum: DoublePendulum): void {
		const originX: number = this.canvas.clientWidth * 0.5;
		const originY: number = this.canvas.clientHeight * 0.5;

		const positionX: number = originX + pendulum.originX;
		const positionY: number = originY + pendulum.originY;

		const x1: number = positionX + pendulum.arm1.length * Math.sin(pendulum.arm1.angle) * METERS_TO_PIXELS;
		const y1: number = positionY + pendulum.arm1.length * Math.cos(pendulum.arm1.angle) * METERS_TO_PIXELS;

		const x2: number = x1 + pendulum.arm2.length * Math.sin(pendulum.arm2.angle) * METERS_TO_PIXELS;
		const y2: number = y1 + pendulum.arm2.length * Math.cos(pendulum.arm2.angle) * METERS_TO_PIXELS;

		this.ctx.beginPath();
		this.ctx.moveTo(positionX, positionY);
		this.ctx.lineTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.strokeStyle = "#666";
		this.ctx.lineWidth = 4;
		this.ctx.stroke();

		this.renderCircle(x1, y1, 10, "#00f");
		this.renderCircle(x2, y2, 10, "#00f");
	}

	public renderCircle(x: number, y: number, radius: number, color: string): void {
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}
}
