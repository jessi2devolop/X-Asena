const fs = require('fs');
const yt = require('yt-search');
const ytdl = require('ytdl-core');
const { command } = require('../../lib');

const fileTooLarge = 200 * 1024 * 1024; // 200 MB

const downloadAndSend = async (msg, res, fileType, quality) => {
  let file = `./${res}.${fileType}`;
  await msg.reply({ edit: { text: `*Downloading ${fileType.toUpperCase()}...*` } });

  try {
    let videoDetails = await ytdl.getInfo(res);
    let fileSize = videoDetails.formats[0].contentLength || 0;

    if (fileSize > fileTooLarge) {
      return await msg.reply({ text: `*File size is too large. Cannot send files larger than 200 MB.*` });
    }

    let stream = ytdl(res, {
      filter: fileType === 'mp3' ? 'audioonly' : 'videoandaudio',
      quality: quality
    });

    stream.pipe(fs.createWriteStream(file));
    stream.on('end', async () => {
      await msg.reply({ delete: true });
      fileType === 'mp3' ? await msg.reply({ audio: fs.readFileSync(file) }) : await msg.reply({ video: fs.readFileSync(file) });
    });
  } catch (error) {
    return await msg.reply({ text: `*Unable to download the ${fileType}!*` });
  }
};

// Song Command
command(
  {
    pattern: 'song',
    desc: 'Downloads song from given lyric.',
    isFileTooLarge: true,
    replySetting: 1, // 1: reply audio
    replyMenu: 'Song',
  },
  async (message, match, { text }) => {
    if (!text) return await message.reply({ text: '*Please enter a song lyric!*' });

    text += text.includes('http') ? '' : ' song';
    let mesaj = await message.reply({ text: '*Searching for song...*' });

    let res = '';
    try {
      res = ((await yt(text)).all[0].url).split('/').slice(-1)[0].replace('watch?v=', '');
    } catch {
      return await message.reply({ edit: { key: mesaj.key, text: '*Unable to find any song in this lyric!*' } });
    }

    await downloadAndSend(message, res, 'mp3', 'highestaudio');
  }
);

// Video Command
command(
  {
    pattern: 'video',
    desc: 'Downloads video from given title or URL.',
    isFileTooLarge: true,
    replySetting: 2, // 2: reply video
    replyMenu: 'Video',
  },
  async (message, match, { text }) => {
    if (!text) return await message.reply({ text: '*Please enter a video title or URL!*' });
    let mesaj = await message.reply({ text: '*Searching for video...*' });

    let res = '';
    try {
      res = ((await yt(text)).all[0].url).split('/').slice(-1)[0].replace('watch?v=', '');
    } catch {
      return await message.reply({ edit: { key: mesaj.key, text: '*Unable to find any video with this title!*' } });
    }

    await downloadAndSend(message, res, 'mp4', 'highest');
  }
);

// Search Command
command(
  {
    pattern: 'search',
    desc: 'Searches and downloads content from given keywords.',
    isFileTooLarge: true,
    replySetting: 2, // 2: reply video
    replyMenu: 'Search Result',
  },
  async (message, match, { text }) => {
    if (!text) return await message.reply({ text: '*Please enter search keywords!*' });
    let mesaj = await message.reply({ text: '*Searching for content...*' });

    let res = '';
    try {
      res = ((await yt(text)).all[0].url).split('/').slice(-1)[0].replace('watch?v=', '');
    } catch {
      return await message.reply({ edit: { key: mesaj.key, text: '*Unable to find any content with these keywords!*' } });
    }

    await downloadAndSend(message, res, 'mp4', 'highest');
  }
);
