import { PermissionLevels } from "klasa";

export const permissionLevels = new PermissionLevels()
    .add(1, ({ guild, member }) => guild && member.permissions.has('MANAGE_MESSAGES'), { fetch: true })
    .add(2, ({ guild, member }) => guild && member.permissions.has('MANAGE_ROLES'), { fetch: true })
    .add(3, ({ guild, member }) => guild && member.permissions.has('KICK_MEMBERS'), { fetch: true })
    .add(4, ({ guild, member }) => guild && member.permissions.has('BAN_MEMBERS'), { fetch: true });
// TODO: add staff feature
// .add(5, ({ guild, author }) => guild.settings['staff'].includes(author.id));
