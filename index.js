const DEBUG = false; // set to false before publish!

const EOL = "\n\r";
const _1t = 10; // type interval

const _1s = 1000;
const _hs = _1s / 2;
const _2s = _1s * 2;
const _3s = _1s * 3;
const _4s = _1s * 4;
const _5s = _1s * 5;

const colorTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selection: '#5DA5D533',
    // black: '#1E1E1D', 
    // brightBlack: '#262625',
    black: '#CE8500', // reuse black for orange (1)
    brightBlack: '#FFA500',
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

const bowTheme = {
    foreground: '#111111',
    background: '#FFFFFF',
    selection: '#CCCCCC',
    black: '#222222', 
    brightBlack: '#333333',
    red: '#222222',
    brightRed: '#333333',
    green: '#222222',
    brightGreen: '#333333',
    yellow: '#222222',
    brightYellow: '#333333',
    blue: '#222222',
    brightBlue: '#333333',
    magenta: '#222222',
    brightMagenta: '#333333',
    cyan: '#222222',
    brightCyan: '#333333',
    white: '#DDDDDD',
    brightWhite: '#EEEEEE',
    cursor: '#111111'
};

const styles = {
    default: "\x1b[0m",
    bold: "\x1b[1m",
    faint: "\x1b[2m",
    italics: "\x1b[3m",
    nonBold: "\x1b[22m", // neither bold nor faint
    nonItalics: "\x1b[23m",
    orange: "\x1b[30m", // reuse black for orange (2)
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

const playerNames = [
    "@",
    "player",
    "user",
    "operator",
    "human",
    "humanoid",
    "creature",
    "creator",
    "reader",
    "dear",
    "darling",
    "precious",
    "friend",
    "child",
    "adventurer",
    "traveler",
    "wanderer",
];

class Game {
    constructor() {
        this.state = {};
    }

    isNewGame() {
        return this.state.breadCrumbs && this.state.breadCrumbs.length === 0;
    }

    loadOrNew() {
        const stateStr = localStorage.getItem("tgl_game_state");
        if (stateStr) {
            this.state = JSON.parse(stateStr);
            // TODO: Try-catch
            // TODO: Check format of resulting state - if may be from old version
        }
        else {
            this.state = {
                actionCounter: 0,
                playerName: randomMsg(playerNames),
                returnAfter: null,
                breadCrumbs: []
            };

            this.resetActionCounter();
        }

        this.notes = notes;

        this.saveState();
    }

    saveState() {
        localStorage.setItem("tgl_game_state", JSON.stringify(this.state));
    }

    resetActionCounter() {
        this.state.actionCounter = randomInt(10, 15);
        return this.state.actionCounter;
    }

    decrementActionCounter(n = 1) {
        this.state.actionCounter -= n;
        if (this.state.actionCounter < 0) {
            this.state.actionCounter = 0;
        }

        if (this.state.actionCounter === 0) {
            this.setReturnAfter();
        }

        return this.state.actionCounter;
    }

    incrementActionCounter(n) {
        this.state.actionCounter += n;
        this.resetReturnAfter();
        return this.state.actionCounter;
    }

    setReturnAfter() {
        const nowDate = new Date();
        const returnAfterDate = new Date();
        returnAfterDate.setHours(nowDate.getHours() + 12);

        this.state.returnAfter = returnAfterDate;

        console.log({ nowDate: nowDate, returnAfterDate: returnAfterDate });
    }

    resetReturnAfter() {
        this.state.returnAfter = null;
    }

    checkReturnAfter() {
        // don't check returnAfter date when debugging
        if (DEBUG) {
            return true;
        }

        if (typeof this.state.returnAfter === "undefined" || !this.state.returnAfter) {
            return true;
        }

        const nowDate = new Date();
        if (this.state.returnAfter && nowDate >= this.state.returnAfter) {
            return true;
        }
        return false;
    }

    getStartNote() {
        // TODO: Other starting authors?
        const startNotes = game.notes.filter(n => (n.meta.author === "Lewis Carroll"));
        const startNoteIndex = randomInt(0, startNotes.length);
        return startNotes[startNoteIndex];
    }
}

function init() {
    const t = new Terminal({
        // TODO: Review font list
        fontFamily: '"Cascadia Code", Menlo, monospace',
        theme: bowTheme,
        cursorBlink: true
    });

    window.t = t;
    window.game = new Game();

    const fitAddon = new FitAddon.FitAddon();
    t.loadAddon(fitAddon);
    t.open(document.getElementById('terminal'));
    fitAddon.fit();

    t.attachCustomKeyEventHandler(e => {
        //console.log(e);
        if (e.type === "keyup") {
            window.game.lastKey = e;
        }
    });

    window.addEventListener("resize", (e) => {
        fitAddon.fit();
    });
}

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
    
async function type(s) {
    
    s = s.replace("\\b", "\b");

    // bold
    s = s.replace(/\*([^\s\.,;:!\?-])/g, styles.bold + "$1");
    s = s.replace(/\*([\s\.,;:!\?-])/g, styles.nonBold + "$1");

    // italics
    s = s.replace(/\_([^\s\.,;:!\?-])/g, styles.italics + "$1");
    s = s.replace(/\_([\s\.,;:!\?-])/g, styles.nonItalics + "$1");

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

async function menu(options, showOptions = true) {
    // TODO: Randomize options order/numbering
    // TODO: Randomly exclude excludable options

    if (showOptions) {
        setStyle(styles.magenta);
        for (let i = 0; i < options.length; i++) {
            if (i > 0) {
                await typeln(`${i}. ${options[i].text}`);
                await wait(_hs);
            }
        }
        resetStyle();
    }

    while (true) {
        const key = await readKey();
        const numKey = parseInt(key);
        if (numKey !== NaN && numKey >= 0 && numKey < options.length) {
            return options[numKey].choice;
        }
    }
}

async function waitKey() {
    t.focus();
    game.lastKey = null;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (game.lastKey) {
                clearInterval(interval);
                console.log({key: game.lastKey});
                resolve(game.lastKey);
            }
        }, 100)
    });
}

