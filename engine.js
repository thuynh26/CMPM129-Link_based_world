class Engine {
    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        fetch(storyDataUrl).then(response => response.json()).then(json => {
            this.storyData = json;
            this.gotoScene(firstSceneClass, this.storyData.InitialLocation);
        });

        this.inventory = new Set();
        this.eventFlags = new Set();
    }

    gotoScene(sceneClass, data) {
        let key = data;
        let useClass = sceneClass;

        if (typeof key === "string" && this.storyData.Locations && this.storyData.Locations[key]) {
            const location = this.storyData.Locations[key];
            if (location.Custom) {
                useClass = DrinkCounter;
            }
        }

        this.scene = new useClass(this);
        this.scene.create(key);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while (this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild);
            }
            this.scene.handleChoice(data);
        };
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }

    // Inventory system functions - check and update items
    hasItem(item) {
        return this.inventory.has(item);
    }

    addItem(item) {
        this.inventory.add(item);
    }

    // Event unlock functions - check and update event flags
    setFlag(flag) {
        this.eventFlags.add(flag);
    }

    hasFlag(flag) {
        return this.eventFlags.has(flag);
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() {}

    update() {}

    handleChoice(action) {
        console.warn('no choice handler on scene', this);
    }
}