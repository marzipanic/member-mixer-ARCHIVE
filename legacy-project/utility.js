// Prototype to convert to/from JS Date to HTML5 Datetime-Local
// https://gist.github.com/WebReflection/6076a40777b65c397b2b9b97247520f0
Date.prototype.toDatetimeLocal =
  function toDatetimeLocal() {
    let
      date = this,
      ten = function (i) {
        return (i < 10 ? '0' : '') + i;
      },
      YYYY = date.getFullYear(),
      MM = ten(date.getMonth() + 1),
      DD = ten(date.getDate()),
      HH = ten(date.getHours()),
      II = ten(date.getMinutes()),
      SS = ten(date.getSeconds())
    ;
    return YYYY + '-' + MM + '-' + DD + 'T' +
             HH + ':' + II + ':' + SS;
  };

Date.prototype.fromDatetimeLocal = (function (BST) {
  // BST should not be present as UTC time
  return new Date(BST).toISOString().slice(0, 16) === BST ?
    // if it is, it needs to be removed
    function () {
      return new Date(
        this.getTime() +
        (this.getTimezoneOffset() * 60000)
      ).toISOString();
    } :
    // otherwise can just be equivalent of toISOString
    Date.prototype.toISOString;
}('2006-06-06T06:06'));
