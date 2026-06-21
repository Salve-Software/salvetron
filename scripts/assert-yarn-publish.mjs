#!/usr/bin/env node
const userAgent = process.env.npm_config_user_agent ?? ''

if (!userAgent.startsWith('yarn/')) {
  console.error(
    'Refusing to publish: use "yarn npm publish", not "npm publish".\n' +
      'npm does not rewrite the "workspace:^" protocol in dependencies, ' +
      'which breaks installs for consumers (see workspace:^ left unresolved in published package.json).',
  )
  process.exit(1)
}
