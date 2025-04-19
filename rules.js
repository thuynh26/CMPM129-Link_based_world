class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        const locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        if (locationData.Choices) {
            for (let choice of locationData.Choices) {
                if (choice.RequiresItem && !this.engine.hasItem(choice.RequiresItem)) continue;
                if (choice.RequiresFlag && !this.engine.hasFlag(choice.RequiresFlag)) continue;
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (!choice) {
            this.engine.gotoScene(End);
            return;
        }

        if (choice.Text.startsWith("Pick up")) {
            this.engine.addItem(choice.GivesItem);
            this.engine.show("&gt; You picked up: " + choice.GivesItem);
            this.engine.gotoScene(Location, choice.Target);
        } else if (choice.Text.startsWith("Enter code")) {
            if (this.engine.hasFlag("HeardDrawerCode")) {
                this.engine.show("&gt; Code accepted. The drawer opens!");
                this.engine.addItem("RecipeBook");
                this.engine.gotoScene(Location, choice.Target);
            } else {
                this.engine.show("&gt; You don’t remember the code yet.");
            }
        } else {
            this.engine.show("&gt; " + choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        }
    }
}

class DrinkCounter extends Location {
    create(key) {
        super.create(key);

        // Initialize selection storage
        if (!this.selectedIngredients) {
            this.selectedIngredients = new Set();
        }

        this.engine.show("<hr><b>Drink Maker:</b> Combine ingredients to make a drink!");

        const ingredients = ["Espresso", "Milk", "Honey", "Mint"];

        for (let ing of ingredients) {
            this.engine.addChoice("Add: " + ing, {
                action: "add",
                ingredient: ing
            });
        }

        this.engine.addChoice("Serve drink", {
            action: "serve"
        });
    }

    handleChoice(choice) {
        if (choice.action === "add") {
            this.selectedIngredients.add(choice.ingredient);
            this.engine.show("&gt; Added " + choice.ingredient);
            this.update(); // Just update the UI
        } else if (choice.action === "serve") {
            const combo = Array.from(this.selectedIngredients).join(", ");
            this.engine.show("&gt; You serve the drink with: " + combo + ".");
    
            if (this.selectedIngredients.has("Mint") && this.selectedIngredients.has("Honey")) {
                this.engine.setFlag("HeardDrawerCode");
                this.engine.show("Customer smiles and recalls a story: 'The café reopened on 0912'...");
            } else {
                this.engine.show("The customer thanks you, but offers no insight.");
            }
    
            this.selectedIngredients.clear();
    
            // Delay the transition slightly to give time for text display (optional)
            setTimeout(() => {
                this.engine.gotoScene(Location, "CafeFront");
            }, 300); // Adjust delay as needed, or remove if immediate return is fine
        }
    }
    

    update() {
        // Clear and re-add choices without re-displaying the entire scene
        while (this.engine.actionsContainer.firstChild) {
            this.engine.actionsContainer.removeChild(this.engine.actionsContainer.firstChild);
        }

        const ingredients = ["Espresso", "Milk", "Honey", "Mint"];

        for (let ing of ingredients) {
            this.engine.addChoice("Add: " + ing, {
                action: "add",
                ingredient: ing
            });
        }

        this.engine.addChoice("Serve drink", {
            action: "serve"
        });
    }
}



class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');
