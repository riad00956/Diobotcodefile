
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMINS = process.env.ADMINS.split(",");
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const loggedInAdmins = new Set();
const userUIDs = {};
const orders = {};

function isAdmin(id) {
  return ADMINS.includes(id.toString()) && loggedInAdmins.has(id.toString());
}

bot.start((ctx) => {
  const name = ctx.from.first_name || "ব্যবহারকারী";
  ctx.reply(
    `👋 হ্যালো ${name}!

স্বাগতম *FX TOP UP BOT*-এ!

🔐 প্রথমে আপনার UID লগইন করুন:
/login <your UID>

💡 আপনি ডায়মন্ড অফার দেখতে ও অর্ডার করতে পারবেন সহজেই।`,
    { parse_mode: "Markdown" }
  );
});

bot.command("login", (ctx) => {
  const parts = ctx.message.text.split(" ");
  const isAdminCmd = ADMINS.includes(ctx.from.id.toString());

  if (isAdminCmd) {
    if (parts[1] === ADMIN_PASSWORD) {
      loggedInAdmins.add(ctx.from.id.toString());
      return ctx.reply("✅ অ্যাডমিন লগইন সফল!");
    }
    return ctx.reply("❌ ভুল পাসওয়ার্ড!");
  }

  const uid = parts[1];
  if (!uid || isNaN(uid)) {
    return ctx.reply("❌ সঠিক UID দিন।
Usage: /login <UID>");
  }

  userUIDs[ctx.from.id] = uid;
  ctx.reply(`✅ আপনার UID ${uid} সংরক্ষণ করা হয়েছে।`);
});

bot.command("logout", (ctx) => {
  if (isAdmin(ctx.from.id)) {
    loggedInAdmins.delete(ctx.from.id.toString());
    return ctx.reply("🚪 অ্যাডমিন লগআউট সম্পন্ন হয়েছে।");
  }

  delete userUIDs[ctx.from.id];
  ctx.reply("🚪 UID মুছে ফেলা হয়েছে।");
});

bot.command("confirm", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ অনুমতি নেই!");
  const uid = ctx.message.text.split(" ")[1];
  ctx.reply(`☑️ UID ${uid} কনফার্ম করা হয়েছে।`);
  bot.telegram.sendMessage(uid, "✅ আপনার অর্ডার সফলভাবে কনফার্ম করা হয়েছে!");
});

bot.command("reject", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ অনুমতি নেই!");
  const uid = ctx.message.text.split(" ")[1];
  ctx.reply(`❌ UID ${uid} এর অর্ডার বাতিল করা হয়েছে।`);
  bot.telegram.sendMessage(uid, "❌ দুঃখিত, আপনার অর্ডার বাতিল করা হয়েছে।");
});

bot.hears("💎 ডায়মন্ড কিনুন", (ctx) => {
  const uid = userUIDs[ctx.from.id];
  if (!uid) {
    return ctx.reply("⚠️ অনুগ্রহ করে আগে আপনার UID সেট করুন:
/login <UID>");
  }

  ctx.reply(`🛒 আপনার UID: ${uid}

অর্ডার করতে আপনার অফার নম্বর দিন (যেমন: 1, 2, 3...)`);
});

bot.hears("ℹ️ সাহায্য", (ctx) => {
  ctx.reply("❓ সহায়তার জন্য যোগাযোগ করুন: @rifatbro22");
});

bot.hears("📜 রুলস", (ctx) => {
  ctx.reply("📌 শুধুমাত্র ফ্রি ফায়ার UID টপ আপ
📌 শুধুমাত্র বাংলাদেশ সার্ভার
📌 ভুল UID দিলে দায়িত্ব গ্রাহকের
📌 অর্ডার কনফার্মের জন্য অপেক্ষা করুন");
});

bot.hears("⭐ ডায়মন্ড অফার", (ctx) => {
  ctx.reply(`🔥 *ডায়মন্ড অফার:*

1. 25💎 = 28৳
2. 50💎 = 45৳
3. 115💎 = 95৳
4. 240💎 = 185৳
5. 355💎 = 270৳
6. 480💎 = 360৳
7. 610💎 = 490৳
8. 725💎 = 595৳
9. 850💎 = 630৳
10. 1090💎 = 805৳
11. 1240💎 = 900৳
12. 1480💎 = 1120৳
13. 1720💎 = 1270৳
14. 1850💎 = 1350৳
15. 2090💎 = 1500৳
16. 2530💎 = 1690৳
17. 3140💎 = 2400৳
18. 3770💎 = 2700৳
19. 5060💎 = 3670৳
20. 10120💎 = 6900৳
⭐ Weekly = 165৳
⭐ Monthly = 800৳
⭐ Level Up Pass = 170৳
⭐ Evo Access 3d/7d/30d = 80৳/120৳/400৳
⭐ Weekly Lite ×1/×2/×3 = 45৳/90৳/135৳`, { parse_mode: "Markdown" });
});

bot.launch().then(() => console.log('🤖 Bot started with polling...'));
