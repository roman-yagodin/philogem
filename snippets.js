async function type2(s) {

    const chunks = [];
    const lines = s.split(/[\r\n]{2,}/);
    console.log({lines: lines});
    for (let line of lines) {
        const words = line.split(/\s+/);
        let lastChunk = null;
        for (let word of words) {
            if (word.length > 0) {
                lastChunk = {text: word, eol: false};
                chunks.push(lastChunk);
            }
        }
        chunks.push({text: "", eol: true});
    }

    console.log({chunks: chunks});

    const { cols } = t.fitAddon.proposeDimensions();

    let x = 1;
    for (let chunk of chunks) {
        if (chunk.eol === true) {
            //t.write(EOL + EOL);
            await typeln();
            x = 1;
            continue;
        }

        if (x + chunk.text.length === cols) {
            x = 1;
        }
        else if (x + chunk.text.length > cols) {
            //t.write(EOL);
            await typeln();
            x = 1;
        }
        
        if (x + chunk.text.length === cols) {
            //t.write(chunk.text);
            await type(chunk.text);
            x += chunk.text.length;
        }
        else {
            //t.write(chunk.text + " ");
            await type(chunk.text + " ");
            x += chunk.text.length + 1;
        }
    }
}

async function scene2_terminal() {
    await command("CLS");

    await typeln("You entered small room with a chair, table and old console terminal on it.");
    await wait(_1s);
    await typeln("No other doors or even windows.");

    await typeln();

    setStyle(styles.boldGreen);
    await typeln("> Welcome to The Great Library terminal!");
    resetStyle();

    await wait(_hs);
    await typeln("was typed on the screen.");
    await wait(_hs);

    setStyle(styles.boldGreen);
    await typeln("> press any key then ready");
    resetStyle();
    
    await typeln();
    
    await wait(_4s);
    await typeln("What do you think you will do?");
    await typeln();
    
    const choice = await menu([
        "Press any key.",
        "Leave this place for good."
    ]);

    if (choice === 1) {
        await progress("Fetching library index...");
        const authors = ["Unknown Author L", "Lewis Carroll", "Unknown Author R"];
        return scene3_hub(authors);
    }

    if (choice === 2) {
        await typeln("You leaved this place. Too good for you!");
        return false;
    }

    setStyle(styles.boldGreen);
    await typeln(`> Hello, ${randomMsg(["human","@"])}!`);
    await typeln("> Take your time and have fun!");
    resetStyle();

    await typeln();

    await wait(_3s);

    return true;
}

async function scene3_hub(authors) {
    
    let authorIndex = 1;
    while (true) {

        await command("CLS");

        setStyle(styles.boldGreen);
        await typeln('> "You stand before pretty much arbitrary door."');
        await typeln('> "Though it has \'' + authors[authorIndex] + '\' sign over it."');
        resetStyle();

        await typeln("was typed on the screen");
        
        await wait(_3s);

        await typeln();
        await typeln("What do you think you will do?");
        await typeln();

        await wait(_3s);

        const choice = await menu([
            "Open the door.",
            randomMsg(["Look left.", "Turn left.", "Turn counter-clockwise."]),
            randomMsg(["Look right.", "Turn right.", "Turn clockwise."]),
            "Step back!"
        ]);

        if (choice === 1) {
            await progress("Creating a room...");
            return scene4_room(carrollNotes);
        }

        if (choice === 2) {
            authorIndex--;
            if (authorIndex < 0) {
                authorIndex = 0;
                await typeln("You cannot do that now.");
            }
        }

        if (choice === 3) {
            authorIndex++;
            if (authorIndex > 2) {
                authorIndex = 2;
                await typeln("You cannot do that now.");
            }
        }

        if (choice === 4) {
            return true;
        }
    }

    return false;
}

//---

async function typeln(s) {
    if (s) {
        await type(s);
    }
    return await _type(EOL);
}

async function type(s) {
    let x = 0;
    const words = s.split(/\s+/);

    // FitAddon doesn't update cols? Recalc it on resize?
    console.log({ words: words, cols: t.options.cols, t: t });

    for (let word of words) {
        const w = word.trim();
        if (w.length > 0) {
            x += w.length + 1;
            if (x < t.options.cols) {
                await _type(w + " ");
            }
            else {
                x = w.length + 1;
                await _type(EOL + w + " ");
            }
        }
    }
}
    
async function _type(s) {
}

//---