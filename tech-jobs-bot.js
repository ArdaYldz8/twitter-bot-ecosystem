// Load .env only in development (Railway uses its own env vars)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { TwitterApi } = require('twitter-api-v2');
const https = require('https');

// Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

// RemoteOK API'den job'ları çek
async function fetchRemoteJobs() {
  return new Promise((resolve, reject) => {
    https.get('https://remoteok.com/api', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jobs = JSON.parse(data);
          // İlk eleman metadata, onu atla
          resolve(jobs.slice(1));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Tweet formatla
function formatJobTweet(job) {
  // Emoji seç (position'a göre)
  const emojis = {
    'frontend': '💻',
    'backend': '⚙️',
    'fullstack': '🚀',
    'devops': '🔧',
    'design': '🎨',
    'data': '📊',
    'mobile': '📱',
    'default': '💼'
  };

  const position = job.position.toLowerCase();
  let emoji = emojis.default;

  for (const [key, value] of Object.entries(emojis)) {
    if (position.includes(key)) {
      emoji = value;
      break;
    }
  }

  // Salary varsa ekle
  const salaryText = job.salary_min && job.salary_max
    ? `\n💰 $${Math.floor(job.salary_min/1000)}K-$${Math.floor(job.salary_max/1000)}K/year`
    : '';

  // Tags'i hashtag'e çevir (max 3)
  const tags = job.tags || [];
  const hashtags = tags
    .slice(0, 3)
    .map(tag => `#${tag.replace(/\s+/g, '')}`)
    .join(' ');

  // Tweet oluştur
  const tweet = `${emoji} ${job.position}

🏢 ${job.company}
🌍 Remote${salaryText}

${hashtags}

Apply: https://remoteok.com/remote-jobs/${job.id}

#RemoteJobs #TechJobs #RemoteWork`;

  return tweet;
}

// Random job seç ve tweet at
async function postRandomJob() {
  try {
    console.log('🔍 Remote job\'lar çekiliyor...');
    const jobs = await fetchRemoteJobs();

    if (!jobs || jobs.length === 0) {
      console.log('❌ Job bulunamadı');
      return;
    }

    // Tech job'ları filtrele (dev, engineer, designer, etc.)
    const techKeywords = ['developer', 'engineer', 'programmer', 'designer', 'devops', 'frontend', 'backend', 'fullstack', 'data', 'ml', 'ai'];
    const techJobs = jobs.filter(job => {
      const position = job.position.toLowerCase();
      return techKeywords.some(keyword => position.includes(keyword));
    });

    if (techJobs.length === 0) {
      console.log('❌ Tech job bulunamadı');
      return;
    }

    // Random seç
    const randomJob = techJobs[Math.floor(Math.random() * techJobs.length)];

    console.log(`\n📌 Seçilen job: ${randomJob.position} @ ${randomJob.company}`);

    // Tweet formatla
    const tweetText = formatJobTweet(randomJob);

    console.log('\n📝 Tweet içeriği:');
    console.log('---');
    console.log(tweetText);
    console.log('---\n');

    // Tweet gönder
    console.log('🚀 Tweet gönderiliyor...');
    const tweet = await rwClient.v2.tweet({ text: tweetText });

    console.log('✅ Tweet başarıyla gönderildi!');
    console.log(`📊 Tweet ID: ${tweet.data.id}`);
    console.log(`🔗 URL: https://twitter.com/TechJobsDaily/status/${tweet.data.id}`);

    return tweet;

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.data) {
      console.error('Detay:', JSON.stringify(error.data, null, 2));
    }
  }
}

// Script çalıştır
if (require.main === module) {
  postRandomJob();
}

module.exports = { postRandomJob };
