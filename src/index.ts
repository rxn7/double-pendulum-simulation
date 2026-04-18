import "./style.css";
import "./ui_handler";
import Simulation from "./simulation";
import Renderer from "./renderer";

let simulation: Simulation

window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById("simulation-canvas") as HTMLCanvasElement;

	const renderer: Renderer = new Renderer(canvas);

	simulation = new Simulation(renderer);
	simulation.run();
});
