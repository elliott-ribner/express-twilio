module.exports = {
  validResponseType(actual, expected) { //actual is input body from user, expected is the type (string, number etc)
    switch(expected) {
      case 'String':
        return true
        break;
      case 'Number':
        var reg = /^\d+$/;
        return reg.test(actual);
        break;
    }
  }
}