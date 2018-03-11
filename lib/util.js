module.exports.sleep = function sleep(time) {
  const stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    // eslint-disable-next-line no-extra-semi
    ;
  }
};
