import { Command } from "klasa";
import * as fs from 'fs';

export const hexColor = (color) => {
    if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
        return true;
    } else if (color === '') {
        return true;
    }

    return 'Please provide a valid color hex number.';
}

export const commandOrCategory = (cmdOrCategory) => {
    if (!cmdOrCategory) throw 'Please provide a valid command or command category name';
    const command = this.client.commands.array().find((command: Command) => command.name.toLowerCase() === cmdOrCategory.toLowerCase());
    if (command) return cmdOrCategory; // valid command name

    const categories: any[] = fs.readdirSync('commands')
        .filter(path => fs.statSync(`commands/${path}`).isDirectory());
    const category = categories.find(category => category === cmdOrCategory.toLowerCase());
    if (category) return cmdOrCategory; // valid category name

    throw 'Please provide a valid command or command category name';
}
