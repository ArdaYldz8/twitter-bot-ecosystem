const cron = require('node-cron');
const { postRandomJob } = require('./tech-jobs-bot');

console.log('🤖 Tech Jobs Bot Scheduler başlatıldı!');
console.log('⏰ Her 2 saatte bir job tweet atacak...\n');

// İlk tweet hemen at
console.log('📢 İlk tweet atılıyor...');
postRandomJob();

// Her 2 saatte bir çalış (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
// Cron pattern: dakika saat * * *
// '0 */2 * * *' = Her 2 saatin başında
cron.schedule('0 */2 * * *', () => {
  const now = new Date().toLocaleString('tr-TR');
  console.log(`\n⏰ [${now}] Zamanlanmış tweet zamanı!`);
  postRandomJob();
});

console.log('✅ Scheduler aktif!');
console.log('💡 Durdurmak için Ctrl+C');
console.log('\n📅 Sonraki tweet saatleri:');
console.log('   00:00, 02:00, 04:00, 06:00, 08:00, 10:00');
console.log('   12:00, 14:00, 16:00, 18:00, 20:00, 22:00\n');
