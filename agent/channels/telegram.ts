import { ForbiddenError } from "eve/channels/auth";
import { telegramChannel } from "eve/channels/telegram";

function getAllowedTelegramUserIds(): Set<string> {
  const raw = process.env.TELEGRAM_ALLOWED_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

export default telegramChannel({
  botUsername: process.env.TELEGRAM_BOT_USERNAME,
  onMessage: (_ctx, message) => {
    const allowed = getAllowedTelegramUserIds();
    const userId = String(message.from?.id ?? "");

    if (allowed.size > 0 && !allowed.has(userId)) {
      throw new ForbiddenError({
        message: "Você não tem permissão para usar este bot.",
      });
    }

    return {
      auth: {
        principalId: userId,
        principalType: "user",
        authenticator: "telegram",
        attributes: {
          telegramUserId: userId,
          telegramUsername: message.from?.username ?? "",
          chatId: String(message.chat.id),
        },
      },
      title: message.from?.first_name
        ? `Telegram · ${message.from.first_name}`
        : "Telegram",
    };
  },
});
