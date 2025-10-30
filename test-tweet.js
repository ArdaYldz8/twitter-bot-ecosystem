require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// Twitter client oluştur
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Read-write client
const rwClient = client.readWrite;

async function testTweet() {
  try {
    console.log('🤖 Test tweet gönderiliyor...');

    const tweet = await rwClient.v2.tweet({
      text: '🤖 Bot test! Twitter bot ecosystem aktif! 🚀\n\n#TechJobs #Automation'
    });

    console.log('✅ Tweet başarıyla gönderildi!');
    console.log('Tweet ID:', tweet.data.id);
    console.log('Tweet URL:', `https://twitter.com/user/status/${tweet.data.id}`);

  } catch (error) {
    console.error('❌ Hata:', error);
    if (error.data) {
      console.error('Detay:', JSON.stringify(error.data, null, 2));
    }
  }
}

// Test çalıştır
testTweet();
