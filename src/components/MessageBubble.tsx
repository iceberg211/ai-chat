import { Avatar, Card, Typography, theme } from "antd";
import { RobotFilled, UserOutlined } from "@ant-design/icons";

export default function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  const { token } = theme.useToken();

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      <Avatar
        style={{
          background: isUser ? token.colorPrimary : token.colorSuccess,
          flex: "0 0 auto",
        }}
        icon={isUser ? <UserOutlined /> : <RobotFilled />}
      />
      <Card
        size="small"
        style={{
          maxWidth: 720,
          background: isUser
            ? token.colorFillSecondary
            : token.colorFillQuaternary,
        }}
        bodyStyle={{ padding: "8px 12px" }}
      >
        <Typography.Text style={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography.Text>
      </Card>
    </div>
  );
}
