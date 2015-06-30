module.exports = class Loader {

  constructor() {
    this.prefix = this.prefix || 'pipeline/'
    this.responseType = this.responseType || 'arraybuffer'
  }

  load(path, callback) {
    const uri = `${this.prefix}${path}`

    const xhr = new XMLHttpRequest()
    xhr.open('GET', encodeURI(uri), true)

    xhr.onload = function(e) {
      if(this.status == 200) {
        callback(this.response)
      }
    }

    xhr.responseType = this.responseType
    xhr.send()
  }

}
