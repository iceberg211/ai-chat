import { useEffect, useMemo, useState } from 'react'
import { ConfigProvider, Layout, Typography, Switch, theme as antdTheme } from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import Chat from './components/Chat'

const { Header, Content, Footer } = Layout

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const algorithm = useMemo(
    () => (isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [isDark]
  )

  return (
    <ConfigProvider theme={{ algorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>AI Chat</Typography.Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BulbOutlined style={{ color: '#fff' }} />
            <Switch
              checkedChildren="暗"
              unCheckedChildren="亮"
              checked={isDark}
              onChange={setIsDark}
            />
          </div>
        </Header>
        <Content style={{ padding: '16px' }}>
          <div className="container">
            <Chat />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            示例用途。可切换 Mock 或外部 API。
          </Typography.Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  )
}