async function readKey(prompt = "?? ", echo = true) {
    while (true) {

        // prompt
        setStyle(styles.faint + styles.magenta);
        await type(prompt);
        resetStyle();

        // TODO: Add option to don't await input indefinitely - e.g. set timer and "run" CLS command from time to time. 
        const key = await waitKey();

        if (echo) {
            setStyle(styles.bold + styles.magenta);
            await typeln("\b".repeat(prompt.length) + "<< " + key.key);
            resetStyle();
        }
        else {
            await type("\b".repeat(prompt.length));
        }

        return key.key;
    }
}

function setTheme(theme) {
    t.options.theme = theme;
    if (theme.background === bowTheme.background) {
        $(".terminal-box").removeClass("theme-color").addClass("theme-bow");
    }
    else {
        $(".terminal-box").removeClass("theme-bow").addClass("theme-color");
    }
}

async function main() {
    await scene1_puzzlebox();

    await command("CLS");
    setTheme(bowTheme);
    await typeln("Game over.");
}

function randomInt(from, to) {
    if (from > to) {
        throw new Error(`Argument "from" must be lesser or equal to the "to".`);
    }
    
    Math.random();
    Math.random();
    Math.random();
    return Math.floor(Math.random() * (to - from)) + from;
}

function randomYes(prob) {
    if (prob < 0.0 || prob > 1.0) {
        throw new Error(`Argument "prob" must be in [0..1] range.`);
    }

    Math.random();
    Math.random();
    Math.random();
    return prob >= Math.random();
}

