import { Avatar, Badge } from "antd";

const UserAvatar = ({
  image,
  name = "NA",
  isOnline = false,
  showOnlineStatus = false,

  size = "default",

  avatarStyle = {},

  ringStyle = {},

  wrapperStyle = {},
}) => {
  const displayName =
    typeof name === "string" && name.trim() ? name.trim() : "NA";

  const initials = displayName
    .split(/[\s_]/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatar = (
    <div style={wrapperStyle}>
      <Avatar
        src={image || undefined}
        size={size}
        style={{
          background: "var(--primary-color)",
          verticalAlign: "middle",
          ...avatarStyle,
        }}
      >
        {!image && initials}
      </Avatar>
    </div>
  );

  const avatarWithRing =
    Object.keys(ringStyle).length > 0 ? (
      <div style={ringStyle}>{avatar}</div>
    ) : (
      avatar
    );

  if (!showOnlineStatus) {
    return avatarWithRing;
  }

  return (
    <Badge dot color={isOnline ? "#52c41a" : "#555"} offset={[-2, 30]}>
      {avatarWithRing}
    </Badge>
  );
};

export default UserAvatar;
