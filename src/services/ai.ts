export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

type Options = {
  signal?: AbortSignal
}

/**
 * 可插拔 AI 服务：
 * - 若设置 VITE_CHAT_API_URL，则以 { messages } 发送到该地址，期待返回 { reply: string }
 * - 否则使用内置 Mock 生成回复
 *
 * 注意：不要在前端暴露任何私密 API Key。若需调用 OpenAI 等，请部署后端代理。
 */
export async function chatWithAI(messages: ChatMessage[], options?: Options): Promise<string> {
  const endpoint = import.meta.env.VITE_CHAT_API_URL as string | undefined
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: options?.signal,
    })
    if (!res.ok) throw new Error(`API 请求失败：${res.status}`)
    const data = await res.json()
    const reply = data?.reply
    if (typeof reply !== 'string') throw new Error('API 返回格式不正确，应为 { reply: string }')
    return reply
  }

  // Mock 模式：简单地回显 + 小提示
  const last = messages[messages.length - 1]
  await delay(600 + Math.random() * 600)
  return `你说：${last?.content ?? ''}\n\n(这是示例回复，设置 VITE_CHAT_API_URL 可接入真实模型)`
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

