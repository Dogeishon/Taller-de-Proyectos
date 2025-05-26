let users = [];

const getAllUsers = () => Promise.resolve(users);

const addUser = (user) => {
  users.push(user);
  return Promise.resolve(user);
};

module.exports = { getAllUsers, addUser };
