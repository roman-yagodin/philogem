const EOL = "\n\r";
const _1t = 10; // type interval

const _1s = 1000;
const _hs = _1s / 2;
const _5s = 5 * _1s;

function init(t) {
    window.t = t;
    window.tgl = {};
    t.attachCustomKeyEventHandler(e => {
        //console.log(e);
        if (e.type === "keyup") {
            window.tgl.lastKey = e;
        }
    });
    t.open(document.getElementById('terminal'));
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

async function menu() {
}

async function main() {
    return start1();
}

async function start1() {
    await typeln("You stand before pretty much arbitrary door.");
    await wait(_hs);
    await typeln("Do you feel anything?");
    await typeln();
    
    await wait(_5s);

    await typeln("1. I feel *something*!");
    await wait(_hs);
    await typeln("2. I feel anything.");
    await wait(_hs);
    await typeln("3. I do not feel anything...");

    const key = await read();
    await typeln();

    if (key.key == "3") {
        await typeln("No matter how you try, the door remains shut.");
        await typeln("Game over.");
        return 1;
    }

    return 0;
}

var t = new Terminal();
init(t);
main();
