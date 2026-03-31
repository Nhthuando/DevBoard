function collectFlattenErrors(errorPayload) {
  const issues = []
  const formErrors = errorPayload?.error?.formErrors || []
  const fieldErrors = errorPayload?.error?.fieldErrors || {}

  formErrors.forEach((item) => {
    if (item) issues.push(String(item))
  })

  Object.values(fieldErrors).forEach((messages) => {
    if (!Array.isArray(messages)) return

    messages.forEach((message) => {
      if (message) issues.push(String(message))
    })
  })

  return issues
}

export function getApiErrorMessage(error, fallback = 'Co loi xay ra. Vui long thu lai.') {
  if (!error) return fallback

  const flatErrors = collectFlattenErrors(error.payload)
  if (flatErrors.length > 0) {
    return flatErrors[0]
  }

  if (error.payload?.message) {
    return String(error.payload.message)
  }

  if (error.message) {
    return String(error.message)
  }

  return fallback
}
