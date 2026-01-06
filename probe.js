const electron = require('electron')
console.log('Electron:', electron)
console.log('App:', electron.app)
if (electron.app) {
  console.log('isPackaged:', electron.app.isPackaged)
  electron.app.quit()
}