async function puzzle1() {
    await typeln("You stand before pretty much arbitrary door.");
    await wait(_1s);

    const thing = randomMsg(["anything", "something"]);
    await typeln(`Do you feel ${thing}?`);
    await wait(_4s);

    await typeln();
    let choice = await menu([
        { text: "", choice: "nothing" },
        { text: "I feel *something*!", choice: "something" },
        { text: "I don't feel anything...", choice: "nothing" },
        { text: "I do _feel_ anything.", choice: "anything" },
        { text: "I feel EVERYTHING!..", choice: "everything" }
    ]);
    
    if (choice === "everything") {
        if (randomYes(0.1)) {
            choice = thing;
        }
        else {
            choice = "nothing";
        }
    }
    
    if (choice === "something" || choice === "anything") {
        if (choice !== thing && randomYes(0.5)) {
            choice = thing;
        }
    }

    if (choice === thing) {
        await typeln();
        await typeln("You reach out your hand to the door handle,");
        await wait(_1s);
        await typeln("  but the moment before you touch it, the door opens!");
        return true;
    }
    else {
        await typeln();
        await typeln("You walked away.");
        return false;
    }
}

async function scene1_puzzlebox() {
    // TODO: Select random puzzle
    const pass = await puzzle1();
    if (pass) {
        setTheme(colorTheme);
        await command("CLS");
        return await scene2_greeting();
    }
    return false;
}

async function scene2_greeting() {
    
    game.loadOrNew();
    
    if (!game.checkReturnAfter()) {
        await tooExhausted();
        return false;
    }
    else {
        if (game.state.actionCounter <= 0) {
            game.resetActionCounter();
            game.saveState();
        }
    }

    // greeting
    const hello = game.isNewGame() ? "Hello" : "Welcome back"
    setStyle(styles.bold + styles.green);
    await typeln(`> ${hello}, ${styles.cyan}${game.state.playerName}!${styles.green}`);
    await typeln("> Take your time and have fun!");
    resetStyle();

    // TODO: Main menu

    setStyle(styles.bold + styles.red);
    await typeln();

    if (game.isNewGame()) {
        await type(`${randomMsg(["Imagining", "Creating", "Forging"])} the world... `);
    }
    else {
        await type(`${randomMsg(["Re-imagining", "Re-thinking", "Re-creating", "Twisting", "Mutating", "Transforming"])} the world... `);
    }
    
    await wait(_4s);
    await typeln(randomMsg(["Done.", "Done.", "Yes!", "Meow!", "Wow!", "Clap!", "Slap!", "Plop!", "Boom!"]));
    await wait(_4s);

    await typeln();
    await readKey("...", false);

    // to the world
    if (game.isNewGame()) {
        const note = game.getStartNote();
        game.state.breadCrumbs.push(note.id);
        game.saveState();
        return scene4_world(note);
    }
    else {
        const lastNoteId = game.state.breadCrumbs[game.state.breadCrumbs.length - 1];
        const note = game.notes.find(n => (n.id === lastNoteId));
        if (note) {
            return scene4_world(note);
        }
        else {
            // TODO: Your track is lost, return to main menu?
            throw new Error(`Note not found: ${lastNoteId}`);
        }
    }

    return false;
}

async function command(command) {
    setStyle(styles.bold + styles.yellow);
    await typeln("> " + command);
    resetStyle();
    
    if (command === "CLS") {
        await wait(_hs);
        t.clear();
    }

    await wait(_1s);
    return true;
}

