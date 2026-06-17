import { HistoryEntry, DoublePendulum } from "./double_pendulum";
import { SimulationProperties } from "./simulation_properties";

const ACCENT_COLOR: string = "#10b981";

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

		const x1: number = originX + SimulationProperties.length1 * Math.sin(pendulum.state.mass1.angle) * scale;
		const y1: number = originY + SimulationProperties.length1 * Math.cos(pendulum.state.mass1.angle) * scale;

		const x2: number = x1 + SimulationProperties.length2 * Math.sin(pendulum.state.mass2.angle) * scale;
		const y2: number = y1 + SimulationProperties.length2 * Math.cos(pendulum.state.mass2.angle) * scale;

		this.ctx.beginPath();
		this.ctx.moveTo(originX, originY);
		this.ctx.lineTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.strokeStyle = "#3b82f6";
		this.ctx.lineWidth = 4;
		this.ctx.stroke();

		this.renderCircle(x1, y1, 5 + SimulationProperties.mass1 * 0.5, ACCENT_COLOR);
		this.renderCircle(x2, y2, 5 + SimulationProperties.mass2 * 0.5, ACCENT_COLOR);
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

		const [startX, startY] = getXY(pendulum.history[0]);

		this.ctx.beginPath();
		this.ctx.moveTo(startX, startY);

		const len: number = pendulum.history.length;
		for(let i = 0; i < len - 1; ++i) {
			const [x, y] = getXY(pendulum.history[i+1]);
			this.ctx.lineTo(x, y);
		}

		this.ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
		this.ctx.lineWidth = 1.5;
		this.ctx.stroke();
	}

	public renderCircle(x: number, y: number, radius: number, color: string): void {
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}

	public renderBorderRuler(): void {
		const fontSize: number = 15;
		const majorTickLength: number = 15;
		const halfTickLength: number = 7;
		const minorTickLength: number = 3;

		const scale: number = this.getPixelsPerMeter();
		const rawStep: number = 150.0 / scale;

		const mag: number = Math.pow(10, Math.floor(Math.log10(rawStep)));
		const normalizedStep: number = rawStep / mag;

		let majorStep: number = mag;
		if(normalizedStep >= 5)			majorStep *= 5;
		else if(normalizedStep >= 2)	majorStep *= 2;

		const minorStep: number = majorStep * 0.1;

		this.ctx.beginPath();
		this.ctx.lineWidth = 2;
		this.ctx.fillStyle = ACCENT_COLOR;
		this.ctx.strokeStyle = "#555";
		this.ctx.font = `bold ${fontSize}px monospace`;

		const drawAxis = (isX: boolean): void => {
			const halfDim = (isX ? this.canvas.width : this.canvas.height) * 0.5;

			this.ctx.textAlign = isX ? "center" : "left";
			this.ctx.textBaseline = isX ? "bottom" : "middle";

			const startTick: number = Math.floor(-halfDim / scale / minorStep);
			const endTick: number = Math.ceil(halfDim / scale / minorStep);

			for(let i = startTick; i <= endTick; ++i) {
				const value: number = i * minorStep;
				const position: number = isX 
					? halfDim + (value * scale) 
					: halfDim - (value * scale);

				const isMajor: boolean = i % 10 === 0;
				const isHalf: boolean = i % 5 === 0;

				const length: number = isMajor ? majorTickLength : (isHalf ? halfTickLength : minorTickLength);

				if(isX) {
					this.ctx.moveTo(position, this.canvas.height);
					this.ctx.lineTo(position, this.canvas.height - length);

				} else {
					this.ctx.moveTo(0, position);
					this.ctx.lineTo(length, position);
				}

				if(isMajor) {
					const text: string = Number.isInteger(value) ? value.toString() : value.toPrecision(2);
					const offset: number = majorTickLength + 3;

					if(isX) {
						if(position > 40) {
							this.ctx.fillText(text, position, this.canvas.height - offset);
						}
					} else if(position < this.canvas.width - 40) {
						this.ctx.fillText(text, offset, position);
					}
				}
			}
		};

		drawAxis(true);
		drawAxis(false);

		this.ctx.stroke();
	}

	private handleResize(): void {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
	}
}
