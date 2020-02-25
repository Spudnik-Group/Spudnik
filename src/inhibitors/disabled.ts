/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { isCommandCategoryEnabled, isCommandEnabled } from '@lib//helpers';

export default class CommandOrCategoryEnabled extends Inhibitor {

	public run(msg: KlasaMessage, cmd: Command) {
		const categoryDisabled = !isCommandCategoryEnabled(msg, cmd.category);
		const commandDisabled = !isCommandEnabled(msg, cmd);

		return commandDisabled || categoryDisabled;
	}

}
