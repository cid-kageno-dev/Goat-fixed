const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp", "pp"],
    version: "1.5",
    author: "cid-kageno-dev",
    countDown: 5,
    role: 0,
    category: "Utility",
    guide: "{pn} [uid/@mention/reply]"
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    let filePath;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // ===== 1. GET UID & DATA =====
      let uid = event.senderID;
      if (event.messageReply) {
        uid = event.messageReply.senderID;
      } else if (Object.keys(event.mentions || {}).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (args[0]) {
        uid = args[0];
      }

      const userData = await usersData.get(uid);
      const rawName = userData?.name || "Facebook User";

      // FIX: Clean name for Canvas (removes boxes), but we keep rawName for the text message
      const name = rawName.replace(/[^\p{L}\p{N}\s\-_.'"]/gu, '').trim() || "User";

      // ===== 2. IMAGE SOURCES =====
      // Using the Token for higher quality/reliability
      const ACCESS_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const pfpUrl = `https://graph.facebook.com/${uid}/picture?height=1024&width=1024&access_token=${ACCESS_TOKEN}`;
      
      let coverUrl = null;

      // Method A: Global Utils
      try {
        if (global.utils?.getCover) coverUrl = await global.utils.getCover(uid);
      } catch (e) {}

      // Method B: Scrape fallback
      if (!coverUrl) {
        try {
          const res = await axios.get(`https://www.facebook.com/${uid}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 2500
          });
          const match = res.data.match(/"coverPhoto":{"photo":{"image":{"uri":"(.*?)"/);
          if (match) coverUrl = match[1].replace(/\\u0025/g, "%").replace(/\\\//g, "/");
        } catch (e) {}
      }

      // Method C: Default Premium Background
      if (!coverUrl) {
        coverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
      }

      // ===== 3. LOAD & RENDER =====
      const [pfp, cover] = await Promise.all([
        loadImage(pfpUrl).catch(() => loadImage("https://i.imgur.com/6ve7Y9Z.png")),
        loadImage(coverUrl)
      ]);

      const canvas = createCanvas(1200, 450);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.drawImage(cover, 0, 0, canvas.width, canvas.height);

      // Dark Gradient Overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, 450);
      gradient.addColorStop(0, "rgba(0,0,0,0.3)");
      gradient.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glassmorphism Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      if (ctx.roundRect) {
         ctx.roundRect(300, 175, 550, 150, 25);
      } else {
         ctx.rect(300, 175, 550, 150); // Fallback for older canvas versions
      }
      ctx.fill();

      // Outer Border Glow
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 45, 1140, 360);

      // Profile Circle
      const size = 210;
      const pX = 160;
      const pY = 250;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pX, pY, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(pfp, pX - size / 2, pY - size / 2, size, size);
      ctx.restore();

      // PFP Glow Ring
      ctx.beginPath();
      ctx.arc(pX, pY, size / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.stroke();

      // --- TEXT ---
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px sans-serif";
      ctx.fillText(name, 340, 240);

      ctx.font = "24px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`UID: ${uid}`, 340, 290);

      // ===== 4. SAVE & SEND =====
      filePath = path.join(__dirname, `p_${uid}_${Date.now()}.png`);
      await fs.outputFile(filePath, canvas.toBuffer("image/png"));

      await message.reply({
        body: `✨ Premium ID Card for ${rawName}`, // Original name in chat
        attachment: fs.createReadStream(filePath)
      });

      // Cleanup
      await fs.remove(filePath);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Error: " + err.message);
      if (filePath) await fs.remove(filePath).catch(() => {});
    }
  }
};