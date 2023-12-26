const EOL = "\n\r";
const _1t = 10; // type interval

const _1s = 1000;
const _hs = _1s / 2;
const _2s = _1s * 2;
const _3s = _1s * 3;
const _5s = _1s * 5;

function init() {
    const t = new Terminal();
    window.t = t;
    window.tgl = {};
    t.attachCustomKeyEventHandler(e => {
        //console.log(e);
        if (e.type === "keyup") {
            window.tgl.lastKey = e;
        }
    });
    t.open(document.getElementById('terminal'));
    t.focus();
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
    console.log(window.tgl.lastKey);
    return window.tgl.lastKey;
}

async function waitKey() {
    window.tgl.lastKey = null;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.tgl.lastKey) {
                clearInterval(interval);
                resolve("done");
            }
        }, 100)
    });
}

async function menu(options) {
    // TODO: Randomize options order/numbering
    for (let i = 0; i < options.length; i++) {
        await typeln(`${i + 1}. ${options[i]}`);
        if (i !== options.length - 1) {
            await wait(_hs);
        }
    }

    // TODO: Add option to don't await input indefinitely - e.g. set timer and "run" CLS command. */
    const key = await read();
    await typeln();

    return parseInt(key.key);
}

async function loadNote() {
    // TODO: Load markdown notes from Github public API https://api.github.com/repos/roman-yagodin/tgl/contents/. 
    const notes = [
`
If you limit your actions in life
to things that nobody can possibly find fault with,
you will not do much!

_Lewis Carroll_
---
Q1. What's the _thing that nobody can possibly find fault with_?
Come up with an example you can share with others.
`,

`
One of the secrets of life
is that all that is really worth the doing
is what we do for others.

_Lewis Carroll_
---
Q1. Remember the last major (or minor) thing you have done today. 
Was it just for you, for the others, or both?
`,

`
One of the hardest things in the world
is to convey a meaning accurately
from one mind to another.

_Lewis Carroll_
---
Q1. What the word _accurately_ means here?
`
    ];

    const noteIndex = Math.floor(Math.random() * notes.length);
    return notes[noteIndex];    
}

async function main() {
    //const x1 = await start1();
    const x1 = true;
    if (!x1)
        return false;

    return await notesLoop();
}

async function start1() {
    await typeln("You stand before pretty much arbitrary door.");
    await wait(_hs);
    await typeln("Do you feel anything?");
    await typeln();
    
    await wait(_5s);

    const choice = await menu([
        "I feel *something*!",
        "I don't feel anything...",
        "I do *feel* anything."
    ]);

    console.log(choice);

    if (choice === 2) {
        await typeln("No matter how you try, the door remains shut.");
        await typeln("Game over.");
        return false;
    }

    return true;
}

async function notesLoop() {
    // TODO: Store progress in local storage or cookie
    // TODO: Need a way to go to any progress point for debug
    // TODO: Note parsing, randomized questions
    while(true) {

        t.clear();

        const note = await loadNote();
        const noteLines = note.split('\n');
        for (let i = 0; i < noteLines.length; i++) {
            const line = noteLines[i];
            if (line === "---") {
                await typeln();
                await wait(_5s);
            }
            else {
                await typeln('\t' + line);
                await wait(_hs);
            }
        }

        await typeln();
        await wait(_5s);

        await typeln("press any key then ready...");
        await read();
    }

    return true;
}

$(() => {
    init();
    main();
});

