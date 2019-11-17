import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { isCommandCategoryEnabled, isCommandEnabled } from '../lib/helpers';

export default class CommandOrCategoryEnabled extends Inhibitor {

    async run(msg: KlasaMessage, cmd: Command) {
        return !isCommandCategoryEnabled(msg, cmd.category) && !isCommandEnabled(msg, cmd);
    }
};
