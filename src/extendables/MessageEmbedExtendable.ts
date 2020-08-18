import { MessageEmbed, Util } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
    public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [MessageEmbed] });
    }
    
    setDescription(this: MessageEmbed, description: string | string[]) {
        if(description) {
            description = Util.resolveString(description);
            this.description = description;
        } else {
            delete this.description;
        }

        return this;
    }

}