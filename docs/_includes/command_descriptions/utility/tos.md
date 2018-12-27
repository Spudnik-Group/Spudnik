Used to configure the Terms of Service for a guild.<br />
syntax: `!tos (channel|title|body|list) (#channelMention | message number) (text)`<br />
<br />
`channel <#channelMention>` - Sets the channel to display the terms of service in.<br />
`title <info block number> <text>` - Edit the title of a terms of service info block.<br />
`body <info block number> <text>` - Edit the body of a terms of service info block.<br />
`list` - returns all the terms of service info blocks.<br />
If no subCommand is supplied, bot responds with embedded TOS content.<br />
<br />
MANAGE_GUILD permission required.