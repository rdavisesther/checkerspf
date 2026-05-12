const dns = require("dns").promises;

const DOMAINS = ["411line.com", "prenolvak.com"];

async function sendTelegram(text) {
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.CHAT_ID, text })
  });
}

module.exports = async (req, res) => {
  for (const domain of DOMAINS) {
    try {
      const records = await dns.resolveTxt(domain);
      const txts = records.map(r => r.join(""));
      const hasSpf = txts.some(t => t.startsWith("v=spf1"));

      if (!hasSpf) {
        await sendTelegram(`⚠️ SPF MISSING\nDomain: ${domain}`);
      }
    } catch (e) {
      await sendTelegram(`❌ SPF ERROR\nDomain: ${domain}\n${e.message}`);
    }
  }

  res.status(200).json({ ok: true });
};
