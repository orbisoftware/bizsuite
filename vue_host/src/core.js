export const coreAPI = {
  log: (msg) => console.log("Core log:", msg),
  getUser: () => ({ id: 1, name: "User" })
};