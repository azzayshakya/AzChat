import { Avatar, Badge } from "antd";

const UserAvatar = ({
  image,
  name = "NA",
  isOnline = false,
  showOnlineStatus = false,
  size = "default",
  avatarStyle = {},
}) => {
  const displayName =
    typeof name === "string" && name.trim() ? name.trim() : "NA";

  const initials = displayName.trim().slice(0, 2).toUpperCase();

  const avatar = (
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
  );

  if (!showOnlineStatus) {
    return avatar;
  }

  return (
    <Badge dot color={isOnline ? "#52c41a" : "#555"} offset={[-2, 30]}>
      {avatar}
    </Badge>
  );
};

export default UserAvatar;
