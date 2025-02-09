const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const safeURL = (url) => {
  try {
    return new URL(url)
  } catch (error) {}
}

export { cloneObject, safeURL }
