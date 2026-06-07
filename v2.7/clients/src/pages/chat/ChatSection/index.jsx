// import NoMessage from "../../components/NoMessage";
// import ChatHeader from "./components/ChatHeader";
// import GroupHeader from "./components/GroupHeader";
// import MessageList from "./components/MessageList";
import MessageInput from "../MessageInput/MessageInput";

import NoMessage from "../../../components/NoMessage";
import GroupHeader from "./components/groupHeader";
import MessageList from "./components/MessageList";
import ChatHeader from "./components/ChatHeader";

export default function index({
  selected,
  isGroupSelected,
  user,
  messages,
  loadingMsgs,
  firstUnreadIndex,
  text,
  sending,
  onTextChange,
  onSend,
  onMessageDeleted,
  onFileSent,
  onGroupUpdated,
  isOnline,
}) {
  if (!selected) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <NoMessage />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {isGroupSelected ? (
        <GroupHeader
          group={selected}
          currentUserId={user.id}
          onGroupUpdated={onGroupUpdated}
        />
      ) : (
        <ChatHeader contact={selected} isOnline={isOnline(selected.id)} />
      )}

      <MessageList
        messages={messages}
        currentUserId={user.id}
        loadingMsgs={loadingMsgs}
        firstUnreadIndex={firstUnreadIndex}
        onMessageDeleted={onMessageDeleted}
        isGroup={isGroupSelected}
        groupMembers={isGroupSelected ? selected.members : null}
      />

      <MessageInput
        value={text}
        onChange={onTextChange}
        onSend={onSend}
        sending={sending}
        placeholder={
          isGroupSelected
            ? `Message ${selected.name}...`
            : `Message ${selected.username}...`
        }
        selectedId={selected.id}
        isGroup={isGroupSelected}
        onFileSent={onFileSent}
      />
    </div>
  );
}
