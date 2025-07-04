require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 8000;

const ADMINS = process.env.ADMINS.split(",");

const loggedInAdmins = new Set();

bot.command("login", (ctx) => {
  const parts = ctx.message.text.split(" ");
  if (parts[1] === process.env.ADMIN_PASSWORD) {
    loggedInAdmins.add(ctx.from.id.toString());
    return ctx.reply("✅ সফলভাবে লগইন হয়েছে!");
  }
  ctx.reply("❌ ভুল পাসওয়ার্ড!");
});

bot.command("logout", (ctx) => {
  loggedInAdmins.delete(ctx.from.id.toString());
  ctx.reply("🚪 লগআউট সম্পন্ন হয়েছে।");
});

function isAdmin(id) { return ADMINS.includes(id.toString()) && loggedInAdmins.has(id.toString());
  return ADMINS.includes(id.toString());
}

let users = {};
let giveawayEntries = [];
let orders = {};

bot.start((ctx) => {
  const name = ctx.from.first_name;
  const userId = ctx.from.id;

  if (!users[userId]) {
    users[userId] = {
      username: ctx.from.username || "no_username",
      referredBy: ctx.message.text.split(" ")[1] || null,
    };
    if (users[userId].referredBy) {
      giveawayEntries.push(users[userId].referredBy);
    }
  }

  ctx.reply(
    `👋 হ্যালো ${name}!

স্বাগতম *FF Diamond Pro Bot*-এ!

শুধু বাংলাদেশ সার্ভারের জন্য।`,
    {
      reply_markup: {
        keyboard: [
          ["💎 ডায়মন্ড কিনুন", "🎁 গিভঅ্যাওয়ে"],
          ["📢 রেফার করুন", "💎 অফার ও প্যাকেজ"],
          ["ℹ️ সাহায্য"],
        ],
        resize_keyboard: true,
      },
      parse_mode: "Markdown",
    }
  );
});

bot.hears("💎 ডায়মন্ড কিনুন", (ctx) => {
  ctx.reply("🛒 আপনার UID ও সার্ভার কোড দিন:\n\nExample: `123456789 | 301`", {
    parse_mode: "Markdown",
  });
});

bot.hears("🎁 গিভঅ্যাওয়ে", (ctx) => {
  ctx.reply("🎉 গিভঅ্যাওয়ে অংশ নিতে /refer চাপুন এবং বন্ধুদের রেফার করুন।");
});

bot.hears("📢 রেফার করুন", (ctx) => {
  const id = ctx.from.id;
  const link = `https://t.me/${bot.botInfo.username}?start=${id}`;
  ctx.reply(`🔗 আপনার রেফারেল লিংক:\n${link}`);
});

bot.hears("ℹ️ সাহায্য", (ctx) => {
  ctx.reply("❓ সহায়তার জন্য যোগাযোগ করুন: @rifatbro22");
});

bot.hears("💎 অফার ও প্যাকেজ", (ctx) => {
  ctx.replyWithMarkdownV2(`

📦 *Free Fire Diamond Offers (বাংলাদেশি সার্ভার)* 💥

1\. 25💎 = 28৳  
2\. 50💎 = 45৳  
3\. 115💎 = 95৳  
4\. 240💎 = 185৳  
5\. 355💎 = 270৳  
6\. 480💎 = 360৳  
7\. 610💎 = 490৳  
8\. 725💎 = 595৳  
9\. 850💎 = 630৳  
10\. 1090💎 = 805৳  
11\. 1240💎 = 900৳  
12\. 1480💎 = 1120৳  
13\. 1720💎 = 1270৳  
14\. 1850💎 = 1350৳  
15\. 2090💎 = 1500৳  
16\. 2530💎 = 1690৳  
17\. 3140💎 = 2400৳  
18\. 3770💎 = 2700৳  
19\. 5060💎 = 3670৳  
20\. 10120💎 = 6900৳

⭐ *Other Offers:*  
• Weekly = 165৳  
• Monthly = 800৳  
• Level Up Pass = 170৳

🎯 *Evo Access Package:*  
• 3 Day = 80৳  
• 7 Day = 120৳  
• 30 Day = 400৳  
• 30 Day ×2 = 650৳

🎯 *Weekly Lite Package:*  
• ×1 = 45৳  
• ×2 = 90৳  
• ×3 = 135৳  
• ×5 = 225৳  
• ×10 = 450৳

📌 *Rules:*
🔹 শুধুমাত্র *Free Fire* এর জন্য টপ আপ  
🔹 শুধু *UID ও বাংলাদেশের সার্ভার (301)* গ্রহণযোগ্য  
🔹 পেমেন্টের পরে অর্ডার প্রসেস হবে  
🔹 অর্ডার বাতিল হলে Refund দেওয়া হবে

🚀 অর্ডার করতে '💎 ডায়মন্ড কিনুন' বাটনে ক্লিক করুন!

`);
});

bot.on("text", (ctx) => {
  const msg = ctx.message.text;
  const parts = msg.split("|");
  if (parts.length === 2) {
    const uid = parts[0].trim();
    const server = parts[1].trim();
    if (server === "301") {
      orders[uid] = {
        from: ctx.from,
        status: "pending",
      };
      ctx.reply(`✅ UID ${uid} সফলভাবে গ্রহণ করা হয়েছে। আপনার অর্ডার প্রক্রিয়াধীন রয়েছে।`);
      bot.telegram.sendMessage(
        ADMINS[0],
        `🆕 নতুন অর্ডার:\nUID: ${uid}\nUser: @${ctx.from.username || "No Username"} (${ctx.from.id})`
      );
    } else {
      ctx.reply("❌ আমরা শুধু বাংলাদেশ (server code: 301) সার্ভার গ্রহণ করি!");
    }
  }
});

bot.command("confirm", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("⛔ আপনি অ্যাডমিন নন!");
  const uid = ctx.message.text.split(" ")[1];
  if (!uid || !orders[uid]) return ctx.reply("❗ UID পাওয়া যায়নি।");
  const user = orders[uid].from;
  orders[uid].status = "confirmed";
  bot.telegram.sendMessage(user.id, `✅ আপনার UID ${uid} এর অর্ডার সফলভাবে কনফার্ম করা হয়েছে!`);
  ctx.reply(`☑️ UID ${uid} কনফার্ম করা হয়েছে।`);
});

bot.command("reject", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("⛔ আপনি অ্যাডমিন নন!");
  const uid = ctx.message.text.split(" ")[1];
  if (!uid || !orders[uid]) return ctx.reply("❗ UID পাওয়া যায়নি।");
  const user = orders[uid].from;
  orders[uid].status = "rejected";
  bot.telegram.sendMessage(user.id, `❌ দুঃখিত, আপনার UID ${uid} এর অর্ডার বাতিল করা হয়েছে।`);
  ctx.reply(`🚫 UID ${uid} রিজেক্ট করা হয়েছে।`);
});

bot.command("users", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("⛔ আপনি অ্যাডমিন নন!");
  ctx.reply(`📊 মোট ইউজার: ${Object.keys(users).length}`);
});

bot.command("broadcast", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("⛔ আপনি অ্যাডমিন নন!");
  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast আপনার_বার্তা");
  Object.keys(users).forEach((id) => {
    bot.telegram.sendMessage(id, `📢 Admin:\n${msg}`);
  });
});

app.get("/", (req, res) => {
  res.send("FF Diamond Bot is running!");
});
app.listen(PORT, () => {
  console.log(`🌐 Server is running on port ${PORT}`);
});

bot.launch();
