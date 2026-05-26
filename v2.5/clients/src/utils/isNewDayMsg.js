export function isNewDayMsg(currentMsg, prevMsg) {
  if (!prevMsg) return true;

  return (
    new Date(currentMsg.createdAt).toDateString() !==
    new Date(prevMsg.createdAt).toDateString()
  );
}
