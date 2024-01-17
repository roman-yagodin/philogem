const EOL = "\n\r";
const _1t = 10; // type interval

const _1s = 1000;
const _hs = _1s / 2;
const _2s = _1s * 2;
const _3s = _1s * 3;
const _4s = _1s * 4;
const _5s = _1s * 5;

const baseTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selection: '#5DA5D533',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#FF7272',
    green: '#5BCC5B',
    brightGreen: '#72FF72',
    yellow: '#CCCC5B',
    brightYellow: '#FFFF72',
    blue: '#5D5DD3',
    brightBlue: '#7279FF',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#72F0FF',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF'
};

function init() {
    const t = new Terminal({
        fontFamily: '"Cascadia Code", Menlo, monospace',
        theme: baseTheme,
        cursorBlink: true
    });
    window.t = t;
    window.game = {};
    t.attachCustomKeyEventHandler(e => {
        //console.log(e);
        if (e.type === "keyup") {
            window.game.lastKey = e;
        }
    });
    t.open(document.getElementById('terminal'));
    t.focus();
}

const styles = {
    boldGreen: "\x1b[32;1m",
    boldRed: "\x1b[31;1m",
    boldYellow: "\x1b[33;1m",
    boldMagenta: "\x1b[35;1m",
    boldBlue: "\x1b[34;1m",
    boldCyan: "\x1b[36;1m",
    default: "\x1b[0m"
};

function setStyle(style) {
    t.write(style);
}

function resetStyle() {
    t.write(styles.default);
}

async function typeln(s) {
    if (s) {
        return type(s + EOL);
    }
    else {
        return type(EOL);
    }
}
    
// TODO: Bold/italics support
async function type(s) {
    return new Promise((resolve) => {
        let i = 0;
        let j = 0;
        const interval = setInterval(() => {
            const si = s[i];
            if (j > 0) {
                j--;
            }
            else {
                // additional delays for punctuation
                if (si == "." || si == "," || si == "!" || si == "?" || si == ";" || si == ":") {
                    j = 3;
                }
                else if (si == " " || si == "-") {
                    j = 2;
                }

                i++;
                t.write(si, () => {
                    if (i >= s.length) {
                        clearInterval(interval);
                        resolve("done");
                    }
                });
            }
        }, _1t);
    });
}

async function wait(delay) {
    if (typeof delay === "undefined") {
        delay = _1s;
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("done");
        }, delay);
    });
}

async function read() {
    await waitKey();
    console.log(window.game.lastKey);
    return window.game.lastKey;
}

async function waitKey() {
    window.game.lastKey = null;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.game.lastKey) {
                clearInterval(interval);
                resolve("done");
            }
        }, 100)
    });
}

async function menu(options, showMenu = true) {
    // TODO: Randomize options order/numbering
    // TODO: Randomly exclude certain options

    if (showMenu) {
        setStyle(styles.boldMagenta);
        for (let i = 0; i < options.length; i++) {
            await typeln(`${i + 1}. ${options[i]}`);
            if (i !== options.length - 1) {
                await wait(_hs);
            }
        }
        resetStyle();
        await typeln();
    }

    // TODO: Add option to don't await input indefinitely - e.g. set timer and "run" CLS command. */
    const key = await read();
    return parseInt(key.key);
}

function parseNote(md) {
    const fmIndex = md.indexOf("---");
    if (fmIndex >= 0) {
        const fmText = md.substring(0, fmIndex);
        const meta = jsyaml.load(fmText);
        return {
            text: md.substring(fmIndex + 3),
            original: md,
            meta: meta
        };
    }
    else {
        // probably error
        return {
            text: md,
            original: md,
            meta: {}
        };
    }
}