async function progress(message) {
    setStyle(styles.bold + styles.red);
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
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function tooExhausted() {
    setStyle(styles.bold + styles.red);
    await typeln();
    const hasty = ["hasty", "exhausted"];
    const later = ["another day", "later", "tomorrow"];
    await typeln(`You are too ${randomMsg(hasty)}, come back ${randomMsg(later)}.`);
    resetStyle();
}

async function reachedEOW() {
    setStyle(styles.bold + styles.red);
    await typeln();
    await typeln("You've reached the end of the world and stepped back...");
    await typeln();
    resetStyle();
}

function randomNoteColor(note) {
    const colorIndex = randomInt(0, note.meta.colors.length);
    return note.meta.colors[colorIndex];
}

async function typeNote(note, noteColor) {
    const noteLines = note.text.split('\n');
    setStyle(styles.bold + styles[noteColor]);
    for (let i = 0; i < noteLines.length; i++) {
        const line = noteLines[i];
        // TODO: Add leading \t for desktop?
        await typeln("▌ " + line);
        await wait(_hs);
    }
    resetStyle();
    await typeln();
}

async function scene4_world(note) {

    let showNote = true;
    let showMenu = true;
    let noteColor = randomNoteColor(note);

    while(true) {

        if (showNote) {
            await typeln();
            await command("CLS");
            await typeNote(note, noteColor);
            showNote = false;

            await readKey("...", false);
        }

        const choice = await menu([
            { text: "", choice: "showMenu" },
            { text: "Follow author.", choice: "followAuthor" },
            { text: "Follow color.", choice: "followColor" },
            { text: "Follow language.", choice: "followLanguage" },
            // TODO: Move utilities to submenu or review mode?
            { text: "Copy the note.", choice: "copy" },
            // TODO: Combine with hint
            { text: "Reveal the author.", choice: "author" },
            { text: "Show hint.", choice: "hint" },
            { text: "Leave...", choice: "leave" },
        ], showMenu);
        showMenu = false;
        
        game.decrementActionCounter();
        game.saveState();

        if (game.state.actionCounter <= 0) {
            await tooExhausted();
            break;
        }

        if (choice === "showMenu") {
            await typeln();
            showMenu = true;
        }

        if (choice === "followAuthor") {
            const nextNote = game.notes.find(n => {
                if (n.meta.author == note.meta.author && !game.state.breadCrumbs.includes(n.id)) {
                    return true;
                }
                return false;
            });

            if (nextNote) {
                note = nextNote;
                game.state.breadCrumbs.push(note.id);
                game.saveState();
            }
            else {
                await reachedEOW();
            }

            noteColor = randomNoteColor(note);
            showNote = true;
            showMenu = true;
        }

        if (choice === "followColor") {
            const nextNote = game.notes.find(n => {
                if (n.meta.colors.includes(noteColor) && !game.state.breadCrumbs.includes(n.id)) {
                    return true;
                }
                return false;
            });

            if (nextNote) {
                note = nextNote;
                game.state.breadCrumbs.push(note.id);
                game.saveState();
            }
            else {
                await reachedEOW();
                noteColor = randomNoteColor(note);
            }
            showNote = true;
            showMenu = true;
        }

        if (choice === "followLanguage") {
            const nextNote = game.notes.find(n => {
                if (n.meta.lang === note.meta.lang && !game.state.breadCrumbs.includes(n.id)) {
                    return true;
                }
                return false;
            });

            if (nextNote) {
                note = nextNote;
                game.state.breadCrumbs.push(note.id);
                game.saveState();
            }
            else {
                await reachedEOW();
                noteColor = randomNoteColor(note);
            }
            showNote = true;
            showMenu = true;
        }
        
        if (choice === "copy") {
            const wasCopied = await copyToClipboard(note.original);
            await typeln();
            await progress(`Copying to clipboard... ${wasCopied ? "Done." : "Error!"}`);
            await typeln();
        }
        
        if (choice === "author") {
            await typeln();
            await typeln(`The author is ${styles.cyan + styles.bold}${note.meta.author}${styles.default}.`);
            await typeln();
        }
        
        if (choice === "hint") {
            if (note.meta.hints.length > 0) {
                const hintIndex = randomInt(0, note.meta.hints.length);
                const hint = note.meta.hints[hintIndex];
                const hintLines = hint.split('\n');

                await typeln();
                for (let i = 0; i < hintLines.length; i++) {
                    const line = hintLines[i];
                    // TODO: Add leading \t for desktop?
                    await typeln("▌ " + line);
                    await wait(_hs);
                }
                await typeln();
            }
            else {
                // TODO: Randomly deny hints, even there is some
                await typeln();
                await typeln("No hints available.");
                await typeln();
            }
        }
        
        if (choice === "leave") {
            game.incrementActionCounter(randomInt(5, 10));
            game.saveState();
            setStyle(styles.bold + styles.green);
            await typeln();
            await typeln(`> Goodbye, ${styles.cyan}${game.state.playerName}${styles.green}! And come back soon.`);
            await typeln();
            resetStyle();
            break;
        }
    }

    return false;
}

$(() => {
    init();
    main();
});

