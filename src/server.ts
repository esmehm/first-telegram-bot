import e from 'express';
import { Telegraf } from 'telegraf'
import getBotTokenOrQuit from './util/getBotToken';
import { pickRandom } from './util/random';
const fetch = require('node-fetch');

const botToken = getBotTokenOrQuit();

const bot = new Telegraf(botToken)

bot.start((ctx) => ctx.reply("Hello!  Let's talk!"))
bot.help((ctx) => ctx.reply('Hmm i am not programmed to be helpful, yet!'))
bot.hears('hello', (ctx) => ctx.reply('Ok, I heard you say hello'))
bot.command('sing', (ctx) => ctx.reply('La la la!  I got your command.'))
bot.command('time', (ctx) => {
    const date = new Date();
    ctx.reply(`The time is ${date.toUTCString()}`)
})
bot.command('fortune', async (ctx) => {
    const response = await fetch('http://yerkee.com/api/fortune')
    const body = await response.json()
    ctx.reply(`Your fortune is ${body.fortune}`)
})
bot.command('dog', async (ctx) => {
    const text = ctx.message.text
    const requestedBreed = getBreed(text) // length of dog plus 2 (for / and space)
    if (requestedBreed) {
        const response = await fetch(`https://dog.ceo/api/breed/${requestedBreed}/images`)
        if (!response.ok) {
            ctx.reply("Sorry that isn't a real breed, so here's a random dog for you")
            ctx.replyWithPhoto(await getRandomDog())
        }
        else {
            const body = await response.json()
            const photoUrls = body.message
            ctx.replyWithPhoto(pickRandom(photoUrls))
        }

    } else {
        ctx.reply("You didn't give me a breed, but here's a random dog")
        ctx.replyWithPhoto(await getRandomDog())
    }

})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

async function getRandomDog() {
    const response = await fetch('https://dog.ceo/api/breeds/image/random')
    const body = await response.json()
    const photoUrl = body.message
    return photoUrl
}

function getBreed(text: string) {
    const withoutDog = text.substring(5)
    return removeSpaces(withoutDog.toLowerCase())
}

function removeSpaces(string: string) {
    return string.replace(/\s+/g, '');
}