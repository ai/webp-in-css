global.document = {
  body: {
    classList: {
      add(cls) {
        global.document.body.className += cls
      },
      remove(cls) {
        global.document.body.className += global.document.body.className
          .split(' ')
          .filter(i => i !== cls)
          .join(' ')
      }
    },
    className: ''
  }
}
