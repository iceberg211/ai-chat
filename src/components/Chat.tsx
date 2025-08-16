import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, Button, Card, Empty, Flex, Input, Space, Spin, Typography, theme } from 'antd'
import { SendOutlined, RobotFilled, UserOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { chatWithAI, type ChatMessage } from '../services/ai'
import MessageBubble from './MessageBubble'

const { TextArea } = Input

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('messages')
    return saved ? JSON.parse(saved) as ChatMessage[] : []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { token } = theme.useToken()

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, loading])

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  const onSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const reply = await chatWithAI([...messages, userMsg], { signal: controller.signal })
      const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: reply }
      setMessages(prev => [...prev, aiMsg])
    } catch (e: any) {
      const msg = e?.name === 'AbortError' ? '已取消本次回复。' : `出错了：${e?.message || e}`
      const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: msg }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  const clearAll = () => {
    setMessages([])
  }

  const cancelReply = () => {
    abortRef.current?.abort()
  }

  return (
    <Card
      title={
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={8}>
            <Avatar style={{ background: token.colorPrimary }} icon={<RobotFilled />} />
            <Typography.Text strong>AI 助手</Typography.Text>
          </Flex>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={clearAll}>清空</Button>
          </Space>
        </Flex>
      }
    >
      <div ref={listRef} className="chat-list">
        {messages.length === 0 ? (
          <Empty description="开始对话吧" />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {messages.filter(m => m.role !== 'system').map(m => (
              <MessageBubble key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
              ))}
          </Space>
        )}
        {loading && (
          <Flex align="center" gap={8} style={{ marginTop: 8 }}>
            <Spin />
            <Typography.Text type="secondary">AI 正在思考…</Typography.Text>
            <Button type="link" size="small" icon={<StopOutlined />} onClick={cancelReply}>取消</Button>
          </Flex>
        )}
      </div>

      <div className="composer">
        <TextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
        />
        <Button type="primary" icon={<SendOutlined />} onClick={onSend} disabled={!canSend}>
          发送
        </Button>
      </div>
    </Card>
  )
}
