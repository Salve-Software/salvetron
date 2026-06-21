import WebSocket from 'ws'

const PORT = Number(process.env.SALVETRON_PORT ?? 8765)
const ws = new WebSocket(`ws://localhost:${PORT}`)

ws.on('open', () => {
  const send = (e) => ws.send(JSON.stringify(e))

  send({ type: 'device_info', deviceName: 'iPhone 15 Sim', platform: 'ios' })

  for (let i = 0; i < 12; i++) {
    send({
      type: 'log',
      timestamp: Date.now(),
      level: ['info', 'warn', 'error', 'debug', 'log'][i % 5],
      source: 'js',
      message: `JS log message number ${i} - something happened in the app that produced a fairly long message to test truncation`,
      metadata: { index: i, nested: { a: 1, b: 'test' } },
    })
  }

  for (let i = 0; i < 8; i++) {
    const requestId = `req-${i}`
    send({
      type: 'network',
      stage: 'request',
      timestamp: Date.now(),
      requestId,
      method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
      url: `https://api.example.com/v1/resource/${i}?foo=bar&long=query-param-to-test-truncation`,
      headers: { 'Content-Type': 'application/json' },
      body: i % 2 === 0 ? JSON.stringify({ hello: 'world' }) : undefined,
    })
    send({
      type: 'network',
      stage: 'response',
      timestamp: Date.now(),
      requestId,
      method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
      url: `https://api.example.com/v1/resource/${i}`,
      statusCode: [200, 201, 404, 500][i % 4],
      duration: 50 + i * 10,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: 'ok', index: i, items: [1, 2, 3] }),
    })
  }

  for (let i = 0; i < 10; i++) {
    send({
      type: 'native',
      timestamp: Date.now(),
      level: ['info', 'warn', 'error'][i % 3],
      source: i % 2 === 0 ? 'ios' : 'android',
      tag: 'AppLifecycle',
      message: `Native event ${i} fired with some descriptive text to check wrapping behavior in the panel`,
      metadata: { i },
    })
  }

  let tick = 0
  const perfInterval = setInterval(() => {
    tick++
    send({
      type: 'performance_metrics',
      timestamp: Date.now(),
      uiFps: 55 + Math.round(Math.sin(tick) * 4),
      jsFps: 50 + Math.round(Math.cos(tick) * 5),
      memoryUsage: 180 + tick * 3,
      cpuUsage: 20 + (tick % 30),
    })
    if (tick > 30) clearInterval(perfInterval)
  }, 200)
})

ws.on('error', (e) => console.error('ws error', e))
