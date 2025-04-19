class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
        this.engine.show(`
            <p>You’ve recently taken over your family’s old cafe in hopes of bringing it back to life.</p>
            <p>Your grandparents mentioned that somewhere in the building lies a lost recipe book filled with their most popular drinks but neither can remember where it was last placed...</p>
            <p>With an important food critic visiting soon, your goal is to <strong>find that recipe book</strong> to get the cafe back on its feet.</p>
        `);
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

        if (choice.GivesItem) {
            const item = choice.GivesItem;
            if (!this.engine.hasItem(item)) {
                this.engine.addItem(item);
                this.engine.show("&gt; You picked up: " + item);
            } else {
                this.engine.show("&gt; You already picked up: " + item);
            }
        
            this.engine.gotoScene(Location, choice.Target);  

        } else if (choice.Text.startsWith("Try a code")) {
            if (this.engine.hasFlag("HeardDrawerCode")) {
                this.engine.show("&gt; You enter 0912. The drawer opens!");
                this.engine.addItem("RecipeBook");
                this.engine.gotoScene(Location, "DrawerUnlocked");
            } else {
                this.engine.show("&gt; You try your birthday... Nothing happens... So much for being the favorite grandchild.");
                this.engine.gotoScene(Location, "BackRoom");
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

        if (!this.selectedIngredients) {
            this.selectedIngredients = new Set();
        }

        this.engine.show("<hr><b>Drink Maker:</b> Combine ingredients to make a drink!");

        this.displayIngredientChoices();
    }

    handleChoice(choice) {
        if (choice.action === "add") {
            this.selectedIngredients.add(choice.ingredient);
            this.engine.show("&gt; Added " + choice.ingredient);
            this.update(); // Refresh options

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

            this.engine.gotoScene(Location, "CafeFront");
        }
    }

    update() {
        // Clear buttons and re-display ingredient choices
        while (this.engine.actionsContainer.firstChild) {
            this.engine.actionsContainer.removeChild(this.engine.actionsContainer.firstChild);
        }

        this.displayIngredientChoices();
    }

    displayIngredientChoices() {
        const allIngredients = ["Espresso", "Milk", "Honey", "Mint"];
        const availableIngredients = allIngredients.filter(ing => this.engine.hasItem(ing));

        if (availableIngredients.length === 0) {
            this.engine.show("You don’t have any ingredients yet. Explore the café to find some!");
            this.engine.gotoScene(Location, "CafeFront");
        } else {
            for (let ing of availableIngredients) {
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
}


class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');
