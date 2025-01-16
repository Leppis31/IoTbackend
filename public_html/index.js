const TGAUGE_CONF = {
    INITIAL_VALUE: 0,
};

// REPLACE THE VALUE => point to actual
// E.g., "http://ip.addr.to.server/api/v1" + "/status"
const BUTTON_ENDPOINT = "http://40.85.113.203:3000/api/v1/button"; // New endpoint for button state
const CURRENT_VALUE_ENDPOINT = "http://40.85.113.203:3000/api/v1/current"; // Endpoint to get the current value
export class TGauge {
    constructor(container, mock_Tgauge, real_data) {
        this.container = container;
        /** @type {SVGAElement | null} */
        this.element = null;
        /** @type {SVGPathElement | null} */
        this.pointer = null;
        this.setupMockGauge(mock_Tgauge);
        this.setupRealData(real_data);
        this.setupToggleButton();
        this.setupSVG();
        
    }

    /**
     * Setup real data button
     * @param {HTMLDivElement} container 
     */

    updateText(value){
        const textDiv = document.getElementById('tem_hum_text')
        if (value == 1){
            textDiv.textContent = 'Tempeture'
        }
        else if (value == 0){
            textDiv.textContent = 'Humidity'
        }
    }   
    // button that toggles between 0 and 1, sends the value to BUTTON_ENDPOINT
    setupToggleButton() {
        const button = document.createElement("button");
        button.innerText = "Toggle State"; 
        let currentState = 0; // Initial state
        button.addEventListener("click", () => {
            // Toggle between 0 and 1
            currentState = currentState === 0 ? 1 : 0; 
            this.updateText(currentState)
             // Sending the toggled value
            fetch(`${BUTTON_ENDPOINT}?value=${currentState}`)
                .then(response => response.text())
                .then(data => {
                    // Log server response
                    console.log(`Toggled value sent: ${currentState}`, data); 
                })
                .catch(error => {
                    console.error("Error sending toggle state:", error);
                });
        });    
        this.container.appendChild(button);
    }
    // get the data (humidity/tempeture)
    setupRealData(container) {
        const button = document.createElement("button");
        button.innerText = "Hae data";
        button.addEventListener("click", () => {
            fetch(CURRENT_VALUE_ENDPOINT)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(data => {
                    const incoming_value = parseFloat(data.split(": ")[1]);
                    console.log(`Fetched current value: ${incoming_value}`);
                    
                    // Update the gauge with the fetched value
                    this.handleTempStatus(incoming_value);
    
                    // Update button text to show the current value
                    button.innerText = `Current Value: ${incoming_value}`;
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });
        });
    
        container.appendChild(button);
    }
    /**
     * @param {number} amount 
     */
    handleTempStatus(amount) {
        this.rotatePointer(amount);
    }
    /**
     * @param {number} angle 
     */
    rotatePointer(value) {
        const minValue = 0; 
        const maxValue = 100; 
        const clampedValue = Math.max(minValue, Math.min(value, maxValue)); 
        const percent = (clampedValue - minValue) / (maxValue - minValue) * 120; 
        const rotate = `rotate(${percent} 0 0)`; 
        this.pointer.setAttribute("transform", rotate);
    }
    
    /**
     * @param {HTMLDivElement} container 
     */
    setupMockGauge(container) {
        const mock_Tgauge = document.createElement("input");
        mock_Tgauge.setAttribute("type", "range");
        mock_Tgauge.setAttribute("min", "0");
        mock_Tgauge.setAttribute("max", "100");
        mock_Tgauge.value = TGAUGE_CONF.INITIAL_VALUE.toString(); // initial value
        mock_Tgauge.addEventListener("change", (e) => {
            const input = e.target;
            const value = parseFloat(input.value);
            this.handleTempStatus(value);
        });
        container.appendChild(mock_Tgauge);
    }
    /**
     * @param {HTMLDivElement} container 
     */
    setupHGauge(container) {
        const mock_Hgauge = document.createElement("input");
        mock_Hgauge.setAttribute("type", "text");
        mock_Hgauge.setAttribute("value", "Hello World!");
        container.appendChild(mock_Hgauge);
    }
    /**
     * @param {string} svgString 
     * @returns {SVGElement}
     */
    parseSVG(svgString) {
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = svgDocument.documentElement;
        return svgElement;
    }
    async setupSVG() {
        fetch('t-gauge.svg')
            .then(response => response.text())
            .then(svgString => {
                this.element = this.parseSVG(svgString);
                this.pointer = this.element.querySelector("#Tgauge");
                this.pointer?.setAttribute("transform-origin", "center"); // needle anchor point center
                if (this.pointer) {
                    this.pointer.style.transition = "300ms linear all";
                    this.pointer.style.webkitTransition = "300ms linear all";
                    this.pointer.style.MozTransition = "300ms linear all";
                    this.pointer.style.OTransition = "300ms linear all";
                }
                this.container.appendChild(this.element);
                this.handleTempStatus(TGAUGE_CONF.INITIAL_VALUE);
            });
    }
}

let Tgauge = undefined;

document.addEventListener("DOMContentLoaded", () => {
    const elem = {
        Tgauge: document.getElementById("Tgauge"),
        mock_Tgauge: document.getElementById("mock-Tgauge"),
        real_data: document.getElementById("real-data"),
        humidty_btn : document.getElementById("humidty-btn")
    }
    Tgauge = new TGauge(
        elem.Tgauge,
        elem.mock_Tgauge,
        elem.real_data,
        elem.humidty_btn
    );
});
  