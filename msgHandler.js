const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg') //paid
const color = require('./lib/color')
const { liriklagu, quotemaker, wall } = require('./lib/functions')
const { help, info, } = require('./lib/help')
const msgFilter = require('./lib/msgFilter')
const akaneko = require('akaneko');
const { exec } = require('child_process')
const fetch = require('node-fetch');
const bent = require('bent')
const wel = JSON.parse(fs.readFileSync('./lib/welcome.json')) 
const nsfwgrp = JSON.parse(fs.readFileSync('./lib/nsfw.json')) 
const ban = JSON.parse(fs.readFileSync('./lib/banned.json'))
const errorurl = 'https://steamuserimages-a.akamaihd.net/ugc/954087817129084207/5B7E46EE484181A676C02DFCAD48ECB1C74BC423/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'
const errorurl2 = 'https://steamuserimages-a.akamaihd.net/ugc/954087817129084207/5B7E46EE484181A676C02DFCAD48ECB1C74BC423/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, mentionedJidList, author, quotedMsgObj } = message
        let { body } = message
        const { name } = chat
        let { pushname, verifiedName } = sender
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
        const args = body.slice(prefix.length).trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const url = args.length !== 0 ? args[0] : ''
        const isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi))
        }
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) return console.log(color('[SPAM!]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) return console.log(color('[SPAM!]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name))
        if (!isCmd && !isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
        if (!isCmd && isGroupMsg) return console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        if (isCmd && !isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name))
        const botNumber = await client.getHostNumber()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const isBanned = ban.includes(chatId)
        const owner = 'Your-phone-number' // eg 9190xxxxxxxx
        const isowner = owner+'@c.us' == sender.id 

        msgFilter.addFilter(from)

        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isBanned) {
            switch (command) {
            case 'sticker':
            case 'stiker':
                if (isMedia) {
                    const mediaData = await decryptMedia(message)
                    const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    await client.sendImageAsSticker(from, imageBase64)
                } else if (quotedMsg && quotedMsg.type == 'image') {
                    const mediaData = await decryptMedia(quotedMsg)
                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                    await client.sendImageAsSticker(from, imageBase64)
                } else if (args.length >= 1) {
                    const url = args[1]
                    if (url.match(isUrl)) {
                        await client.sendStickerfromUrl(from, url, { method: 'get' })
                            .catch(err => console.log('Caught exception: ', err))
                    } else {
                        client.sendText(from, 'Invalid URL')
                    }
                } else {
                    if(isGroupMsg) {
                        client.sendTextWithMentions(from, `@${message.author} You did not tag a picture`)
                    } else {
                        client.reply(from, 'You did not tag a picture', message)
                    }
                }
            break
            case 'ptl1':
                const items = ["https://i.pinimg.com/originals/42/06/02/420602b7f46d4b3fcd81877fcdd352df.jpg","https://i.pinimg.com/originals/6d/8f/5c/6d8f5c91dfd3bcb6548ab79692a399ed.png","https://i.pinimg.com/originals/cb/e2/b4/cbe2b493aa70a57c38338edd0853837e.jpg","https://i.pinimg.com/originals/e0/cd/c3/e0cdc3a8138e119ff0be0a6e3d02477d.jpg","https://i.pinimg.com/originals/0e/85/ba/0e85ba305df7e26a6f5e094f1028d802.jpg","https://i.pinimg.com/originals/1e/72/e4/1e72e42c4e0847e71ee1160956af2ffd.png","https://i.pinimg.com/originals/fd/52/ff/fd52ff75e986955465c02b080bdd817d.jpg","https://i.pinimg.com/originals/15/a3/12/15a312376f0ae4fecc2e0a5f7628fd75.jpg","https://i.pinimg.com/originals/20/6c/8f/206c8f8de6a752bd29f1f37fed28f406.jpg","https://i.pinimg.com/originals/01/b5/bc/01b5bcceda86d290f0c878875e0013ce.jpg","https://i.pinimg.com/originals/de/1a/52/de1a52f193a291e42ed057aff1748c30.jpg","https://i.pinimg.com/originals/8e/03/68/8e0368299b3dc32999dd5f5a960f9a93.jpg","https://i.pinimg.com/originals/9e/68/73/9e68733c939981285f607c2da2ffb088.jpg","https://i.pinimg.com/originals/19/7e/c7/197ec7fc89cb44b76b1498c060bd3ba5.jpg","https://i.pinimg.com/originals/43/06/4c/43064ca4065caf8ed6769b380b62026f.jpg","https://i.pinimg.com/originals/87/bb/a8/87bba8823ae4bfc402f811004adebb71.jpg","https://i.pinimg.com/originals/c0/f2/84/c0f284e0777b3c583e9b6ff07ce09de8.jpg","https://i.pinimg.com/originals/07/91/7a/07917adee777b8fd62a23e0a0239ad32.jpg","https://i.pinimg.com/originals/6f/fb/44/6ffb44752ce15935e35a8387b8bec89b.jpg","https://i.pinimg.com/originals/1f/9f/16/1f9f16792c057a8bc1cf9bfd456c8cea.jpg","https://i.pinimg.com/originals/58/70/95/587095217224fc7d28188fbf390297e9.jpg","https://i.pinimg.com/originals/a9/20/d1/a920d14ffa2e39f82df05353cf956473.jpg","https://i.pinimg.com/originals/a1/49/ce/a149ce42af12ebc04940fbcb94b77324.png","https://i.pinimg.com/originals/4d/f1/30/4df130726e7408abd14df32dbcde111b.jpg","https://i.pinimg.com/originals/9e/5b/34/9e5b341b72718b7880eadb9b0db0a7c1.png","https://i.pinimg.com/originals/81/dd/fb/81ddfb0b541be18aaddf141c271ebbcc.jpg","https://i.pinimg.com/originals/6d/19/1b/6d191b23a29968e7ecd5666bd6c54769.jpg","https://i.pinimg.com/originals/b0/0c/81/b00c8107262cbcb161feed8e84412841.jpg","https://i.pinimg.com/originals/10/36/f5/1036f5333cd0bdc46e1f35aa438796d5.jpg","https://i.pinimg.com/originals/26/ac/e6/26ace6b1e653969ef108f361c3993846.jpg","https://i.pinimg.com/originals/c9/c3/df/c9c3df3ca63b0e2c11c91f7a1e507bfa.jpg","https://i.pinimg.com/originals/91/64/1a/91641ad7f4c97bcb72b703fe22f365a4.jpg","https://i.pinimg.com/originals/0e/51/88/0e51888aa8722c45dd597a6d3fbc7e36.jpg","https://i.pinimg.com/originals/01/c1/44/01c144199df14fbf8a73994ae988b8d8.jpg","https://i.pinimg.com/originals/ee/eb/76/eeeb7604b45bcc88973cdc873594c3d9.jpg","https://i.pinimg.com/originals/f8/97/ad/f897ade4cfef5f85b88cbf8697d0417e.jpg","https://i.pinimg.com/originals/a3/d8/5d/a3d85d03f8c1967e538989b22d52f19a.jpg","https://i.pinimg.com/originals/94/f5/49/94f5493330a1efee310e1b9cd1a27b06.jpg","https://i.pinimg.com/originals/70/10/b5/7010b553faf3801adc739c495f6fc119.jpg","https://i.pinimg.com/originals/1c/c2/6a/1cc26a12b1b4486958c97f8e9edf8581.jpg","https://i.pinimg.com/originals/15/c2/71/15c2713114b86dbfeaebe6c950d326d3.jpg","https://i.pinimg.com/originals/25/5a/91/255a91f158547b3d1ee367367d4916a3.jpg","https://i.pinimg.com/originals/8a/4c/75/8a4c7556dfa9edecb0cc6b8aab165053.jpg","https://i.pinimg.com/originals/22/7a/6c/227a6ca400ed3c851f811484d1b628c8.jpg","https://i.pinimg.com/originals/39/5f/c7/395fc70cd15645a64d829276e32c8ef3.jpg","https://i.pinimg.com/originals/bb/6e/e2/bb6ee2062956ffbb70d131ef811d4454.jpg","https://i.pinimg.com/originals/92/04/36/920436bab761f7ae1ee37b08a832bd76.jpg","https://i.pinimg.com/originals/b1/ff/79/b1ff79611a50fabc657dd59b22bc3ee2.jpg","https://i.pinimg.com/originals/cb/cc/48/cbcc4889290525caa8cdca3949f4a423.jpg","https://i.pinimg.com/originals/fe/a0/29/fea029710832a33ca6dc5a44a2dc1c6c.jpg","https://i.pinimg.com/originals/62/85/07/62850707ab5d392e8435fe6cbf4470c1.jpg","https://i.pinimg.com/originals/61/bd/16/61bd1674fed9932fba97a0a0fcc59a2a.png","https://i.pinimg.com/originals/fe/9e/5e/fe9e5e68206686fc36227888d454cf2c.jpg","https://i.pinimg.com/originals/17/fd/a0/17fda02e598a05e5140c931a6c1c2ca1.png","https://i.pinimg.com/originals/cf/aa/49/cfaa49112bfd40d8573ad6428d660ef7.jpg","https://i.pinimg.com/originals/81/e2/bc/81e2bc521f773a3fc1b98f2e5e22c076.jpg","https://i.pinimg.com/originals/4c/a7/4c/4ca74c611ed90c1acb3d2852c7f51d19.jpg","https://i.pinimg.com/originals/0b/37/23/0b372338996f9097c73c837235971d36.jpg","https://i.pinimg.com/originals/35/0d/54/350d54b2fd04eadd948ef374ffd2f60d.jpg","https://i.pinimg.com/originals/90/4c/b8/904cb89fe875d527334e213e045b2227.jpg","https://i.pinimg.com/originals/b0/b9/48/b0b9486df610e1e06f7bc01fa13abcb3.jpg","https://i.pinimg.com/originals/97/b1/66/97b16609b896c5eda57bc161358f391b.jpg","https://i.pinimg.com/originals/15/79/1e/15791e39c6c6bf00dce50e4698e8725a.jpg","https://i.pinimg.com/originals/a5/52/b0/a552b0adc350b6e852c64d0134840374.jpg","https://i.pinimg.com/originals/b2/ed/a2/b2eda2ea5b906d573d96f986b47b9c8b.jpg","https://i.pinimg.com/originals/5e/77/5a/5e775a20beee6c566e6def2a9cbc250c.jpg","https://i.pinimg.com/originals/f5/e3/c5/f5e3c59b999cf665437820fa5e2fcfcf.png","https://i.pinimg.com/originals/ab/90/6b/ab906b1d2ac2a119e0c8a99f1c0c0d1a.jpg","https://i.pinimg.com/originals/0e/5a/ba/0e5aba773ff6c8891ab353171a1e19a9.png","https://i.pinimg.com/originals/71/3b/32/713b32cdc48bcce185462fe4f7bc430f.jpg","https://i.pinimg.com/originals/92/1d/0a/921d0a393ab9567dd5d84e377e7f1235.jpg","https://i.pinimg.com/originals/d9/0a/ff/d90aff707866f2fe5fc2afbb56e72a25.jpg","https://i.pinimg.com/originals/63/a1/fe/63a1fe869263f413c17e79386bd03cdb.png","https://i.pinimg.com/originals/7a/3e/c6/7a3ec63f2892d19fb93720d62ff2eb1d.png","https://i.pinimg.com/originals/65/1e/02/651e02da08ec25273a3c1f59b8ad4121.jpg","https://i.pinimg.com/originals/79/99/fc/7999fc4486f32aa072380f0c31908701.png","https://i.pinimg.com/originals/c3/79/d8/c379d80a1fea41f53b23dbb72fa0bb52.png","https://i.pinimg.com/originals/9c/50/ce/9c50ce88bd24d950223acd0803143531.png","https://i.pinimg.com/originals/f0/9c/49/f09c49c121c6b28d7a42310514409bce.jpg","https://i.pinimg.com/originals/f3/bb/f8/f3bbf8f8a93d2be765546bec60a85e70.jpg","https://i.pinimg.com/originals/e6/37/ba/e637baae4832bd24813a12b501381d63.jpg","https://i.pinimg.com/originals/0b/ac/64/0bac64de82e83d0a6c3d1729077dcd94.png","https://i.pinimg.com/originals/04/53/c9/0453c9782fc76cd93b31c8dac9be1fb2.jpg","https://i.pinimg.com/originals/7a/90/3f/7a903f1df6484ec592efc10ead5311ca.jpg","https://i.pinimg.com/originals/19/a3/4e/19a34e2fd70b67096a84464a7cfefa88.png","https://i.pinimg.com/originals/2f/a8/ba/2fa8ba5dbc1ddd44944c6d070de436fb.jpg","https://i.pinimg.com/originals/1a/1a/96/1a1a96530faac125dbe3f6de55596431.jpg","https://i.pinimg.com/originals/7a/c0/58/7ac0580b98f888aeb1ed5df48fa09f76.jpg","https://i.pinimg.com/originals/b0/ef/22/b0ef22f342ed1033f70249cf2303c1cd.png","https://i.pinimg.com/originals/d3/2a/b5/d32ab5d6ec79eed4ff600c746c7aba21.jpg","https://i.pinimg.com/originals/18/aa/3b/18aa3b34bb765fde559d7754887d3815.png","https://i.pinimg.com/originals/32/3a/58/323a582fc19ec41913eb8bb24f3feab1.jpg","https://i.pinimg.com/originals/bd/76/1f/bd761f7d0533e0f2607edea6ed8ab428.jpg","https://i.pinimg.com/originals/69/49/15/694915598e937cfbb356b512d3eb4c7e.jpg","https://i.pinimg.com/originals/d0/d3/f8/d0d3f8f2f77c796db4afb5e4711efc18.jpg","https://i.pinimg.com/originals/7b/f6/3c/7bf63c1d51e6ac7f268f43c081184999.png","https://i.pinimg.com/originals/8d/bd/b0/8dbdb07becd855dc5708d0e481ee2cd6.png","https://i.pinimg.com/originals/29/73/d9/2973d9f22e8af0b00b3cbd47eaec9230.png","https://i.pinimg.com/originals/6d/8f/5c/6d8f5c91dfd3bcb6548ab79692a399ed.png","https://i.pinimg.com/originals/48/82/13/488213005de2fe15863c157ec6e32558.jpg","https://i.pinimg.com/originals/fd/52/ff/fd52ff75e986955465c02b080bdd817d.jpg","https://i.pinimg.com/originals/fc/c3/29/fcc3290b809a21a3688aea3ee35edb19.jpg","https://i.pinimg.com/originals/cf/ea/d7/cfead75b736d4ae518ef8d452a2201bd.jpg","https://i.pinimg.com/originals/af/f6/fd/aff6fde5269e192dcb9b9c8ae75d5f62.jpg","https://i.pinimg.com/originals/cb/e2/b4/cbe2b493aa70a57c38338edd0853837e.jpg","https://i.pinimg.com/originals/f4/be/ba/f4bebac38343e045dff6f0f71ff36c20.jpg","https://i.pinimg.com/originals/5e/4d/c8/5e4dc8737507e34d32cf818e355c67bc.jpg","https://i.pinimg.com/originals/84/14/d2/8414d23a12886edeb83976298f76c318.jpg","https://i.pinimg.com/originals/35/56/37/355637780363c8b09e281dcd8e2d4873.jpg","https://i.pinimg.com/originals/07/91/7a/07917adee777b8fd62a23e0a0239ad32.jpg","https://i.pinimg.com/originals/2c/37/b1/2c37b17229ac4a1e174af25656db791b.jpg","https://i.pinimg.com/originals/89/79/6c/89796cf922112a5a0c88b25d93e19fcd.jpg","https://i.pinimg.com/originals/0e/85/ba/0e85ba305df7e26a6f5e094f1028d802.jpg","https://i.pinimg.com/originals/92/68/0f/92680f5f4fcbdece25d92eeb9a9430a2.jpg","https://i.pinimg.com/originals/85/e9/66/85e96680f98db96c9ef99d0f0e3b60be.jpg","https://i.pinimg.com/originals/f9/52/d2/f952d217966264593d5a1e76bb3faf08.jpg","https://i.pinimg.com/originals/50/90/fa/5090fa93289f3a36cecc017a38778046.png","https://i.pinimg.com/originals/f8/e2/22/f8e222c5aba0b152fd37abc3827e07d4.jpg","https://i.pinimg.com/originals/94/f5/49/94f5493330a1efee310e1b9cd1a27b06.jpg","https://i.pinimg.com/originals/da/68/c7/da68c7dcd00bd1d77fdc49092b89f409.jpg","https://i.pinimg.com/originals/eb/9d/ec/eb9dec63cd960a6624e20dd233c6407e.jpg","https://i.pinimg.com/originals/95/e0/4a/95e04ad809e2ab5f5a015cd6e5db3aa9.jpg","https://i.pinimg.com/originals/cb/db/95/cbdb958051d32925f7d9eb5ee8bd3b3c.jpg","https://i.pinimg.com/originals/65/e9/5b/65e95bc528c99886e6331393a24ddf5a.jpg","https://i.pinimg.com/originals/10/74/ea/1074ea4df6c6e614bdb72b60891606d2.jpg","https://i.pinimg.com/originals/de/c0/44/dec04405afeb1841e5f4f7998ee60e3c.jpg","https://i.pinimg.com/originals/26/f6/14/26f614548ab0c5e910ec9f0cc905c569.jpg","https://i.pinimg.com/originals/7b/7c/d1/7b7cd11777b05d9e9a4d269d963d0493.jpg","https://i.pinimg.com/originals/04/9c/88/049c8822d929df0441d815d0793830d4.jpg","https://i.pinimg.com/originals/c9/9f/c9/c99fc967ffe9e9ac0499d09b6c70ad54.jpg","https://i.pinimg.com/originals/36/67/76/3667766be1b0624d9516cad4311e896b.jpg","https://i.pinimg.com/originals/d3/a8/68/d3a868ec857a86f5181661b90b662be2.jpg","https://i.pinimg.com/originals/2a/b9/6c/2ab96c26bb83f403ba65c7fa52f113ca.jpg","https://i.pinimg.com/originals/76/58/ab/7658aba3516df96e1e8f1b3aba9a8ee9.jpg","https://i.pinimg.com/originals/18/1f/c1/181fc1d9ad540a7195d195b319ba0971.jpg","https://i.pinimg.com/originals/79/08/99/790899bbc9c969580adf00a110fb953c.jpg","https://i.pinimg.com/originals/f3/8f/46/f38f46f4533cf4072b831ff3e2ad7c98.jpg","https://i.pinimg.com/originals/15/a3/12/15a312376f0ae4fecc2e0a5f7628fd75.jpg","https://i.pinimg.com/originals/e0/6c/75/e06c7585afe4e108bbb6ca63afd46b7f.jpg","https://i.pinimg.com/originals/e1/8f/a2/e18fa21af74c28e439f1eb4c60e5858a.jpg","https://i.pinimg.com/originals/0b/b7/4e/0bb74e2ef2e4e76abfd479da4ec40f7f.jpg","https://i.pinimg.com/originals/71/28/69/712869eb58acb23d0c60499544dd527f.jpg","https://i.pinimg.com/originals/53/d7/69/53d769c85bf39e8710cc697c0de379f8.jpg","https://i.pinimg.com/originals/79/ff/8f/79ff8f13f029ec9e2c88a1adca7d70d2.jpg","https://i.pinimg.com/originals/d9/7f/8f/d97f8f89c653dd57ae17953941c47f12.jpg","https://i.pinimg.com/originals/29/10/0e/29100ebbbd31ab7b014b35711076263b.jpg","https://i.pinimg.com/originals/43/06/4c/43064ca4065caf8ed6769b380b62026f.jpg"]
                let cewe = items[Math.floor(Math.random() *items.length)]
                client.sendFileFromUrl(from, cewe, 'ptl1.jpeg', 'babeeeeeeee!, aku kangen 👉👈', id)
                break
            case 'ptl2':
                const itemsc = ["https://i.pinimg.com/originals/16/69/1a/16691a8077975b5d2dbc5069d1f4b140.jpg","https://i.pinimg.com/originals/34/dd/1a/34dd1a50d6a6c1f106f501d4e5c90bd6.jpg","https://i.pinimg.com/originals/bd/f0/ae/bdf0ae0c022465f97132b0cbaa298618.jpg","https://i.pinimg.com/originals/94/65/d5/9465d58f1bfc65747647f04660e2b9fd.jpg","https://i.pinimg.com/originals/8b/4e/ff/8b4effab87575f135ef27a4c2c721900.jpg","https://i.pinimg.com/originals/08/c9/64/08c9640c9559d4c5b7c6d028aa360d59.jpg","https://i.pinimg.com/originals/cc/d8/4b/ccd84b18e36220b833d554c6e2676dd8.jpg","https://i.pinimg.com/originals/59/59/80/595980a143f2f33ddeb446303e69ef18.jpg","https://i.pinimg.com/originals/37/cd/50/37cd5002b619140e94b4687c67422fc1.jpg","https://i.pinimg.com/originals/f5/30/71/f53071d719e3146910aeae0f9a6f6038.jpg","https://i.pinimg.com/originals/c2/d6/ff/c2d6ff835876b7f2edf6f89f41fb8614.jpg","https://i.pinimg.com/originals/c2/2c/a0/c22ca09aeac654c6669847663cf516c9.jpg","https://i.pinimg.com/originals/eb/f7/83/ebf78387ec8d044fe249aac7caac7471.jpg","https://i.pinimg.com/originals/8d/26/c5/8d26c5da352313b71bedb715a5ab513a.jpg","https://i.pinimg.com/originals/08/60/34/08603455b1edbd8b518274e82787e55e.jpg","https://i.pinimg.com/originals/ac/1f/7e/ac1f7e155f5d653d0fba93f77662eca8.jpg","https://i.pinimg.com/originals/4f/99/7a/4f997abc0b83b58b8d014447e58726a8.jpg","https://i.pinimg.com/originals/60/a3/3b/60a33b8badb8b31d2bc50f10831c9da6.jpg","https://i.pinimg.com/originals/63/46/46/6346462004e62026cf4b4c9237b1a756.jpg","https://i.pinimg.com/originals/35/5c/22/355c22d5c0fbfe12dc547e9de60258e3.jpg","https://i.pinimg.com/originals/80/27/d9/8027d98229771de775d64abccde67a06.jpg","https://i.pinimg.com/originals/5e/9d/75/5e9d7590d69b4651aea87eeef26f7142.jpg","https://i.pinimg.com/originals/7c/e6/af/7ce6af412ef85f65386de85b673bb0a1.jpg","https://i.pinimg.com/originals/8f/4d/eb/8f4debf3a21d701879cf1ac4de114c06.jpg","https://i.pinimg.com/originals/8c/ab/2a/8cab2af27a20a712afa10125c35b106a.jpg","https://i.pinimg.com/originals/f8/2c/d8/f82cd8775d8df57a36705dc5671a1202.jpg","https://i.pinimg.com/originals/c6/fc/f5/c6fcf5dd33def0dfe36b7dad804e7e19.jpg","https://i.pinimg.com/originals/1e/70/25/1e702595be935f5ab2db43b09cf1202b.jpg","https://i.pinimg.com/originals/83/78/e1/8378e1a123c4cf939a960ed3338c8e9d.jpg","https://i.pinimg.com/originals/59/1a/bf/591abfd1d79ddfeb569b6f412dfb9ff0.jpg","https://i.pinimg.com/originals/a8/2b/ea/a82beaf05367b4c3418d7c4a756d62f3.jpg","https://i.pinimg.com/originals/2a/49/26/2a4926d24ebfa657ebcd035b5a57ff1a.jpg","https://i.pinimg.com/originals/9e/ab/38/9eab38c3720c47e36881904ffb3ea6b6.jpg","https://i.pinimg.com/originals/ff/db/fd/ffdbfd2300dd4727f1960f3345919d1a.jpg","https://i.pinimg.com/originals/90/76/b3/9076b30a92fd2d663142d867857c4e73.jpg","https://i.pinimg.com/originals/af/69/8a/af698a44530691623cb79cabe0b1d34c.jpg","https://i.pinimg.com/originals/bf/8c/dc/bf8cdc740e2bf5be37cefb23c52b3f17.jpg","https://i.pinimg.com/originals/71/4e/40/714e40dd26a912549ff315dab5731339.jpg","https://i.pinimg.com/originals/d4/b2/1b/d4b21b87c5a41ef25e50bff67d0ae3f7.jpg","https://i.pinimg.com/originals/fe/cc/09/fecc09a06e8f451976a0d0737f83cd57.png","https://i.pinimg.com/originals/5a/ca/41/5aca416051ee80e9c54984ac6fb78f31.jpg","https://i.pinimg.com/originals/62/41/9c/62419c3cfaa5e96cf9c2f93ddaadfc75.jpg","https://i.pinimg.com/originals/4f/ca/24/4fca248555ddfb294bb8e1b2e458ccdc.jpg","https://i.pinimg.com/originals/df/4a/f7/df4af763738d4729f950cc9fe4af2948.jpg","https://i.pinimg.com/originals/d2/5a/27/d25a27ea23449dfc9934ee9c1a3baddf.jpg","https://i.pinimg.com/originals/7b/3b/62/7b3b62bb58069f834c2de24c1fd761a2.jpg","https://i.pinimg.com/originals/38/df/4e/38df4ee79d12e6b01f0dbb6fabc20fd0.jpg","https://i.pinimg.com/originals/f6/30/6d/f6306d337b1a0cdbba422da38a29545a.jpg","https://i.pinimg.com/originals/6f/d8/15/6fd8157b467aa7315f6c48b9e672a2e8.jpg","https://i.pinimg.com/originals/4d/ed/28/4ded286847e482a5bcc0eab9e3ff7681.jpg","https://i.pinimg.com/originals/8f/4d/eb/8f4debf3a21d701879cf1ac4de114c06.jpg","https://i.pinimg.com/originals/8f/6d/47/8f6d47226b625750a1a6dbbfc5377889.jpg","https://i.pinimg.com/originals/c7/a0/00/c7a00048da71e60f322da2677dc81f6b.jpg","https://i.pinimg.com/originals/3f/b3/b2/3fb3b2a87235e2a233a06aac710fb1f1.jpg","https://i.pinimg.com/originals/f3/94/8f/f3948f866168b43ee64907fe8b1913e7.jpg","https://i.pinimg.com/originals/23/99/f4/2399f43eeef7ec3e93e59a02b7688a52.jpg","https://i.pinimg.com/originals/e3/01/f9/e301f966985d29d4512d6f89d1348d4d.jpg","https://i.pinimg.com/originals/29/50/c3/2950c349c2a5ec61cb0485ea1eca1d2c.png","https://i.pinimg.com/originals/2f/94/77/2f9477ff2febf665640904ab3a042495.jpg","https://i.pinimg.com/originals/72/65/e0/7265e00be57ed1c87a5a743b5b55643d.jpg","https://i.pinimg.com/originals/6c/ba/97/6cba97f49d31f5bc88634029e70ae339.jpg","https://i.pinimg.com/originals/2d/a7/3b/2da73bcc530878c5e0b74d67203fe78b.jpg","https://i.pinimg.com/originals/c1/e5/98/c1e59834a9d24ad475ce814bd04181ea.jpg","https://i.pinimg.com/originals/aa/1f/d7/aa1fd7738ee2b33e9950411d5562dcfc.jpg","https://i.pinimg.com/originals/ca/fd/28/cafd28796de1faa682d23f7b9d6d91f3.jpg","https://i.pinimg.com/originals/1e/70/25/1e702595be935f5ab2db43b09cf1202b.jpg","https://i.pinimg.com/originals/86/ae/ae/86aeaee76a8b2aeae50a958dcb3eaca9.jpg","https://i.pinimg.com/originals/c8/02/c9/c802c9c238324e899655c96334d52951.jpg","https://i.pinimg.com/originals/71/4e/40/714e40dd26a912549ff315dab5731339.jpg","https://i.pinimg.com/originals/9b/25/80/9b258038bfb79d72306655e952090ea8.jpg","https://i.pinimg.com/originals/54/82/c4/5482c4b76cc9d4f82255f48405782d20.jpg","https://i.pinimg.com/originals/dd/6b/00/dd6b00f6427dbf18f54525a947ad240f.jpg","https://i.pinimg.com/originals/58/74/49/5874496af199e0823bd2caf4dbf6e641.jpg","https://i.pinimg.com/originals/a5/02/54/a5025442565a227ea510936b0cea7a47.jpg","https://i.pinimg.com/originals/65/c8/5e/65c85eeefc3aa3fb7159c81bd5b0c16c.jpg","https://i.pinimg.com/originals/09/a3/c9/09a3c95e0b22893c02d1ea6ea9956239.jpg","https://i.pinimg.com/originals/1c/88/e3/1c88e3e3bc57d139a4b1595a2bb3b1d6.jpg","https://i.pinimg.com/originals/2c/d2/4a/2cd24a3abd8ceae45f7973dc57af95f2.png","https://i.pinimg.com/originals/58/c2/15/58c2153d0e6240387ec453b01f660051.jpg","https://i.pinimg.com/originals/0f/dc/02/0fdc027a2c92ef7eb90a6acd9b221f97.jpg","https://i.pinimg.com/originals/b0/9d/8b/b09d8b61846eaf14141da1715c75854e.jpg","https://i.pinimg.com/originals/96/4d/e7/964de7914346fe87422d02f74ec9b236.png","https://i.pinimg.com/originals/71/ef/21/71ef21c9f0ae0d7032c359a3b305b276.jpg","https://i.pinimg.com/originals/b8/a4/af/b8a4af22a40a25fc6ac80292daf25a58.jpg","https://i.pinimg.com/originals/4c/aa/3e/4caa3e3ebc39444f2113aa940cbdcd9d.jpg","https://i.pinimg.com/originals/a9/b4/ab/a9b4ab6e97b9e30db5e3ff3c9493d62a.jpg","https://i.pinimg.com/originals/91/23/d4/9123d4f947ba56745845c9152fcf3227.jpg","https://i.pinimg.com/originals/70/4a/54/704a54fb24167045b33faf3392071ec7.jpg","https://i.pinimg.com/originals/c5/6b/6d/c56b6dc8dc937671f4a732273ebb0a93.jpg","https://i.pinimg.com/originals/01/80/7b/01807be368d46b35869ee0103b3702fc.jpg","https://i.pinimg.com/originals/4c/f2/da/4cf2da70383c5f8b6ab6ad84f82f4512.jpg","https://i.pinimg.com/originals/56/aa/29/56aa291b26ff456ec138f2b805fedab0.jpg","https://i.pinimg.com/originals/b8/c7/38/b8c73878fe861c1cdd32c13c4fbde0d5.jpg","https://i.pinimg.com/originals/15/32/a4/1532a4c60f7e3343ab960f8a667cc455.jpg","https://i.pinimg.com/originals/d3/eb/69/d3eb69f74345ff0ebc343b7218c6787b.jpg","https://i.pinimg.com/originals/21/c1/d4/21c1d49b049cb6b8c06201c771cd339a.jpg","https://i.pinimg.com/originals/d3/a4/68/d3a468621cedf7ba3a6e36972cd28f14.jpg","https://i.pinimg.com/originals/9e/47/a4/9e47a4e9dc379f268a9a9c634876eb7b.jpg","https://i.pinimg.com/originals/4b/80/5b/4b805b471c1b79a2d5293ff56bbca511.jpg","https://i.pinimg.com/originals/49/18/18/49181884b431af999cb333123d402255.jpg"]
                let cowo = itemsc[Math.floor(Math.random() *itemsc.length)]
                client.sendFileFromUrl(from, cowo, 'ptl2.jpeg', 'sayang, mau ikut main ga?', id)
                break
            case 'ptlsh':
                const itemssh = ["https://i.pinimg.com/originals/74/b0/26/74b0268d2f4546996fa25afdafa980dc.jpg","https://i.pinimg.com/originals/f2/e9/1d/f2e91d2e9b671d6ebf59bacab216762f.jpg","https://i.pinimg.com/originals/80/72/79/807279a91face343ca53bffcec989cf4.jpg","https://i.pinimg.com/originals/a1/11/1a/a1111abf90379e4fa883fa3b8b5d643a.jpg","https://i.pinimg.com/originals/09/bd/57/09bd57e50174134865c250684e9ddda1.jpg","https://i.pinimg.com/originals/73/a2/3d/73a23de8b98399afd93eb723540bae80.jpg","https://i.pinimg.com/originals/72/ee/27/72ee2735bbdb1b1a4992efbf4094477e.png","https://i.pinimg.com/originals/cb/a2/89/cba28917d4f8d5b8de63ec89b66d1afe.jpg","https://i.pinimg.com/originals/98/02/64/9802648c9c057644f754434871fc4e2e.jpg","https://i.pinimg.com/originals/46/c2/7b/46c27b4b1d2ae4459f750afd0d8021b1.jpg","https://i.pinimg.com/originals/68/56/1e/68561ed7e1a97842030fb0f39edf9c80.jpg","https://i.pinimg.com/originals/73/3e/ed/733eed5f6d1b8a9f22e692b993e70491.jpg","https://i.pinimg.com/originals/f5/71/6a/f5716a30204f93707bd2c8fc91bc9462.jpg","https://i.pinimg.com/originals/16/52/1d/16521d9b7ea44aa0a28e360bb5f705d6.jpg","https://i.pinimg.com/originals/27/fe/e8/27fee89007af1025d601c87763f1dc1d.jpg","https://i.pinimg.com/originals/d8/12/4a/d8124a11bd20912b0402ff61130f8489.jpg","https://i.pinimg.com/originals/eb/44/81/eb4481101e8b8763428e8fbbad3a7bdb.jpg","https://i.pinimg.com/originals/a6/34/cf/a634cfa655269069439e9476780b46fe.jpg","https://i.pinimg.com/originals/b5/01/72/b50172848dd7e3465beb16adb0599684.jpg","https://i.pinimg.com/originals/54/42/36/54423601bc0c926de050fc2d0836be79.jpg","https://i.pinimg.com/originals/e2/3c/0c/e23c0c12244ad392c982d6267d262dd2.jpg","https://i.pinimg.com/originals/fa/10/ca/fa10ca99305c151b3ae8cad8a20794f2.jpg","https://i.pinimg.com/originals/b4/02/be/b402bed7c76e052f368dac1ec740210a.jpg","https://i.pinimg.com/originals/32/43/8f/32438f37c5b6a1b2dabbf934162b11e4.jpg","https://i.pinimg.com/originals/55/49/cc/5549ccb0b32a10216b09f67632070507.jpg","https://i.pinimg.com/originals/a3/aa/aa/a3aaaae3a00f4211af2e8e4ecb1da007.jpg","https://i.pinimg.com/originals/fa/5f/6d/fa5f6d5e40adc51c2095333d7501e76f.jpg","https://i.pinimg.com/originals/44/e4/f7/44e4f767400646e3bc5bc6e0ebf7368d.jpg","https://i.pinimg.com/originals/34/20/8e/34208e0a125963d781b9171cb54bc171.jpg","https://i.pinimg.com/originals/8d/a4/0b/8da40b8c05ed685a39c93b27e4d69046.jpg","https://i.pinimg.com/originals/81/eb/13/81eb13ba9c391c3bbb56f0667b717740.jpg","https://i.pinimg.com/originals/56/3f/89/563f896b53f0787abf9ccef902d5209c.jpg","https://i.pinimg.com/originals/4e/b0/01/4eb0010c0fbab4324989af5186e3aa4a.jpg","https://i.pinimg.com/originals/68/94/13/68941383215d751d5c6eb72af4549019.jpg","https://i.pinimg.com/originals/12/b4/ee/12b4eef886901649cca0799faa9f651f.jpg","https://i.pinimg.com/originals/01/4b/9e/014b9edaf6f3cf315793b0a63c24fa35.jpg","https://i.pinimg.com/originals/78/fa/10/78fa10ab94c0dc9e19a18358a9752070.jpg","https://i.pinimg.com/originals/53/4e/85/534e85a5af73e256d5dd824bef563de0.jpg","https://i.pinimg.com/originals/9f/37/7a/9f377a105a0f7cc4bea1f553bea36d06.jpg","https://i.pinimg.com/originals/a6/6c/6c/a66c6cde03ea6ad72ca36776c5bb2ed9.jpg","https://i.pinimg.com/originals/5e/16/97/5e16970e6a84f3a4959c8d7e7117d287.jpg","https://i.pinimg.com/originals/88/c0/72/88c072ea8f6b047c8971efa099f2ab25.jpg","https://i.pinimg.com/originals/03/5f/ed/035fed621d33d42f453f314049a09244.jpg","https://i.pinimg.com/originals/0d/53/15/0d53156e1fa4d591d32e2ecd8c10f953.jpg","https://i.pinimg.com/originals/d0/5e/b8/d05eb893d80d9a02aa03d4b1314adff5.jpg","https://i.pinimg.com/originals/7c/e5/d8/7ce5d88853231888e9798f65a24ad11a.jpg","https://i.pinimg.com/originals/7c/67/0f/7c670fde8e6428661073e0a01996406b.jpg","https://i.pinimg.com/originals/6a/74/e5/6a74e5c6c6aeca129e9f5fd6976c77cb.jpg","https://i.pinimg.com/originals/3b/89/9c/3b899c8c52604a10812ee06b8ef4ad84.jpg","https://i.pinimg.com/originals/6a/15/1e/6a151e72a8f017c8988eb570841c8b35.jpg"]
                let cewesh = itemssh[Math.floor(Math.random() *itemssh.length)]
                client.sendFileFromUrl(from, cewesh, 'ptlsh.jpeg', 'sayang, kamu lagi apa?', id)
                break
            case 'ptllh':
                const itemslh = ["https://i.pinimg.com/originals/69/d7/b3/69d7b3d5a089e7cbee0250ea5da9b14b.jpg","https://i.pinimg.com/originals/78/fa/10/78fa10ab94c0dc9e19a18358a9752070.jpg","https://i.pinimg.com/originals/93/e0/a3/93e0a3816183696ff89b1ad7db2fd3c0.jpg","https://i.pinimg.com/originals/a6/34/cf/a634cfa655269069439e9476780b46fe.jpg","https://i.pinimg.com/originals/dc/f5/69/dcf569a7b08efcae64d0747b51d04a7d.jpg","https://i.pinimg.com/originals/4f/96/2b/4f962b89bd7ceb438b3e9ebbd075184c.jpg","https://i.pinimg.com/originals/c2/fb/e7/c2fbe7a6955a85c51b9ee8062a7b68d3.jpg","https://i.pinimg.com/originals/44/54/24/44542415cf206f2c041e3bbb52a69419.jpg","https://i.pinimg.com/originals/ae/3c/40/ae3c40e0a2f653811b5a67ccd6b9d8cc.jpg","https://i.pinimg.com/originals/bd/fa/33/bdfa3317d96e6cdafaf27e3b337d05b4.jpg","https://i.pinimg.com/originals/75/6a/f2/756af236ae909431567ed184c43aae6f.png","https://i.pinimg.com/originals/a5/95/d7/a595d7fe6b8dc00d1aaa7287f1dd304e.jpg","https://i.pinimg.com/originals/40/37/78/40377871ee06a4a434c39e90b1f647e1.jpg","https://i.pinimg.com/originals/45/73/ac/4573ac9484c480500872b7c91f758040.jpg","https://i.pinimg.com/originals/32/7d/0b/327d0be89cc60321128d0f0bdaadfc15.jpg","https://i.pinimg.com/originals/f4/a1/0f/f4a10ffd44aea604383be84a34f69f90.jpg","https://i.pinimg.com/originals/ec/7f/b5/ec7fb5506136f72876633aab957a755a.jpg","https://i.pinimg.com/originals/4c/e9/15/4ce915c8245586f541c4d0a8b71cc500.jpg","https://i.pinimg.com/originals/03/2a/14/032a145e96154753e33bdda30d9f41f1.jpg","https://i.pinimg.com/originals/f4/5b/07/f45b070de82acec89092eaea1b415029.jpg","https://i.pinimg.com/originals/a9/f2/da/a9f2da1277fb7bc801856c3b9c12d37d.jpg","https://i.pinimg.com/originals/af/ab/93/afab93ebbf109a601dcb77b5baa494b4.jpg","https://i.pinimg.com/originals/b9/38/df/b938dfba6c139ad45ce51203a43eac0d.jpg","https://i.pinimg.com/originals/af/10/0a/af100a49cb8f53f0dd5b48664ede9db8.jpg","https://i.pinimg.com/originals/99/18/6c/99186c2145e1223f885103f51817be78.jpg","https://i.pinimg.com/originals/3c/fd/c9/3cfdc9ba7cf79ed061808e162162f4da.jpg","https://i.pinimg.com/originals/31/95/64/319564a33b5ed46a52d30c18d2310f22.jpg","https://i.pinimg.com/originals/1c/2d/9f/1c2d9ffdd104200355bab43c9d3fad20.gif","https://i.pinimg.com/originals/4a/aa/12/4aaa12940f51fdfb1684964df3796c4c.jpg","https://i.pinimg.com/originals/37/90/bc/3790bc29be16d95174af4eff4ee3859f.jpg","https://i.pinimg.com/originals/4c/12/8f/4c128fda6e71a9f4c670a78a21d8c196.jpg","https://i.pinimg.com/originals/34/92/10/3492100b4a924458a2bf5340d68293c2.jpg","https://i.pinimg.com/originals/5a/dd/12/5add12091eafba364ec76c91d20e75ac.jpg","https://i.pinimg.com/originals/da/c3/59/dac359d1fc87193c2b9d85bb96fedcbc.jpg","https://i.pinimg.com/originals/2e/d6/a9/2ed6a9670d942220eab92b99bb0d1c09.jpg","https://i.pinimg.com/originals/f1/89/e3/f189e3d9b353f91b60060cc64e6706c9.jpg","https://i.pinimg.com/originals/8c/06/c2/8c06c22283cf98abdb8922e2f3aa0a6a.jpg","https://i.pinimg.com/originals/8b/6f/0b/8b6f0b1e213240eaad90894292a2d3c1.jpg","https://i.pinimg.com/originals/89/bf/b8/89bfb86392d39477adcd66444cf19845.jpg","https://i.pinimg.com/originals/35/e2/cc/35e2cc3c535d8f1cfeaf13cce69ac984.jpg","https://i.pinimg.com/originals/c0/01/a1/c001a16e2629872a3d7ea7fdbe5a4e98.jpg","https://i.pinimg.com/originals/b4/eb/48/b4eb486def2d413716c5fa033af9fb34.jpg","https://i.pinimg.com/originals/55/ee/7b/55ee7b5f4889cc34ec1a01d2e7875b53.jpg","https://i.pinimg.com/originals/0c/b3/0e/0cb30ea660aafbae32cc07433bf3eea2.jpg","https://i.pinimg.com/originals/1f/50/23/1f5023991f2a01cff748e84c4cf3612d.jpg","https://i.pinimg.com/originals/ab/53/07/ab5307df9234934f385eb6235aa6c2cd.jpg","https://i.pinimg.com/originals/e1/a1/7c/e1a17c5f359846741c687ef1fcadb316.jpg","https://i.pinimg.com/originals/16/1b/21/161b215ee2f8e0a040c91f18c054d705.jpg","https://i.pinimg.com/originals/da/07/1a/da071a5fafbc6487d38edd4e9f3401db.jpg","https://i.pinimg.com/originals/54/f4/26/54f42615f9ad45743e6fb08ed86623f0.jpg"]
                let cewelh = itemslh[Math.floor(Math.random() *itemslh.length)]
                client.sendFileFromUrl(from, cewelh, 'ptlsh.jpeg', 'Halo Sayang', id)
                break
            case 'jihyo':
                const itemsj = ["https://i.pinimg.com/originals/49/44/12/494412ecfbb7fe1aed09c092d2783ae3.jpg","https://i.pinimg.com/originals/e4/a1/42/e4a1420292aa39f70c7e023b36fe22ca.jpg","https://i.pinimg.com/originals/2c/eb/9b/2ceb9bc4325a796af481dac471f8455c.jpg","https://i.pinimg.com/originals/cb/b8/fc/cbb8fc2d07f3e12ef875197f8f2ce2f1.jpg","https://i.pinimg.com/originals/f7/40/70/f74070d0443d9ef396646db865f5a382.jpg","https://i.pinimg.com/originals/7c/ab/99/7cab999d3d5a5613f012e53c6b7179b3.png","https://i.pinimg.com/originals/ac/e7/8d/ace78d71c8c7b0d37e4df5905d1157ba.jpg","https://i.pinimg.com/originals/d9/7a/d8/d97ad8756a7dc4765b684bae583188b0.png","https://i.pinimg.com/originals/59/74/26/5974263811342b214ee8efa78cc6f26c.png","https://i.pinimg.com/originals/e7/35/f8/e735f87f45cdd85e3c99b0e9d20559e5.jpg","https://i.pinimg.com/originals/c7/73/aa/c773aaaf1b9c6c961f828b0c186ac815.jpg","https://i.pinimg.com/originals/82/03/ab/8203ab89eb0c52405c80e2c7c8427d2b.jpg","https://i.pinimg.com/originals/ba/1d/9c/ba1d9cea6ca7722b9a47f0838da82b78.jpg","https://i.pinimg.com/originals/c6/76/a0/c676a0cec72c7a8791a2623a596f1c1e.jpg","https://i.pinimg.com/originals/24/22/2a/24222a197be35a305a0a751551c1a55b.jpg","https://i.pinimg.com/originals/a6/2c/6b/a62c6b1b2d46512a3987433a2a16688f.jpg","https://i.pinimg.com/originals/55/f9/08/55f908ac0623051648e2d3ccafa85218.jpg","https://i.pinimg.com/originals/e1/c7/3e/e1c73e49d6e7cb2dd56e20ce49c65ac1.jpg","https://i.pinimg.com/originals/76/68/37/7668374a8702eedbad7e4babfafd208a.jpg","https://i.pinimg.com/originals/0c/4e/f7/0c4ef73ee9d5306a0584258d0812a6f6.jpg","https://i.pinimg.com/originals/d1/56/8a/d1568a27bb9b8e246db5e5f9db0e121d.jpg","https://i.pinimg.com/originals/35/69/2a/35692a05e1c6fb2e9079667c383defde.jpg","https://i.pinimg.com/originals/7d/1e/8d/7d1e8df7034c0fa9e3d667c63a252aa9.jpg","https://i.pinimg.com/originals/c3/03/83/c30383a093faee5dfe82a3bc341fa80b.jpg","https://i.pinimg.com/originals/3e/a9/1c/3ea91c449216e2b0310b406d3a31ea2a.jpg","https://i.pinimg.com/originals/e1/c9/20/e1c92024b6dc4790c816665ec7a4d816.png","https://i.pinimg.com/originals/d5/73/18/d57318846d3eabf97456f8af2a85ab51.jpg","https://i.pinimg.com/originals/08/61/16/086116215a1315d697c5c901f020e95c.jpg","https://i.pinimg.com/originals/5e/b9/a7/5eb9a73e0920b81bb569aab7b6c48678.png","https://i.pinimg.com/originals/c3/d1/e6/c3d1e61c41ea5dba64e837b4585eb455.jpg","https://i.pinimg.com/originals/30/b9/01/30b9014d24e4e70d2bb27c14a808cd4c.jpg","https://i.pinimg.com/originals/00/25/c0/0025c057c04ba83b9d4c926192f3be51.jpg","https://i.pinimg.com/originals/34/61/f5/3461f54fad288e22e269a7d6432b9260.jpg","https://i.pinimg.com/originals/8d/58/68/8d586877d23100b33f84e3830cb0673c.jpg","https://i.pinimg.com/originals/87/6d/a1/876da10708aae4d924d52944d1a8e92c.jpg","https://i.pinimg.com/originals/66/fd/91/66fd9175967f3e15f1d74af1671e6865.jpg","https://i.pinimg.com/originals/78/8b/d5/788bd5304bb5ce76b155638441ed0438.jpg","https://i.pinimg.com/originals/8f/ea/82/8fea827fc7f3713b84cf0537e15ec304.jpg","https://i.pinimg.com/originals/5a/91/c3/5a91c3d96830079a072da6079a6ea9cc.jpg","https://i.pinimg.com/originals/06/f3/aa/06f3aa25c423332b33a85958b40fddfe.jpg","https://i.pinimg.com/originals/ca/bc/e5/cabce5bb3e5b373c51166361d09f40f3.jpg","https://i.pinimg.com/originals/f5/a7/6c/f5a76cc62c0c37d712f3f2d687aee0ad.jpg","https://i.pinimg.com/originals/80/85/12/808512ecb2d98d313624286213056a78.jpg","https://i.pinimg.com/originals/a4/a0/b5/a4a0b52176be121a6392c047e346a2ec.jpg","https://i.pinimg.com/originals/e1/40/ad/e140adfe4ba19f92df9c64987b9c59bd.jpg","https://i.pinimg.com/originals/9e/f6/ee/9ef6eed547dac3936ffa386ca322a426.png","https://i.pinimg.com/originals/4a/65/ad/4a65ad483b8ea0f572e3b27f0dd58d11.jpg","https://i.pinimg.com/originals/72/75/12/727512d45053dbbb754136061fa8b081.webp","https://i.pinimg.com/originals/fa/49/c9/fa49c9c7078ce78af07bcdac1aeeb3c9.jpg"]
                let cewej = itemsj[Math.floor(Math.random() *itemsj.length)]
                client.sendFileFromUrl(from, cewej, 'jihyoo.jpeg', 'Halo sayang', id)
                break
        case 'tsticker':
            if (isMedia && type == 'image') {
              try {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                const base64img = imageBase64
                const filename = "./media/pic.jpg";
                //console.log(base64img)
                const outFile = './media/noBg.png'
                const result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'your api key', size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                } catch(err) {
                    console.log(err)
                }
            }
            break
        case 'gsticker':
            if (isMedia && type == 'video') {
                if (mimetype === 'video/mp4' && message.duration < 30) {
                const mediaData = await decryptMedia(message, uaOverride)
               const filename = `./media/aswu.mp4`
                await fs.writeFile(filename, mediaData)
                await exec('ffmpeg -i ./media/aswu.mp4 -vf scale=512:-1 -r 10 -f image2pipe -framerate 24 -vcodec ppm - | convert -delay 0 -loop 0 - ./media/output.gif')
                const contents = await fs.readFile('./media/output.gif', {encoding: 'base64'}) 
                await client.sendImageAsSticker(from, `data:image/gif;base64,${contents.toString('base64')}`)
                }
            }
            break 
       case 'tts':
        	if (args.length == 0) return client.reply(from, 'Wrong Fromat!')
                const ttsEn = require('node-gtts')('en')
	        const ttsJp = require('node-gtts')('ja')
            const dataText = body.slice(8)
            if (dataText === '') return client.reply(from, 'Baka?', message.id)
            if (dataText.length > 250) return client.reply(from, 'Unable to convert', message.id)
            var dataBhs = body.slice(5, 7)
	        if (dataBhs == 'id') {
		    } else if (dataBhs == 'en') {
                ttsEn.save('./tts/resEn.mp3', dataText, function () {
                    client.sendPtt(from, './tts/resEn.mp3', message.id)
                })
		    } else if (dataBhs == 'jp') {
                ttsJp.save('./tts/resJp.mp3', dataText, function () {
                    client.sendPtt(from, './tts/resJp.mp3', message.id)
                })
		    } else {
		        client.reply(from, 'Currently only English and Japanese are supported!', message.id)
            }
            break
        case 'quotemaker':
            arg = body.trim().split('|')
            if (arg.length >= 3) {
            client.reply(from, 'Processing...', message.id) 
            const quotes = arg[1]
            const author = arg[2]
            const theme = arg[3]
            try {
            const resolt = await quotemaker(quotes, author, theme)
            client.sendFile(from, resolt, 'quotesmaker.jpg','neh...')
            } catch {
            client.reply(from, 'I\'m afraid to tell you that the image failed to process', message.id)
            }
            } else {
            client.reply(from, 'Usage: \n!quotemaker |text|watermark|theme\n\nEx :\n!quotemaker |...|...|random', message.id)
            }
            break
         // paid
        case 'groupinfo' :
            if (!isGroupMsg) return client.reply(from, '.', message.id) 
            var totalMem = chat.groupMetadata.participants.length
            var desc = chat.groupMetadata.desc
            var groupname = name
            var welgrp = wel.includes(chat.id)
            var ngrp = nsfwgrp.includes(chat.id)
            var grouppic = await client.getProfilePicFromServer(chat.id)
            if (grouppic == undefined) {
                 var pfp = errorurl
            } else {
                 var pfp = grouppic 
            }
            await client.sendFileFromUrl(from, pfp, 'group.png', `*${groupname}* 

> *Members: ${totalMem}*

> *Welcome: ${welgrp}*

> *NSFW: ${ngrp}*

> *Group Description* 

${desc}`)
        break
//DOWNLOADER
        case 'ytmp3':
            if (args.length >= 1){
                var param = body.substring(body.indexOf(' '), body.length)
                try {
                    client.reply(from, 'Tunggu sebentar yak...', message.id)
                    const resp = await get.get('https://mhankbarbar.herokuapp.com/api/yta?url='+ param).json()
                    console.log(resp)
                    if (resp.file) {
                        client.reply(from, 'Videonya ga valid!', message.id)
                    } else {
                        const { title, thumb, filesize, result } = await resp
                    if (Number(filesize.split(' MB')[0]) >= 30.00) return client.reply(from, 'Maaf durasi video sudah melebihi batas maksimal!', id)
                    client.sendFileFromUrl(from, thumb, 'thumb.jpg', `➸ Title : ${title}\n➸ Filesize : ${filesize}\n\nSilahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.`, id)
                    await client.sendFileFromUrl(from, result, `${title}.mp3`, '', id).catch(() => client.reply(from, mess.error.Yt3, id))
                    }
                } catch {
                    client.reply(from, 'Terjadi kesalahan!', message.id)
                }
            }
            break
        case 'ytmp4' :
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa *!menu*. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('youtube.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._`, id)
            downloader.ytmp4(url).then(async (ytMetav) => {
                const title = ytMetav.title
                const thumbnail = ytMetav.thumb
                const links = ytMetav.result
                const filesize = ytMetav.filesize
                const res = ytMetav.resolution
                const status = ytMetav.status
                if ( status !== 200) client.reply(from, 'Maaf, link anda tidak valid.', id)
                if (Number(filesize.split(' MB')[0]) >= 40.00) return reject('Maaf durasi video sudah melebihi batas maksimal !')
                client.sendFileFromUrl(from, thumbnail, 'thumbnail.jpg', `Judul: ${title}\nUkuran File: ${filesize}\nResolusi: ${res}\n\nSilakan di tunggu lagi proses boss....`, null, true)
                await client.sendFileFromUrl(from, links, `${title}.mp4`, null, null, true)
                .catch(() => client.reply(from, 'Terjadi kesalahan mungkin link yang anda kirim tidak valid!', id))
          })
          break
        case 'instagram':
        case 'ig':
            if (args.length >= 1) {
                var param = body.substring(body.indexOf(' '), body.length)
                try {
                    client.reply(from, 'Tunggu sebentar, sedang di proses..', message.id)
                    const resp = await get.get('https://villahollanda.com/api.php?url='+ param).json()
                    console.log(resp)
                    if (resp.mediatype == 'photo') {
                        var ext = '.png'
                    }else{
                        var ext = '.mp4'
                    }
                        client.sendFileFromUrl(from, resp.descriptionc, `igeh${ext}`)
                } catch {
                    client.reply(from, 'Terjadi kesalahan!')
                    }
                }
            break
        case 'fb':
        case 'facebook':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa *#menu*. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('facebook.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._`, id)
            downloader.facebook(url).then(async (videoMeta) => {
                const title = videoMeta.response.title
                const thumbnail = videoMeta.response.thumbnail
                const links = videoMeta.response.links
                const shorts = []
                for (let i = 0; i < links.length; i++) {
                    const shortener = await urlShortener(links[i].url)
                    console.log('Shortlink: ' + shortener)
                    links[i].short = shortener
                    shorts.push(links[i])
                }
                const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                await client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption, null, null, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            })
                .catch((err) => client.reply(from, `Error, url tidak valid atau tidak memuat video. [Invalid Link or No Video] \n\n${err}`, id))
            break
        case 'twt':
        case 'twitter':
        case 'twiter':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa *!menu*. [Wrong Format]', id)
            if (!isUrl(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'Maaf, link tidak valid atau tidak ada media di link yang kamu kirim. [Invalid Link]'))
            break
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa *!menu*. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('tiktok.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid. [Invalid Link]', id))
            break
        case 'bc':
            if(!isowner) return client.reply(from, 'Only Bot admins!', message.id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) client.sendText(ids, `[ EWH BOT Broadcast ]\n\n${msg}`)
            }
            client.reply(from, 'Broadcast Success!', message.id)
            break
        case 'ban':
            if(!isowner) return client.reply(from, 'Only Bot admins can use this CMD!', message.id)
            for (let i = 0; i < mentionedJidList.length; i++) {
                ban.push(mentionedJidList[i])
                fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
                client.reply(from, 'Succes ban target!', message.id)
            }
            break
        case 'covid':
            arg = body.trim().split(' ')
            console.log(...arg[1])
            var slicedArgs = Array.prototype.slice.call(arg, 1);
            console.log(slicedArgs)
            const country = await slicedArgs.join(' ')
            console.log(country)
            const response2 = await axios.get('https://coronavirus-19-api.herokuapp.com/countries/' + country + '/')
            const { cases, todayCases, deaths, todayDeaths, active } = response2.data
                await client.sendText(from, 'Covid Info -' + country + ' Total Kasus: ' + `${cases}` + '\nKasus hari ini: ' + `${todayCases}` + '\nMeninggal: ' + `${deaths}` + '\nMeninggal Hari Ini: ' + `${todayDeaths}` + '\nKasus Aktif: ' + `${active}` + '.')
            break
        case 'ping':
            if (!isGroupMsg) return client.reply(from, 'Sorry, This command can only be used in groups', message.id)
            if (!isGroupAdmins) return client.reply(from, 'Well, only admins can use this command', message.id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = `${body.slice(6)} - ${pushname} \n`
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '✨️'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '----------------------'
            await client.sendTextWithMentions(from, hehe)
            break
        case 'kickall':
            const isGroupOwner = sender.id === chat.groupMetadata.owner
            if(!isGroupOwner) return client.reply(from, 'Sorry, Only group owner can use this CMD', message.id)
            if (!isGroupMsg) return client.reply(from, 'This command can only be used in groups', message.id)
            if(!isBotGroupAdmins) return client.reply(from, 'You need to give me the power to do this before executing', message.id)
            const allMem = await client.getGroupMembers(groupId)
            console.log(isGroupAdmins)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) return
                await client.removeParticipant(groupId, allMem[i].id)
            }
            client.reply(from, 'Done!', message.id)
            break
        case 'clearall':
            if (!isowner) return client.reply(from, 'Owner only', message.id)
            const allChatz = await client.getAllChats()
            for (let dchat of allChatz) {
                await client.deleteChat(dchat.id)
            }
            client.reply(from, 'Done', message.id)
            break
        case 'act':
             arg = body.trim().split(' ')
             if (!isGroupAdmins) return client.reply(from, 'Only Admins can use this command', id)
             if (arg[1] == 'welcome') {
                wel.push(chat.id)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(wel))
                client.reply(from, `Welcome is now registered on *${name}*`, message.id)
             } else if (arg[1] == 'nsfw') {
                nsfwgrp.push(chat.id)
                fs.writeFileSync('./lib/nsfw.json', JSON.stringify(nsfwgrp))
                client.reply(from, `NSFW is now registered on *${name}*`, message.id)
             }
             break
        case 'deact':
             arg = body.trim().split(' ')
             if (!isGroupAdmins) return client.reply(from, 'Only Admins can use this command', id)
             if (arg[1] == 'welcome') {
                let inx = ban.indexOf(from)
                wel.splice(inx, 1)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(wel))
                client.reply(from, `Welcome is now unregistered on *${name}*`, message.id)
             } else if (arg[1] == 'nsfw') {
                let inx = ban.indexOf(from)
                nsfwgrp.splice(inx, 1)
                fs.writeFileSync('./lib/nsfw.json', JSON.stringify(nsfwgrp))
                client.reply(from, `NSFW is now unregistered on *${name}*`, message.id)
             }
            break
       case 'cgc':
            arg = body.trim().split(' ')
            const gcname = arg[1]
            client.createGroup(gcname, mentionedJidList)
            client.sendText(from, 'Group Created ✨️')
            break
       
        case 'sr':
             arg = body.trim().split(' ')
             const sr = arg[1]
             try {
             const response1 = await axios.get('https://meme-api.herokuapp.com/gimme/' + sr + '/');
             const {
                    postLink,
                    title,
                    subreddit,
                    url,
                    nsfw,
                    spoiler
                } = response1.data

                const isnsfw = nsfwgrp.includes(from)
                if (nsfw == true) {
                      if ((isGroupMsg) && (isnsfw)) {
                                await client.sendFileFromUrl(from, `${url}`, 'Reddit.jpg', `${title}` + '\n\nPostlink:' + `${postLink}`)
                      } else if ((isGroupMsg) && (!isnsfw)) {
                                await client.reply(from, `NSFW is not registered on *${name}*`, id)
                      }
                } else { 
                      await client.sendFileFromUrl(from, `${url}`, 'Reddit.jpg', `${title}` + '\n\nPostlink:' + `${postLink}`)
                }
                } catch(err) {
                    console.log(err)
                    await client.reply(from, 'There is no such subreddit, Baka!', id) 
                }
                break
        case 'unban':
            if(!isowner) return client.reply(from, 'Only bot admins can use this CMD', message.id)
            let inx = ban.indexOf(mentionedJidList[0])
            ban.splice(inx, 1)
            fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
            client.reply(from, 'Unbanned User!', message.id)
            break
        case 'kick':
            if(!isGroupMsg) return client.reply(from, '...', message.id)
            if(!isGroupAdmins) return client.reply(from, 'You are not an admin, Sorry', message.id)
            if(!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
            if(mentionedJidList.length === 0) return client.reply(from, 'Wrong format', message.id)
            await client.sendText(from, `Request Accepted! issued:\n${mentionedJidList.join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.reply(from, '....', message.id)
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'delete':
            if (!isGroupAdmins) return client.reply(from, 'Only admins can use this command', id)
            if (!quotedMsg) return client.reply(from, 'Wrong Format!', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Wrong Format!', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'leave':
            if(!isGroupMsg) return client.reply(from, '...', message.id)
            if(!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
            await client.sendText(from,'Sayonara').then(() => client.leaveGroup(groupId))
            break
        case 'promote':
            if(!isGroupMsg) return client.reply(from, '.', message.id)
            if(!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
            if(!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
            if (mentionedJidList.length === 0) return await client.reply(from, 'Wrong format!', message.id)
            if (mentionedJidList.length >= 2) return await client.reply(from, 'One user at a time', message.id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'This user is already admin', message.id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `@${mentionedJidList[0].replace('@c.us', '')} is now an admin`)
            break
        case 'demote':
            if(!isGroupAdmins) return client.reply(from, 'You are not an admin', message.id)
            if(!isBotGroupAdmins) return client.reply(from, 'You need to make me admin to use this CMD', message.id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Wrong Format', message.id)
            if (mentionedJidList.length >= 2) return await client.reply(from, 'One user at a time', message.id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'The user isn\'t an admin', message.id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Demoted @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'join':
            if (args.length == 0) return client.reply(from, 'Wrong Format', message.id)
            const link = body.slice(6)
            const minMem = 30
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await client.inviteInfo(link)
            if (!isLink) return client.reply(from, 'Mana link nya?', message.id)
            if (check.size < minMem) return client.reply(from, 'Member grup nya gasampe 30+!', message.id)
            await client.joinGroupViaLink(link).then( async () => {
                await client.reply(from, '*Joined* ✨️', message.id)
            }).catch(error => {
                client.reply(from, 'An error occured 💔️', message.id)
            })
            break
        case 'sauce':
            if (isMedia) {
            const mediaData = await decryptMedia(message)
            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
             try {
                const raw = await fetch("https://trace.moe/api/search", {
                method: "POST",
                body: JSON.stringify({ image: imageBase64 }),
                headers: { "Content-Type": "application/json" }
                })
                const parsedResult = await raw.json()
                const { anime, episode, title_english } = parsedResult.docs[0]
                const content = `*Ketemu ni!* \n⛩️ *Judul Bahasa Jepang:* ${anime} \n✨️ *Judul Bahasa Inggris:* ${title_english} \n *Source Episode:* ${episode} `
                await client.sendImage(from, imageBase64, 'sauce.png', content, id)
                console.log("Sent!")
             } catch (err) {
                await client.sendFileFromUrl(from, errorurl, 'error.png', '💔️ An Error Occured', id)
             }
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                try {
                 const raw = await fetch("https://trace.moe/api/search", {
                 method: "POST",
                 body: JSON.stringify({ image: imageBase64 }),
                 headers: { "Content-Type": "application/json" }
                 })
                 const parsedResult = await raw.json()
                 const { anime, episode, title_english } = parsedResult.docs[0]
                 const content = `*Ketemu ni!* \n⛩️ *Judul Bahasa Jepang:* ${anime} \n✨️ *Judul Bahasa Inggris: ${title_english} \n *Source Episode:* ${episode} `
                 await client.sendImage(from, imageBase64, 'sauce.png', content, id)
                 console.log("Sent!")
               } catch (err) {
                 throw new Error(err.message)
                 await client.sendFileFromUrl(from, errorurl, 'error.png', '💔️ An Error Occured', id)
               }
            }
            break
        case 'lyrics':
            if (args.length == 0) return client.reply(from, 'Wrong Format', message.id)
            const lagu = body.slice(7)
            console.log(lagu)
            const lirik = await liriklagu(lagu)
            client.sendText(from, lirik)
            break
        case 'anime':
            const keyword = message.body.replace('#anime', '')
            try {
            const data = await fetch(
           `https://api.jikan.moe/v3/search/anime?q=${keyword}`
            )
            const parsed = await data.json()
            if (!parsed) {
              await client.sendFileFromUrl(from, errorurl2, 'error.png', 'anime gaketemu cok!', id)
              console.log("Sent!")
              return null
              }
            const { title, synopsis, episodes, url, rated, score, image_url } = parsed.results[0]
            const content = `*Ketemu ni!*
> *Judul:* ${title}

> *Episodes:* ${episodes}

> *Rating:* ${rated}

> *Score:* ${score}

> *Sinopsis:* ${synopsis}

> *URL*: ${url}`

            const image = await bent("buffer")(image_url)
            const base64 = `data:image/jpg;base64,${image.toString("base64")}`
            client.sendImage(from, base64, title, content)
           } catch (err) {
             console.error(err.message)
             await client.sendFileFromUrl(from, errorurl2, 'error.png', 'anime gaketemu cok!')
           }
          break
        case 'wallpaper':
            if (args.length == 0) return client.reply(from, 'Format Salah!', id)
            const query = body.slice(6)
            const walls = await wall(query)
            console.log(walls)
            await client.sendFileFromUrl(from, walls, 'walls.jpg', '', id)
            break
        case 'waifu': 
            const data = fs.readFileSync('./lib/waifu.json')
            const dataJson = JSON.parse(data)
            const randIndex = Math.floor(Math.random() * dataJson.length)
            const randKey = dataJson[randIndex]
            client.sendFileFromUrl(from, randKey.image, 'Waifu.jpg', randKey.teks, id)
            break
        case 'animeneko':
            client.sendFileFromUrl(from, akaneko.neko(), 'neko.jpg', 'Neko *Nyaa*~')
            break
        case 'doggo':
            const list = ["https://cdn.shibe.online/shibes/247d0ac978c9de9d9b66d72dbdc65f2dac64781d.jpg","https://cdn.shibe.online/shibes/1cf322acb7d74308995b04ea5eae7b520e0eae76.jpg","https://cdn.shibe.online/shibes/1ce955c3e49ae437dab68c09cf45297d68773adf.jpg","https://cdn.shibe.online/shibes/ec02bee661a797518d37098ab9ad0c02da0b05c3.jpg","https://cdn.shibe.online/shibes/1e6102253b51fbc116b887e3d3cde7b5c5083542.jpg","https://cdn.shibe.online/shibes/f0c07a7205d95577861eee382b4c8899ac620351.jpg","https://cdn.shibe.online/shibes/3eaf3b7427e2d375f09fc883f94fa8a6d4178a0a.jpg","https://cdn.shibe.online/shibes/c8b9fcfde23aee8d179c4c6f34d34fa41dfaffbf.jpg","https://cdn.shibe.online/shibes/55f298bc16017ed0aeae952031f0972b31c959cb.jpg","https://cdn.shibe.online/shibes/2d5dfe2b0170d5de6c8bc8a24b8ad72449fbf6f6.jpg","https://cdn.shibe.online/shibes/e9437de45e7cddd7d6c13299255e06f0f1d40918.jpg","https://cdn.shibe.online/shibes/6c32141a0d5d089971d99e51fd74207ff10751e7.jpg","https://cdn.shibe.online/shibes/028056c9f23ff40bc749a95cc7da7a4bb734e908.jpg","https://cdn.shibe.online/shibes/4fb0c8b74dbc7653e75ec1da597f0e7ac95fe788.jpg","https://cdn.shibe.online/shibes/125563d2ab4e520aaf27214483e765db9147dcb3.jpg","https://cdn.shibe.online/shibes/ea5258fad62cebe1fedcd8ec95776d6a9447698c.jpg","https://cdn.shibe.online/shibes/5ef2c83c2917e2f944910cb4a9a9b441d135f875.jpg","https://cdn.shibe.online/shibes/6d124364f02944300ae4f927b181733390edf64e.jpg","https://cdn.shibe.online/shibes/92213f0c406787acd4be252edb5e27c7e4f7a430.jpg","https://cdn.shibe.online/shibes/40fda0fd3d329be0d92dd7e436faa80db13c5017.jpg","https://cdn.shibe.online/shibes/e5c085fc427528fee7d4c3935ff4cd79af834a82.jpg","https://cdn.shibe.online/shibes/f83fa32c0da893163321b5cccab024172ddbade1.jpg","https://cdn.shibe.online/shibes/4aa2459b7f411919bf8df1991fa114e47b802957.jpg","https://cdn.shibe.online/shibes/2ef54e174f13e6aa21bb8be3c7aec2fdac6a442f.jpg","https://cdn.shibe.online/shibes/fa97547e670f23440608f333f8ec382a75ba5d94.jpg","https://cdn.shibe.online/shibes/fb1b7150ed8eb4ffa3b0e61ba47546dd6ee7d0dc.jpg","https://cdn.shibe.online/shibes/abf9fb41d914140a75d8bf8e05e4049e0a966c68.jpg","https://cdn.shibe.online/shibes/f63e3abe54c71cc0d0c567ebe8bce198589ae145.jpg","https://cdn.shibe.online/shibes/4c27b7b2395a5d051b00691cc4195ef286abf9e1.jpg","https://cdn.shibe.online/shibes/00df02e302eac0676bb03f41f4adf2b32418bac8.jpg","https://cdn.shibe.online/shibes/4deaac9baec39e8a93889a84257338ebb89eca50.jpg","https://cdn.shibe.online/shibes/199f8513d34901b0b20a33758e6ee2d768634ebb.jpg","https://cdn.shibe.online/shibes/f3efbf7a77e5797a72997869e8e2eaa9efcdceb5.jpg","https://cdn.shibe.online/shibes/39a20ccc9cdc17ea27f08643b019734453016e68.jpg","https://cdn.shibe.online/shibes/e67dea458b62cf3daa4b1e2b53a25405760af478.jpg","https://cdn.shibe.online/shibes/0a892f6554c18c8bcdab4ef7adec1387c76c6812.jpg","https://cdn.shibe.online/shibes/1b479987674c9b503f32e96e3a6aeca350a07ade.jpg","https://cdn.shibe.online/shibes/0c80fc00d82e09d593669d7cce9e273024ba7db9.jpg","https://cdn.shibe.online/shibes/bbc066183e87457b3143f71121fc9eebc40bf054.jpg","https://cdn.shibe.online/shibes/0932bf77f115057c7308ef70c3de1de7f8e7c646.jpg","https://cdn.shibe.online/shibes/9c87e6bb0f3dc938ce4c453eee176f24636440e0.jpg","https://cdn.shibe.online/shibes/0af1bcb0b13edf5e9b773e34e54dfceec8fa5849.jpg","https://cdn.shibe.online/shibes/32cf3f6eac4673d2e00f7360753c3f48ed53c650.jpg","https://cdn.shibe.online/shibes/af94d8eeb0f06a0fa06f090f404e3bbe86967949.jpg","https://cdn.shibe.online/shibes/4b55e826553b173c04c6f17aca8b0d2042d309fb.jpg","https://cdn.shibe.online/shibes/a0e53593393b6c724956f9abe0abb112f7506b7b.jpg","https://cdn.shibe.online/shibes/7eba25846f69b01ec04de1cae9fed4b45c203e87.jpg","https://cdn.shibe.online/shibes/fec6620d74bcb17b210e2cedca72547a332030d0.jpg","https://cdn.shibe.online/shibes/26cf6be03456a2609963d8fcf52cc3746fcb222c.jpg","https://cdn.shibe.online/shibes/c41b5da03ad74b08b7919afc6caf2dd345b3e591.jpg","https://cdn.shibe.online/shibes/7a9997f817ccdabac11d1f51fac563242658d654.jpg","https://cdn.shibe.online/shibes/7221241bad7da783c3c4d84cfedbeb21b9e4deea.jpg","https://cdn.shibe.online/shibes/283829584e6425421059c57d001c91b9dc86f33b.jpg","https://cdn.shibe.online/shibes/5145c9d3c3603c9e626585cce8cffdfcac081b31.jpg","https://cdn.shibe.online/shibes/b359c891e39994af83cf45738b28e499cb8ffe74.jpg","https://cdn.shibe.online/shibes/0b77f74a5d9afaa4b5094b28a6f3ee60efcb3874.jpg","https://cdn.shibe.online/shibes/adccfdf7d4d3332186c62ed8eb254a49b889c6f9.jpg","https://cdn.shibe.online/shibes/3aac69180f777512d5dabd33b09f531b7a845331.jpg","https://cdn.shibe.online/shibes/1d25e4f592db83039585fa480676687861498db8.jpg","https://cdn.shibe.online/shibes/d8349a2436420cf5a89a0010e91bf8dfbdd9d1cc.jpg","https://cdn.shibe.online/shibes/eb465ef1906dccd215e7a243b146c19e1af66c67.jpg","https://cdn.shibe.online/shibes/3d14e3c32863195869e7a8ba22229f457780008b.jpg","https://cdn.shibe.online/shibes/79cedc1a08302056f9819f39dcdf8eb4209551a3.jpg","https://cdn.shibe.online/shibes/4440aa827f88c04baa9c946f72fc688a34173581.jpg","https://cdn.shibe.online/shibes/94ea4a2d4b9cb852e9c1ff599f6a4acfa41a0c55.jpg","https://cdn.shibe.online/shibes/f4478196e441aef0ada61bbebe96ac9a573b2e5d.jpg","https://cdn.shibe.online/shibes/96d4db7c073526a35c626fc7518800586fd4ce67.jpg","https://cdn.shibe.online/shibes/196f3ed10ee98557328c7b5db98ac4a539224927.jpg","https://cdn.shibe.online/shibes/d12b07349029ca015d555849bcbd564d8b69fdbf.jpg","https://cdn.shibe.online/shibes/80fba84353000476400a9849da045611a590c79f.jpg","https://cdn.shibe.online/shibes/94cb90933e179375608c5c58b3d8658ef136ad3c.jpg","https://cdn.shibe.online/shibes/8447e67b5d622ef0593485316b0c87940a0ef435.jpg","https://cdn.shibe.online/shibes/c39a1d83ad44d2427fc8090298c1062d1d849f7e.jpg","https://cdn.shibe.online/shibes/6f38b9b5b8dbf187f6e3313d6e7583ec3b942472.jpg","https://cdn.shibe.online/shibes/81a2cbb9a91c6b1d55dcc702cd3f9cfd9a111cae.jpg","https://cdn.shibe.online/shibes/f1f6ed56c814bd939645138b8e195ff392dfd799.jpg","https://cdn.shibe.online/shibes/204a4c43cfad1cdc1b76cccb4b9a6dcb4a5246d8.jpg","https://cdn.shibe.online/shibes/9f34919b6154a88afc7d001c9d5f79b2e465806f.jpg","https://cdn.shibe.online/shibes/6f556a64a4885186331747c432c4ef4820620d14.jpg","https://cdn.shibe.online/shibes/bbd18ae7aaf976f745bc3dff46b49641313c26a9.jpg","https://cdn.shibe.online/shibes/6a2b286a28183267fca2200d7c677eba73b1217d.jpg","https://cdn.shibe.online/shibes/06767701966ed64fa7eff2d8d9e018e9f10487ee.jpg","https://cdn.shibe.online/shibes/7aafa4880b15b8f75d916b31485458b4a8d96815.jpg","https://cdn.shibe.online/shibes/b501169755bcf5c1eca874ab116a2802b6e51a2e.jpg","https://cdn.shibe.online/shibes/a8989bad101f35cf94213f17968c33c3031c16fc.jpg","https://cdn.shibe.online/shibes/f5d78feb3baa0835056f15ff9ced8e3c32bb07e8.jpg","https://cdn.shibe.online/shibes/75db0c76e86fbcf81d3946104c619a7950e62783.jpg","https://cdn.shibe.online/shibes/8ac387d1b252595bbd0723a1995f17405386b794.jpg","https://cdn.shibe.online/shibes/4379491ef4662faa178f791cc592b52653fb24b3.jpg","https://cdn.shibe.online/shibes/4caeee5f80add8c3db9990663a356e4eec12fc0a.jpg","https://cdn.shibe.online/shibes/99ef30ea8bb6064129da36e5673649e957cc76c0.jpg","https://cdn.shibe.online/shibes/aeac6a5b0a07a00fba0ba953af27734d2361fc10.jpg","https://cdn.shibe.online/shibes/9a217cfa377cc50dd8465d251731be05559b2142.jpg","https://cdn.shibe.online/shibes/65f6047d8e1d247af353532db018b08a928fd62a.jpg","https://cdn.shibe.online/shibes/fcead395cbf330b02978f9463ac125074ac87ab4.jpg","https://cdn.shibe.online/shibes/79451dc808a3a73f99c339f485c2bde833380af0.jpg","https://cdn.shibe.online/shibes/bedf90869797983017f764165a5d97a630b7054b.jpg","https://cdn.shibe.online/shibes/dd20e5801badd797513729a3645c502ae4629247.jpg","https://cdn.shibe.online/shibes/88361ee50b544cb1623cb259bcf07b9850183e65.jpg","https://cdn.shibe.online/shibes/0ebcfd98e8aa61c048968cb37f66a2b5d9d54d4b.jpg"]
            let kya = list[Math.floor(Math.random() * list.length)]
            client.sendFileFromUrl(from, kya, 'Dog.jpeg', 'Doggo ✨️', id)
            break
        case 'neko':          
            q2 = Math.floor(Math.random() * 900) + 300;
            q3 = Math.floor(Math.random() * 900) + 300;
            client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'neko.png','Neko 🌠️', id)
            break
        case 'roll':
            const dice = Math.floor(Math.random() * 6) + 1
            await client.sendStickerfromUrl(from, 'https://www.random.org/dice/dice' + dice + '.png')
            break
        case 'flip':
            const side = Math.floor(Math.random() * 2) + 1
            if (side == 1) {
               client.sendStickerfromUrl(from, 'https://i.ibb.co/LJjkVK5/heads.png')
            } else {
               client.sendStickerfromUrl(from, 'https://i.ibb.co/wNnZ4QD/tails.png')
            }
            break
        case 'slap':
            arg = body.trim().split(' ')
            const person = author.replace('@c.us', '')
            await client.sendGiphyAsSticker(from, 'https://media.giphy.com/media/S8507sBJm1598XnsgD/source.gif')
            client.sendTextWithMentions(from, '@' + person + ' *slapped* ' + arg[1])
            break
        case 'pokemon':
            q7 = Math.floor(Math.random() * 890) + 1;
            client.sendFileFromUrl(from, 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'+q7+'.png','Pokemon.png','.', id)
            break
        case 'rpaper' :
            const walnime = ['https://cdn.nekos.life/wallpaper/QwGLg4oFkfY.png','https://cdn.nekos.life/wallpaper/bUzSjcYxZxQ.jpg','https://cdn.nekos.life/wallpaper/j49zxzaUcjQ.jpg','https://cdn.nekos.life/wallpaper/YLTH5KuvGX8.png','https://cdn.nekos.life/wallpaper/Xi6Edg133m8.jpg','https://cdn.nekos.life/wallpaper/qvahUaFIgUY.png','https://cdn.nekos.life/wallpaper/leC8q3u8BSk.jpg','https://cdn.nekos.life/wallpaper/tSUw8s04Zy0.jpg','https://cdn.nekos.life/wallpaper/sqsj3sS6EJE.png','https://cdn.nekos.life/wallpaper/HmjdX_s4PU4.png','https://cdn.nekos.life/wallpaper/Oe2lKgLqEXY.jpg','https://cdn.nekos.life/wallpaper/GTwbUYI-xTc.jpg','https://cdn.nekos.life/wallpaper/nn_nA8wTeP0.png','https://cdn.nekos.life/wallpaper/Q63o6v-UUa8.png','https://cdn.nekos.life/wallpaper/ZXLFm05K16Q.jpg','https://cdn.nekos.life/wallpaper/cwl_1tuUPuQ.png','https://cdn.nekos.life/wallpaper/wWhtfdbfAgM.jpg','https://cdn.nekos.life/wallpaper/3pj0Xy84cPg.jpg','https://cdn.nekos.life/wallpaper/sBoo8_j3fkI.jpg','https://cdn.nekos.life/wallpaper/gCUl_TVizsY.png','https://cdn.nekos.life/wallpaper/LmTi1k9REW8.jpg','https://cdn.nekos.life/wallpaper/sbq_4WW2PUM.jpg','https://cdn.nekos.life/wallpaper/QOSUXEbzDQA.png','https://cdn.nekos.life/wallpaper/khaqGIHsiqk.jpg','https://cdn.nekos.life/wallpaper/iFtEXugqQgA.png','https://cdn.nekos.life/wallpaper/deFKIDdRe1I.jpg','https://cdn.nekos.life/wallpaper/OHZVtvDm0gk.jpg','https://cdn.nekos.life/wallpaper/YZYa00Hp2mk.jpg','https://cdn.nekos.life/wallpaper/R8nPIKQKo9g.png','https://cdn.nekos.life/wallpaper/_brn3qpRBEE.jpg','https://cdn.nekos.life/wallpaper/ADTEQdaHhFI.png','https://cdn.nekos.life/wallpaper/MGvWl6om-Fw.jpg','https://cdn.nekos.life/wallpaper/YGmpjZW3AoQ.jpg','https://cdn.nekos.life/wallpaper/hNCgoY-mQPI.jpg','https://cdn.nekos.life/wallpaper/3db40hylKs8.png','https://cdn.nekos.life/wallpaper/iQ2FSo5nCF8.jpg','https://cdn.nekos.life/wallpaper/meaSEfeq9QM.png','https://cdn.nekos.life/wallpaper/CmEmn79xnZU.jpg','https://cdn.nekos.life/wallpaper/MAL18nB-yBI.jpg','https://cdn.nekos.life/wallpaper/FUuBi2xODuI.jpg','https://cdn.nekos.life/wallpaper/ez-vNNuk6Ck.jpg','https://cdn.nekos.life/wallpaper/K4-z0Bc0Vpc.jpg','https://cdn.nekos.life/wallpaper/Y4JMbswrNg8.jpg','https://cdn.nekos.life/wallpaper/ffbPXIxt4-0.png','https://cdn.nekos.life/wallpaper/x63h_W8KFL8.jpg','https://cdn.nekos.life/wallpaper/lktzjDRhWyg.jpg','https://cdn.nekos.life/wallpaper/j7oQtvRZBOI.jpg','https://cdn.nekos.life/wallpaper/MQQEAD7TUpQ.png','https://cdn.nekos.life/wallpaper/lEG1-Eeva6Y.png','https://cdn.nekos.life/wallpaper/Loh5wf0O5Aw.png','https://cdn.nekos.life/wallpaper/yO6ioREenLA.png','https://cdn.nekos.life/wallpaper/4vKWTVgMNDc.jpg','https://cdn.nekos.life/wallpaper/Yk22OErU8eg.png','https://cdn.nekos.life/wallpaper/Y5uf1hsnufE.png','https://cdn.nekos.life/wallpaper/xAmBpMUd2Zw.jpg','https://cdn.nekos.life/wallpaper/f_RWFoWciRE.jpg','https://cdn.nekos.life/wallpaper/Y9qjP2Y__PA.jpg','https://cdn.nekos.life/wallpaper/eqEzgohpPwc.jpg','https://cdn.nekos.life/wallpaper/s1MBos_ZGWo.jpg','https://cdn.nekos.life/wallpaper/PtW0or_Pa9c.png','https://cdn.nekos.life/wallpaper/32EAswpy3M8.png','https://cdn.nekos.life/wallpaper/Z6eJZf5xhcE.png','https://cdn.nekos.life/wallpaper/xdiSF731IFY.jpg','https://cdn.nekos.life/wallpaper/Y9r9trNYadY.png','https://cdn.nekos.life/wallpaper/8bH8CXn-sOg.jpg','https://cdn.nekos.life/wallpaper/a02DmIFzRBE.png','https://cdn.nekos.life/wallpaper/MnrbXcPa7Oo.png','https://cdn.nekos.life/wallpaper/s1Tc9xnugDk.jpg','https://cdn.nekos.life/wallpaper/zRqEx2gnfmg.jpg','https://cdn.nekos.life/wallpaper/PtW0or_Pa9c.png','https://cdn.nekos.life/wallpaper/0ECCRW9soHM.jpg','https://cdn.nekos.life/wallpaper/kAw8QHl_wbM.jpg','https://cdn.nekos.life/wallpaper/ZXcaFmpOlLk.jpg','https://cdn.nekos.life/wallpaper/WVEdi9Ng8UE.png','https://cdn.nekos.life/wallpaper/IRu29rNgcYU.png','https://cdn.nekos.life/wallpaper/LgIJ_1AL3rM.jpg','https://cdn.nekos.life/wallpaper/DVD5_fLJEZA.jpg','https://cdn.nekos.life/wallpaper/siqOQ7k8qqk.jpg','https://cdn.nekos.life/wallpaper/CXNX_15eGEQ.png','https://cdn.nekos.life/wallpaper/s62tGjOTHnk.jpg','https://cdn.nekos.life/wallpaper/tmQ5ce6EfJE.png','https://cdn.nekos.life/wallpaper/Zju7qlBMcQ4.jpg','https://cdn.nekos.life/wallpaper/CPOc_bMAh2Q.png','https://cdn.nekos.life/wallpaper/Ew57S1KtqsY.jpg','https://cdn.nekos.life/wallpaper/hVpFbYJmZZc.jpg','https://cdn.nekos.life/wallpaper/sb9_J28pftY.jpg','https://cdn.nekos.life/wallpaper/JDoIi_IOB04.jpg','https://cdn.nekos.life/wallpaper/rG76AaUZXzk.jpg','https://cdn.nekos.life/wallpaper/9ru2luBo360.png','https://cdn.nekos.life/wallpaper/ghCgiWFxGwY.png','https://cdn.nekos.life/wallpaper/OSR-i-Rh7ZY.png','https://cdn.nekos.life/wallpaper/65VgtPyweCc.jpg','https://cdn.nekos.life/wallpaper/3vn-0FkNSbM.jpg','https://cdn.nekos.life/wallpaper/u02Y0-AJPL0.jpg','https://cdn.nekos.life/wallpaper/_-Z-0fGflRc.jpg','https://cdn.nekos.life/wallpaper/3VjNKqEPp58.jpg','https://cdn.nekos.life/wallpaper/NoG4lKnk6Sc.jpg','https://cdn.nekos.life/wallpaper/xiTxgRMA_IA.jpg','https://cdn.nekos.life/wallpaper/yq1ZswdOGpg.png','https://cdn.nekos.life/wallpaper/4SUxw4M3UMA.png','https://cdn.nekos.life/wallpaper/cUPnQOHNLg0.jpg','https://cdn.nekos.life/wallpaper/zczjuLWRisA.jpg','https://cdn.nekos.life/wallpaper/TcxvU_diaC0.png','https://cdn.nekos.life/wallpaper/7qqWhEF_uoY.jpg','https://cdn.nekos.life/wallpaper/J4t_7DvoUZw.jpg','https://cdn.nekos.life/wallpaper/xQ1Pg5D6J4U.jpg','https://cdn.nekos.life/wallpaper/aIMK5Ir4xho.jpg','https://cdn.nekos.life/wallpaper/6gneEXrNAWU.jpg','https://cdn.nekos.life/wallpaper/PSvNdoISWF8.jpg','https://cdn.nekos.life/wallpaper/SjgF2-iOmV8.jpg','https://cdn.nekos.life/wallpaper/vU54ikOVY98.jpg','https://cdn.nekos.life/wallpaper/QjnfRwkRU-Q.jpg','https://cdn.nekos.life/wallpaper/uSKqzz6ZdXc.png','https://cdn.nekos.life/wallpaper/AMrcxZOnVBE.jpg','https://cdn.nekos.life/wallpaper/N1l8SCMxamE.jpg','https://cdn.nekos.life/wallpaper/n2cBaTo-J50.png','https://cdn.nekos.life/wallpaper/ZXcaFmpOlLk.jpg','https://cdn.nekos.life/wallpaper/7bwxy3elI7o.png','https://cdn.nekos.life/wallpaper/7VW4HwF6LcM.jpg','https://cdn.nekos.life/wallpaper/YtrPAWul1Ug.png','https://cdn.nekos.life/wallpaper/1p4_Mmq95Ro.jpg','https://cdn.nekos.life/wallpaper/EY5qz5iebJw.png','https://cdn.nekos.life/wallpaper/aVDS6iEAIfw.jpg','https://cdn.nekos.life/wallpaper/veg_xpHQfjE.jpg','https://cdn.nekos.life/wallpaper/meaSEfeq9QM.png','https://cdn.nekos.life/wallpaper/Xa_GtsKsy-s.png','https://cdn.nekos.life/wallpaper/6Bx8R6D75eM.png','https://cdn.nekos.life/wallpaper/zXOGXH_b8VY.png','https://cdn.nekos.life/wallpaper/VQcviMxoQ00.png','https://cdn.nekos.life/wallpaper/CJnRl-PKWe8.png','https://cdn.nekos.life/wallpaper/zEWYfFL_Ero.png','https://cdn.nekos.life/wallpaper/_C9Uc5MPaz4.png','https://cdn.nekos.life/wallpaper/zskxNqNXyG0.jpg','https://cdn.nekos.life/wallpaper/g7w14PjzzcQ.jpg','https://cdn.nekos.life/wallpaper/KavYXR_GRB4.jpg','https://cdn.nekos.life/wallpaper/Z_r9WItzJBc.jpg','https://cdn.nekos.life/wallpaper/Qps-0JD6834.jpg','https://cdn.nekos.life/wallpaper/Ri3CiJIJ6M8.png','https://cdn.nekos.life/wallpaper/ArGYIpJwehY.jpg','https://cdn.nekos.life/wallpaper/uqYKeYM5h8w.jpg','https://cdn.nekos.life/wallpaper/h9cahfuKsRg.jpg','https://cdn.nekos.life/wallpaper/iNPWKO8d2a4.jpg','https://cdn.nekos.life/wallpaper/j2KoFVhsNig.jpg','https://cdn.nekos.life/wallpaper/z5Nc-aS6QJ4.jpg','https://cdn.nekos.life/wallpaper/VUFoK8l1qs0.png','https://cdn.nekos.life/wallpaper/rQ8eYh5mXN8.png','https://cdn.nekos.life/wallpaper/D3NxNISDavQ.png','https://cdn.nekos.life/wallpaper/Z_CiozIenrU.jpg','https://cdn.nekos.life/wallpaper/np8rpfZflWE.jpg','https://cdn.nekos.life/wallpaper/ED-fgS09gik.jpg','https://cdn.nekos.life/wallpaper/AB0Cwfs1X2w.jpg','https://cdn.nekos.life/wallpaper/DZBcYfHouiI.jpg','https://cdn.nekos.life/wallpaper/lC7pB-GRAcQ.png','https://cdn.nekos.life/wallpaper/zrI-sBSt2zE.png','https://cdn.nekos.life/wallpaper/_RJhylwaCLk.jpg','https://cdn.nekos.life/wallpaper/6km5m_GGIuw.png','https://cdn.nekos.life/wallpaper/3db40hylKs8.png','https://cdn.nekos.life/wallpaper/oggceF06ONQ.jpg','https://cdn.nekos.life/wallpaper/ELdH2W5pQGo.jpg','https://cdn.nekos.life/wallpaper/Zun_n5pTMRE.png','https://cdn.nekos.life/wallpaper/VqhFKG5U15c.png','https://cdn.nekos.life/wallpaper/NsMoiW8JZ60.jpg','https://cdn.nekos.life/wallpaper/XE4iXbw__Us.png','https://cdn.nekos.life/wallpaper/a9yXhS2zbhU.jpg','https://cdn.nekos.life/wallpaper/jjnd31_3Ic8.jpg','https://cdn.nekos.life/wallpaper/Nxanxa-xO3s.png','https://cdn.nekos.life/wallpaper/dBHlPcbuDc4.jpg','https://cdn.nekos.life/wallpaper/6wUZIavGVQU.jpg','https://cdn.nekos.life/wallpaper/_-Z-0fGflRc.jpg','https://cdn.nekos.life/wallpaper/H9OUpIrF4gU.jpg','https://cdn.nekos.life/wallpaper/xlRdH3fBMz4.jpg','https://cdn.nekos.life/wallpaper/7IzUIeaae9o.jpg','https://cdn.nekos.life/wallpaper/FZCVL6PyWq0.jpg','https://cdn.nekos.life/wallpaper/5dG-HH6d0yw.png','https://cdn.nekos.life/wallpaper/ddxyA37HiwE.png','https://cdn.nekos.life/wallpaper/I0oj_jdCD4k.jpg','https://cdn.nekos.life/wallpaper/ABchTV97_Ts.png','https://cdn.nekos.life/wallpaper/58C37kkq39Y.png','https://cdn.nekos.life/wallpaper/HMS5mK7WSGA.jpg','https://cdn.nekos.life/wallpaper/1O3Yul9ojS8.jpg','https://cdn.nekos.life/wallpaper/hdZI1XsYWYY.jpg','https://cdn.nekos.life/wallpaper/h8pAJJnBXZo.png','https://cdn.nekos.life/wallpaper/apO9K9JIUp8.jpg','https://cdn.nekos.life/wallpaper/p8f8IY_2mwg.jpg','https://cdn.nekos.life/wallpaper/HY1WIB2r_cE.jpg','https://cdn.nekos.life/wallpaper/u02Y0-AJPL0.jpg','https://cdn.nekos.life/wallpaper/jzN74LcnwE8.png','https://cdn.nekos.life/wallpaper/IeAXo5nJhjw.jpg','https://cdn.nekos.life/wallpaper/7lgPyU5fuLY.jpg','https://cdn.nekos.life/wallpaper/f8SkRWzXVxk.png','https://cdn.nekos.life/wallpaper/ZmDTpGGeMR8.jpg','https://cdn.nekos.life/wallpaper/AMrcxZOnVBE.jpg','https://cdn.nekos.life/wallpaper/ZhP-f8Icmjs.jpg','https://cdn.nekos.life/wallpaper/7FyUHX3fE2o.jpg','https://cdn.nekos.life/wallpaper/CZoSLK-5ng8.png','https://cdn.nekos.life/wallpaper/pSNDyxP8l3c.png','https://cdn.nekos.life/wallpaper/AhYGHF6Fpck.jpg','https://cdn.nekos.life/wallpaper/ic6xRRptRes.jpg','https://cdn.nekos.life/wallpaper/89MQq6KaggI.png','https://cdn.nekos.life/wallpaper/y1DlFeHHTEE.png']
            let walnimek = walnime[Math.floor(Math.random() * walnime.length)]
            client.sendFileFromUrl(from, walnimek, 'Nimek.jpg', '', message.id)
            break
        case 'meme':
            const response = await axios.get('https://meme-api.herokuapp.com/gimme/wholesomeanimemes');
            const { postlink, title, subreddit, url, nsfw, spoiler } = response.data
            await client.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
            break
        case 'help':
            client.reply(from, help.replace(undefined, pushname), message.id)
            break
        case 'info':
            client.reply(from, info, id)
            break
        case 'profile':
            var role = 'None'
            if (isGroupMsg) {
              if (!quotedMsg) {
              var block = ban.includes(author)
              var pic = await client.getProfilePicFromServer(author)
              var namae = pushname
              var sts = await client.getStatus(author)
              var adm = isGroupAdmins
              const { status } = sts
               if (pic == undefined) {
               var pfp = errorurl 
               } else {
               var pfp = pic
               } 
             await client.sendFileFromUrl(from, pfp, 'pfp.jpg', `*User Profile* ✨️ \n\n 🔖️ *Username: ${namae}*\n\n💌️ *User Info: ${status}*\n\n*💔️ Ban: ${block}*\n\n✨️ *Role: ${role}*\n\n 👑️ *Admin: ${adm}*`)
             } else if (quotedMsg) {
             var qmid = quotedMsgObj.sender.id
             var block = ban.includes(qmid)
             var pic = await client.getProfilePicFromServer(qmid)
             var namae = quotedMsgObj.sender.name
             var sts = await client.getStatus(qmid)
             var adm = isGroupAdmins
             const { status } = sts
              if (pic == undefined) {
              var pfp = errorurl 
              } else {
              var pfp = pic
              } 
             await client.sendFileFromUrl(from, pfp, 'pfo.jpg', `*User Profile* ✨️ \n\n 🔖️ *Username: ${namae}*\n💌️ *User Info: ${status}*\n*💔️ Ban: ${block}*\n✨️ *Role: ${role}*\n 👑️ *Admin: ${adm}*`)
             }
            }
            break
        case 'snk':
            client.reply(from, snk, message.id)
        default:
            console.log(color('[UNLISTED]', 'red'), color(time, 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
