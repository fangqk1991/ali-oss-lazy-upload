#!/usr/bin/env node

const { AliyunOSS } = require('@agora-lab/ali-oss')

const assert = require('assert')
const path = require('path')
const fs = require('fs')

const [,, configJsFile, localPath, remotePath, forceUpload] = process.argv

assert.ok(configJsFile && localPath && remotePath, `Please use command: ali-oss-lazy-upload CONFIG-JS-FILE LOCAL-FILE REMOTE-PATH [FORCE-UPLOAD]`)
assert.ok(fs.existsSync(path.resolve('', configJsFile)), `Config file does not exist.`)
assert.ok(fs.existsSync(localPath), `The file of local path does not exist.`)

const config = require(path.resolve('', configJsFile))
const uploader = new AliyunOSS(config.uploader)
const visitor = new AliyunOSS(config.visitor)

const syncFile = async (localFile, remotePath) => {
  console.info(`Sync ${localFile} => ${remotePath}`)
  if (!fs.existsSync(localFile)) {
    console.error(`Local file [${localFile}] does not exist.`)
    return
  }
  if (fs.statSync(localFile).isDirectory()) {
    const files = fs.readdirSync(localFile)
    for(const fileName of files) {
      await syncFile(`${localFile}/${fileName}`, `${remotePath}/${fileName}`)
    }
  } else {
    if (await visitor.checkExists(remotePath)) {
      console.info(`Remote file[${remotePath} exists`)
      if (!forceUpload) {
        console.info(`Skip the local file [${localPath}]`)
        return
      }
    }
    await uploader.uploadFile(localFile, remotePath)
  }
}

const main = async () => {
  await syncFile(localPath, remotePath)
  process.exit()
}

main()
