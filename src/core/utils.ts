interface ExtendScriptError extends Error {
  source: string;
  line: number;
}

export function errorToPretty(err: ExtendScriptError) {
  const stack = $.stack.split('\n')
  stack.shift()
  const lines = (err.source && err.source.split('\n')) || []
  err.line--;
  return {
    name: err.name,
    message: err.message,
    line: err.line,
    context: [
      lines[err.line - 2] || '',
      lines[err.line - 1] || '',
      lines[err.line] || '',
      lines[err.line + 1] || '',
      lines[err.line + 2] || ''
    ],
    stack: stack
  }
}