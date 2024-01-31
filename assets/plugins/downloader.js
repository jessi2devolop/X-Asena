// plugins/songVideoDownloader.js

const fs = require('fs');
const yt = require('yt-search');
const ytdl = require('ytdl-core');
const { command, isReply, isPrivate } = require('../../lib');

command(
  {
    pattern: 'download',
    fromMe: isPrivate,
    desc: 'Downloads song or video.',
  },
  async (message, match) => {
    if (!isReply(message)) {
      return await message.reply({ text: '*Reply to a message with a YouTube URL or provide a search query.*' });
    }

    const replyMessage = await message.loadReply(message.id);
    const replyText = replyMessage.text;

    let videoUrl = '';
    let fileType = '';

    if (replyText.includes('youtu.be') || replyText.includes('youtube.com')) {
      videoUrl = replyText.split(' ')[0].trim();
      fileType = 'mp4'; // Assume it's a video
    } else {
      const searchResult = await yt(replyText);
      if (!searchResult || !searchResult.all || searchResult.all.length === 0) {
        return await message.reply({ text: '*Unable to find any song or video.*' });
      }

      videoUrl = searchResult.all[0].url;
      fileType = 'mp3'; // Assume it's a song
    }

    const fileName = `./downloaded.${fileType}`;

    try {
      const videoInfo = await ytdl.getInfo(videoUrl);
      const audio = ytdl(videoInfo.videoDetails.video_url, { filter: 'audioonly' });

      audio.pipe(fs.createWriteStream(fileName));
      audio.on('end', async () => {
        await message.reply({ delete: { key: message.key } });
        if (fileType === 'mp3') {
          await message.reply({ audio: fs.readFileSync(fileName) });
        } else {
          await message.reply({ video: fs.readFileSync(fileName) });
        }
      });
    } catch (error) {
      return await message.reply({ text: '*Error downloading the song or video.*' });
    }
  }
);