// TODO: Need better error handling here
async function fetchIndex() {
    // TODO: Target website branch
    const indexUrl = "https://api.github.com/repos/roman-yagodin/tgl/contents/data";
    return fetch(indexUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then((json) => {
            game.index = json;
            for (let entry of game.index) {
                fetch(entry.download_url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then((text) => {
                        entry.content = text;
                    });
            }
        })
        .catch((error) => {
            console.error(`Could not fetch verse: ${error}`);
        });
}

// TODO: Need a way to go to any progress point for debug
async function main() {
    await scene1_door();
    await typeln();
    await typeln("Game over.");
}

function randomInt(from, to) {
    if (from > to) {
        throw new Error(`Argument "from" must be lesser or equal to the "to"`);
    }
    return Math.floor(Math.random() * (to - from)) + from;
}

async function scene1_door() {
    await typeln("You stand before pretty much arbitrary door.");
    await wait(_hs);
    await typeln("Do you feel anything?");
    await typeln();
    
    await wait(_5s);

    let choice = await menu([
        "I feel *something*!",
        "I don't feel anything...",
        "I do *feel* anything.",
        "I feel EVERYTHING!.."
    ]);

    const x = randomInt(0, 10);
    if (choice === 4) {
        if (x >= 5) {
            choice = 1;
            setStyle(styles.boldRed);
            await typeln("Well, let's believe you, this time...");
            await typeln();
            resetStyle();
        }
        else {
            choice = 2;
        }
    }

    if (choice !== 2) {
        return await scene2_greeting();
    }
    else {
        await typeln("No matter how you try, the door remains shut.");
        return false;
    }

    return true;
}

async function scene2_greeting() {
    // greeting
    game.playerName = randomMsg(["human","@", "reader", "dear", "darling", "humanoid"]);
    game.actionCounter = randomInt(5, 10);

    setStyle(styles.boldGreen);
    await typeln(`> Hello, ${game.playerName}!`);
    await typeln("> Take your time and have fun!");
    resetStyle();

    await typeln();

    // fetch notes
    const p1 = progress("Fetching library index...");
    const p2 = fetchIndex();
    await Promise.all([p1, p2]);

    game.notes = game.index.map(entry => (parseNote(entry.content)));

    console.log(game.notes);

    // to the room
    const noteIndex = randomInt(0, game.notes.length);
    return scene4_room(noteIndex);
}

async function command(command) {
    setStyle(styles.boldYellow);
    await typeln("> " + command);
    resetStyle();
    
    if (command === "CLS") {
        await wait(_hs);
        t.clear();
    }

    return true;
}

async function progress(message) {
    setStyle(styles.boldRed);
    await typeln(message);
    resetStyle();

    await wait(_3s);

    return true;
}

function randomMsg(messages) {
    const msgIndex = randomInt(0, messages.length);
    return messages[msgIndex];
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        return false;
    }
}

async function scene4_room(noteIndex) {

    // TODO: Store progress in local storage or cookie
    // TODO: Randomized questions
    let showNote = true;
    let showMenu = true;
    
    while(true) {

        const note = game.notes[noteIndex];
        if (showNote) {

            await command("CLS");
            const noteLines = note.text.split('\n');

            setStyle(styles.boldCyan);
            for (let i = 0; i < noteLines.length; i++) {
                const line = noteLines[i];
                await typeln('\t' + line);
                await wait(_hs);
            }

            resetStyle();

            await typeln();
            await wait(_5s);
        }

        skipNote = false;

        const choice = await menu([
            randomMsg(["Look left.", "Turn left.", "Turn counter-clockwise."]),
            randomMsg(["Look right.", "Turn right.", "Turn clockwise."]),
            "Copy the note.",
            "Reveal author.",
            "Show hint",
            "Leave...",
        ], showMenu);
        showMenu = false;

        // TODO: Avoid rewriting code when choice list changes

        if (choice === 1) {
            noteIndex--;
            game.actionCounter--;
            if (noteIndex < 0) {
                noteIndex = notes.length - 1;
            }
        }

        if (choice === 2) {
            noteIndex++;
            game.actionCounter--;
            if (noteIndex >= notes.length) {
                noteIndex = 0;
            }
        }

        if (choice === 3) {
            game.actionCounter--;
            const wasCopied = await copyToClipboard(note.original);
            await progress(`Copying to clipboard... ${wasCopied ? "Done." : "Error!"}`);
            await typeln();
            showNote = false;
        }

        if (choice === 4) {
            game.actionCounter--;
            await type("The author is ");
            setStyle(styles.boldCyan);
            await typeln(note.meta.author);
            resetStyle();
            await typeln();
            showNote = false;
        }
        
        if (choice === 5) {
            game.actionCounter--;
            if (note.meta.hints.length > 0) {
                const hintIndex = randomInt(0, note.meta.hints.length);
                const hint = note.meta.hints[hintIndex];
                const hintLines = hint.split('\n');

                for (let i = 0; i < hintLines.length; i++) {
                    const line = hintLines[i];
                    await typeln('\t' + line);
                    await wait(_hs);
                }
            }
            else {
                await typeln("No hints available.");
            }
            showNote = false;
        }

        if (choice === 6) {
            break;
        }

        if (game.actionCounter === 0) {
            await typeln("You are too exhaused, come back another day.");
            break;
        }
    }

    return false;
}

$(() => {
    init();
    main();
});

