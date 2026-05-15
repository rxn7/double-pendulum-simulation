import { HistoryEntry, DoublePendulum } from "./double_pendulum";
import { SimulationProperties } from "./simulation_properties";

export default class Renderer {
	private ctx: CanvasRenderingContext2D;

	constructor(public readonly canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

		if(!this.ctx) {
			alert("Nie udało się stworzyć kontekstu 2D");
			return;
		}

		this.handleResize();
		window.addEventListener("resize", this.handleResize.bind(this));
	}

	public getPixelsPerMeter(): number {
		const totalLength = SimulationProperties.length1 + SimulationProperties.length2;
		return (Math.min(this.canvas.width, this.canvas.height) / totalLength) * 0.45;
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public renderPendulum(pendulum: DoublePendulum): void {
		const scale: number = this.getPixelsPerMeter();
	
		const originX: number = this.canvas.width * 0.5 + pendulum.originX;
		const originY: number = this.canvas.height * 0.5 + pendulum.originY;

		const x1: number = originX + SimulationProperties.length1 * Math.sin(pendulum.state.angle1) * scale;
		const y1: number = originY + SimulationProperties.length1 * Math.cos(pendulum.state.angle1) * scale;

		const x2: number = x1 + SimulationProperties.length2 * Math.sin(pendulum.state.angle2) * scale;
		const y2: number = y1 + SimulationProperties.length2 * Math.cos(pendulum.state.angle2) * scale;

		this.ctx.beginPath();
		this.ctx.moveTo(originX, originY);
		this.ctx.lineTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.strokeStyle = "#3b82f6";
		this.ctx.lineWidth = 4;
		this.ctx.stroke();

		this.renderCircle(x1, y1, 5 + SimulationProperties.mass1 * 0.5, "#10b981");
		this.renderCircle(x2, y2, 5 + SimulationProperties.mass2 * 0.5, "#10b981");
	}

	public renderPendulumHistory(pendulum: DoublePendulum): void {
		if(pendulum.history.length < 2) {
			return;
		}

		const scale: number = this.getPixelsPerMeter();
		const originX: number = this.canvas.width * 0.5;
		const originY: number = this.canvas.height * 0.5;

		this.ctx.beginPath();

		const getXY = (entry: HistoryEntry): [ number, number ] => {
			const x: number = originX + entry.x * scale;
			const y: number = originY + entry.y * scale;
			return [x, y];
		};

		pendulum.history.forEach((entry: HistoryEntry) => {
			const [x, y] = getXY(entry);
			this.ctx.lineTo(x, y);
		});

		const len: number = pendulum.history.length;
		for(let i = 0; i < len - 1; ++i) {
			const [startX, startY] = getXY(pendulum.history[i]);
			const [endX, endY] = getXY(pendulum.history[i+1]);

			this.ctx.beginPath();
			this.ctx.moveTo(startX, startY);
			this.ctx.lineTo(endX, endY);

			const progress: number = i / (len - 1);

			this.ctx.strokeStyle = `rgba(239, 68, 68, ${progress})`;
			this.ctx.lineWidth = 1.5;
			this.ctx.stroke();
		}
	}

	public renderCircle(x: number, y: number, radius: number, color: string): void {
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}

	private handleResize(): void {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
	}
}
