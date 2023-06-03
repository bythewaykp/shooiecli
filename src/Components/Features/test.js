module.exports = async (client, msg, t, Vars) => {
  let a = await Vars.find();
  console.log(a);
};
