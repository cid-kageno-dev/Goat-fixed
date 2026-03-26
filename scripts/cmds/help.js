const fs = require("fs-extra");
const path = require("path");
const { createCanvas, registerFont } = require("canvas");

// 1. REGISTER FONT GLOBALLY (Outside of the command)
const fontPath = path.join(__dirname, "assets", "font", "BeVietnamPro-Bold.ttf");
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: "BeVietnamPro" });
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "h", "commands"],
    version: "3.5 • ALPHA AI EDITION",
    author: "Cid",
    shortDescription: "Alpha AI command interface",
    longDescription: "ALPHA AI Edition — A premium, intelligent, system-level command menu.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix, event }) {
    const { commands, usersData } = global.GoatBot;
    const { senderID } = event;

    /* ──────────────── CATEGORY MAP & COUNTS ──────────────── */
    const categories = {};
    let totalCommands = 0;

    const cleanCategory = (t) => t ? t.normalize("NFKD").replace(/[^\w\s-]/g, "").toLowerCase() : "other";

    for (const [, cmd] of commands) {
      const cat = cleanCategory(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
      totalCommands++;
    }

    /* ──────────────── USER NAME ──────────────── */
    let userName = "Member";
    try {
      const u = await usersData.get(senderID);
      if (u?.name) userName = u.name;
    } catch (e) {}

    /* ──────────────── SINGLE COMMAND VIEW (TEXT ONLY) ──────────────── */
    if (args[0]) {
      const q = args[0].toLowerCase();
      const cmd = commands.get(q) || [...commands.values()].find(c => (c.config.aliases || []).includes(q));

      if (!cmd) return message.reply(`⛔ COMMAND "${q}" NOT FOUND`);

      const { name, version, author, guide, category, shortDescription, aliases, role } = cmd.config;
      const roleText = role === 2 ? "OWNER" : role === 1 ? "ADMIN" : "USER";

      let descText = "None";
      if (shortDescription) {
        if (typeof shortDescription === "string") descText = shortDescription;
        else if (typeof shortDescription === "object") descText = shortDescription.en || Object.values(shortDescription)[0] || "None"; 
      }

      let usage = `${prefix}${name}`;
      if (guide) {
        if (typeof guide === "string") usage = guide.replace(/{pn}/g, prefix);
        else if (typeof guide === "object") usage = Object.values(guide)[0].replace(/{pn}/g, prefix);
      }

      return message.reply(
        `╔════ COMMAND DATA ════╗\n\n` +
        `▸ Name        : ${name.toUpperCase()}\n` +
        `▸ Category    : ${category || "Unknown"}\n` +
        `▸ Description : ${descText}\n` +
        `▸ Aliases     : ${aliases?.join(", ") || "None"}\n` +
        `▸ Clearance   : ${roleText}\n` +
        `▸ Usage       : ${usage}\n\n` +
        `╚════════════════════╝`
      );
    }

    /* ──────────────── MAIN MENU: GENERATE BANNER ──────────────── */
    
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext("2d");

    // Draw Background
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add accent line
    ctx.fillStyle = "#00e5ff"; 
    ctx.fillRect(0, 0, canvas.width, 10);

    // Draw Main Title (Removed "bold" from the string so it reads the TTF correctly)
    ctx.font = '55px "BeVietnamPro"';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("ALPHA AI CORE", canvas.width / 2, 90);

    // Draw Subtitle / Welcome message
    ctx.font = '35px "BeVietnamPro"';
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(`Welcome, ${userName}`, canvas.width / 2, 150);

    // Draw Bot Stats
    ctx.font = '25px "BeVietnamPro"';
    ctx.fillStyle = "#00e5ff";
    ctx.fillText(`${totalCommands} Commands  |  Prefix: [ ${prefix} ]`, canvas.width / 2, 210);

    // Save the image temporarily
    const bannerPath = path.join(__dirname, "assets", `banner_${event.messageID}.png`);
    fs.writeFileSync(bannerPath, canvas.toBuffer("image/png"));

    /* ──────────────── MAIN MENU: TEXT LIST ──────────────── */
    const categoryEmojis = {
      admin: "🛡️", ai: "🧠", "ai-generated": "📂", boxchat: "📂", custom: "📂",
      economy: "💰", fun: "🎭", game: "🎮", image: "🖼️", info: "ℹ️", music: "🎵",
      system: "⚙️", tools: "🧰", utility: "🔌", premium: "💎", other: "📂"
    };

    let msg = `─────────────────────\n\n`;

    for (const cat of Object.keys(categories)) {
      const emoji = categoryEmojis[cat] || "📂";
      msg += `╭── 『 ${emoji} ${cat.replace(/-/g, " ").toUpperCase()} 』\n`;
      msg += `│ ⭓ ${categories[cat].join("  ⭓ ")}\n`;
      msg += `╰───────────────◊\n\n`;
    }

    msg += `╭───────────────────╮\n`;
    msg += `│ 💡 Type: ${prefix}help <cmd>\n`;
    msg += `│    for command data\n`;
    msg += `╰────────────────────╯`;

    // Send the text AND the generated image banner together!
    return message.reply({
      body: msg,
      attachment: fs.createReadStream(bannerPath)
    }, () => fs.unlinkSync(bannerPath)); 
  }
};