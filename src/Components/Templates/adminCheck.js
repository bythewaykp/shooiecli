module.exports = (id, chat) => {
  for (let k of chat.participants) {
    if (id == k.id._serialized && k.isAdmin) {
      return true;
    } else if (id == k.id._serialized && !k.isAdmin) {
      return false;
    }
  }
};
