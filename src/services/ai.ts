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
  // 优先走 GraphQL（Cloudflare Workers），否则回退到原有 REST，再不行使用 Mock。
  const gqlEndpoint = import.meta.env.VITE_GRAPHQL_API_URL as string | undefined
  if (gqlEndpoint) {
    const provider = (import.meta.env.VITE_CHAT_PROVIDER as string | undefined) ?? 'DEEPSEEK'
    const model = (import.meta.env.VITE_CHAT_MODEL as string | undefined) ?? 'deepseek-chat'
    const temperatureRaw = import.meta.env.VITE_CHAT_TEMPERATURE as string | undefined
    const temperature = temperatureRaw ? Number(temperatureRaw) : undefined

    const query = `mutation Chat($input: ChatInput!) {
      chat(input: $input) {
        content
        reasoning
      }
    }`

    const variables = {
      input: {
        provider,
        model,
        ...(typeof temperature === 'number' && !Number.isNaN(temperature) ? { temperature } : {}),
        messages: messages
          .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
          .map(m => ({ role: m.role, content: m.content })),
      },
    }

    const res = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: options?.signal,
    })
    if (!res.ok) throw new Error(`GraphQL 请求失败：${res.status}`)
    const data = await res.json()
    if (data?.errors?.length) {
      const msg = data.errors.map((e: any) => e?.message).filter(Boolean).join('; ')
      throw new Error(`GraphQL 错误：${msg || '未知错误'}`)
    }
    const reply: string | undefined = data?.data?.chat?.content
    if (typeof reply !== 'string') throw new Error('GraphQL 返回格式不正确，应在 data.chat.content 提供 string')
    return reply
  }

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
