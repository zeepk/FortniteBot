const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const sweatLevels = {
  low: {
    thresh: 2,
    text: "Low",
    thumbnail:
      "https://i.pinimg.com/236x/4c/be/86/4cbe867907ee16d6336dfbcec53e775b.jpg",
    color: "#00ff00",
  },
  med: {
    thresh: 4,
    text: "Medium",
    thumbnail: "https://cdn.mos.cms.futurecdn.net/HQrCUdgm2ADs5UrKzLr5gH.png",
    color: "#ffff00",
  },
  high: {
    text: "HIGH",
    thumbnail:
      "https://attackofthefanboy.com/wp-content/uploads/2023/04/Aura-Fortnite.jpg",
    color: "#ff0000",
  },
};

const calculateSweatMeter = (stats) => {
  let sweatMeter = 0;

  // K/D ratio
  if (stats.kd > 2) {
    sweatMeter++;
  }
  if (stats.kd > 4) {
    sweatMeter++;
  }
  if (stats.kd > 6) {
    sweatMeter++;
  }

  // Win rate
  if (stats.winRate > 15) {
    sweatMeter++;
  }
  if (stats.winRate > 20) {
    sweatMeter++;
  }

  // Hours played
  if (stats.minutesPlayed > 300 * 60) {
    sweatMeter++;
  }
  if (stats.minutesPlayed > 500 * 60) {
    sweatMeter++;
  }
  if (stats.minutesPlayed > 1000 * 60) {
    sweatMeter++;
  }

  if (sweatMeter <= sweatLevels.low.thresh) {
    return sweatLevels.low;
  }
  if (sweatMeter <= sweatLevels.med.thresh) {
    return sweatLevels.med;
  }
  return sweatLevels.high;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sweat")
    .setDescription("Check if someone is sweaty")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Username to search for")
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    if (!username) {
      await interaction.reply("Please provide a username");
      return;
    }

    const response = await fetch(
      `https://fortnite-api.com/v2/stats/br/v2?name=${username}`,
      {
        headers: {
          Authorization: process.env.FORTNITE_API_KEY ?? "",
        },
      }
    );

    if (response.status !== 200) {
      await interaction.reply("Error: could not find " + username);
      return;
    }
    const data = await response.json();
    const stats = data.data.stats.all.overall;

    const sweat = calculateSweatMeter(stats);

    const exampleEmbed = new EmbedBuilder()
      .setColor(sweat.color)
      .setTitle(
        data.data.account.name + ` - level ${data.data.battlePass.level}`
      )
      .setThumbnail(sweat.thumbnail)
      .addFields({ name: "Sweat Level", value: sweat.text })
      .addFields(
        {
          name: "K/D Ratio",
          value: String(stats.kd),
          inline: true,
        },
        {
          name: "Win Rate",
          value: `${Math.floor(stats.winRate)}%`,
          inline: true,
        },
        {
          name: "Hours Played",
          value: `${Math.floor(stats.minutesPlayed / 60)}`,
          inline: true,
        }
      );

    await interaction.reply({ embeds: [exampleEmbed] });
  },
};
