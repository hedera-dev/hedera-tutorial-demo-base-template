#!/bin/bash

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# get specific tag name for latest RPC relay
export RPC_RELAY_VERSION=$( curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/hashgraph/hedera-json-rpc-relay/releases?per_page=1" |
  jq -r ".[].tag_name" |
  cut -c1-
)
echo "🟣 RPC Relay version: ${RPC_RELAY_VERSION}"

cd ..

git clone \
  --depth 1 \
  --branch "${RPC_RELAY_VERSION}" \
  "https://github.com/hashgraph/hedera-json-rpc-relay.git" \
  "./rpcrelay"

cd ./rpcrelay

# install dependencies, including sub-projects
echo "🟣 Set up hedera-json-rpc-relay..."
npm install
npm run build

# run the relay
echo "🟣 Run hedera-json-rpc-relay..."
npm run start
