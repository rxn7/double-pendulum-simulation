import "./style.css";
import "./ui_handler";
import Simulation from "./simulation";
import Renderer from "./renderer";

window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById("simulation-canvas") as HTMLCanvasElement;
	const renderer: Renderer = new Renderer(canvas);

	const simulation = new Simulation(renderer);
	simulation.run();
});
