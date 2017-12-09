interface ExtendScriptError extends Error {
  source: string;
  line: number;
}

export function errorToPretty(err: ExtendScriptError): any {
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

export function cleanBounds(bounds: Bounds): Bounds {
  return [bounds[0], bounds[1], bounds[2], bounds[3]]
}

export function postJson(host: string, uri: string, body: any) {
  const bodyStr = JSON.stringify(body)
  const socket = new Socket();
  if (socket.open(host)) {
    socket.writeln(`POST ${uri} HTTP/1.0
Host: ${host}
Content-Type: application/json
Content-Length: ${bodyStr.length}

${bodyStr}`
    );
    let buffer
    let i = 0
    const response = {
      status: 0,
      body: ''
    }
    while (buffer = socket.readln()) {
      if (i === 0) {
        response.status = Number(buffer.split(' ')[1])
      }
      if (buffer[0] && buffer[0] === '\n') {
        let responseBody = buffer
        let bufferTillEnd
        while (bufferTillEnd = socket.readln()) {
          responseBody += bufferTillEnd
        }
        try {
          response.body = JSON.parse(responseBody)
        } catch (err) {
          throw new Error(`Could not parse response as JSON, response was: ${responseBody.substr(1)}`)
        }
        break;
      }
      i++
    }
    socket.close()
    return response
  } else {
    throw new Error(`Could not connect to host ${host}`)
  }
}

export function catchErrors(cb: () => void) {
  try {
    cb()
  } catch (err) {
    $.writeln(JSON.stringify(errorToPretty(err), undefined, 2))
    const prettyError = errorToPretty(err)
    prettyError.type = '__ERROR__'
    logToPackager(prettyError)
  }
}

export function logToPackager(message: any) {
  return postJson(`localhost:${process.env.LOG_SERVER_PORT}`, '/log', message)
}