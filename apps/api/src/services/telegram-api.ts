type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};

export type TelegramBotIdentity = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
};

export type TelegramBotDescription = {
  description: string;
};

async function callTelegram<T>(token: string, method: string): Promise<TelegramApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    const payload = (await response.json()) as TelegramApiResponse<T>;
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyTelegramBot(token: string) {
  const identity = await callTelegram<TelegramBotIdentity>(token, 'getMe');

  if (!identity.ok || !identity.result?.is_bot) {
    return {
      ok: false as const,
      errorCode: identity.error_code,
      message: identity.description ?? 'Telegram rejected this bot token.',
    };
  }

  let description: string | undefined;
  try {
    const result = await callTelegram<TelegramBotDescription>(token, 'getMyDescription');
    if (result.ok) description = result.result?.description || undefined;
  } catch {
    // Description is optional. A valid getMe response is sufficient for connection.
  }

  return {
    ok: true as const,
    bot: identity.result,
    description,
  };
}
