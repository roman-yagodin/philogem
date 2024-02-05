// to run script: node buildData.js

const fs = require('fs');
const yaml = require('js-yaml');

function parseNote(md) {
    const fmIndex = md.indexOf("---");
    if (fmIndex >= 0) {
        const fmText = md.substring(0, fmIndex);
        const meta = yaml.load(fmText);
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

const dataFolder = './data/';
const fileNames = fs.readdirSync(dataFolder, { recursive: true });
const notes = [];

fileNames.forEach(fileName => {
    if (fileName.endsWith(".md")) {
        const content = fs.readFileSync(`./data/${fileName}`, 'utf8');
        const dirSepIndex = fileName.lastIndexOf("\\");
        const shortFileName = dirSepIndex >= 0 ? fileName.substring(dirSepIndex + 1) : fileName;
        const note = parseNote(content);
        note.id = shortFileName.replace(/\.md/g, '');
        note.lang = note.lang || "en";
        if (!note.meta.colors || !note.meta.author) {
            console.error(`Error parsing frontmatter: ${note.id}.`);
        }
        const existingNote = notes.find(n => (n.quid === note.id));
        if (!existingNote) {
            notes.push(note);
        }
        else {
            console.error(`Duplicate note id: ${note.id}.`);
        }
    }
});

const data = "const notes = " + JSON.stringify(notes) + ";";
fs.writeFileSync('./js/data.js', data);