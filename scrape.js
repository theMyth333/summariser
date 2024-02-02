import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as os from 'os'
import OpenAI from 'openai'

const url = 'https://www.bankersadda.com/current-affairs-16-august-2023/'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function summarise(content) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are ChatBot, a gpt-3.5-turbo-0613 model assistant by OpenAI.',
      },
      { role: 'user', content },
    ],
    model: 'gpt-3.5-turbo',
    // max_tokens: 4097
  })
  return await completion.choices[0].message.content
}

function fetchData(localDate) {
  console.log(localDate)
  axios
    .get(`https://www.bankersadda.com/current-affairs-${localDate}/`)
    .then((response) => {
      const $ = cheerio.load(response.data)
      let ulContent1 = [
        'summarise the following content under each headers with atleast 3 bullet points, without leaving key indicators like numbers, in markdown format:',
        `${os.EOL}`,
        `${os.EOL}`,
      ]
      let ulContent2 = [
        'summarise the following content under each headers with atleast 3 bullet points, without leaving key indicators like numbers, in markdown format:',
        `${os.EOL}`,
        `${os.EOL}`,
      ]
      let counter = 0
      $('p').each((index, element) => {
        if ($(element).next('ul').text()) {
          counter = counter + 1
          if (counter <= 10) {
            ulContent1.push($(element).prev().text())
            ulContent1.push($(element).next('ul').text())
          } else {
            ulContent2.push($(element).prev().text())
            ulContent2.push($(element).next('ul').text())
          }
        }
      })
      const content1 = ulContent1.join(os.EOL)
      const content2 = ulContent2.join(os.EOL)
      
      fs.writeFileSync(`temp/original-${localDate}.md`, `${content1}${os.EOL}${content2}`, 'utf-8')

      // first half
      summarise(content1)
        .then((data) => {
            fs.writeFileSync(`summarised/${localDate}-1.md`, `## ${localDate}${os.EOL}${data}`, 'utf-8')
        })
        .catch((error) => console.log(error.message))
      
      // second half
      summarise(content2)
        .then((data) => {
            fs.writeFileSync(`summarised/${localDate}-2.md`, `## ${localDate}${os.EOL}${data}`, 'utf-8')
        })
        .catch((error) => console.log(error.message))

    })
    .catch((error) => {
      console.error(`Failed to fetch the page. Error: ${error.message}`)
    })
}

function dateRangeLoop(startDate, endDate) {

  const start = new Date(startDate)
  const end = new Date(endDate)

  let currentDate = start
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const localDate = currentDate
    .toLocaleDateString('en-IN', options)
    .replace(/\s/g, '-')
    .toLowerCase()
  fetchData(localDate)

  const intervalID = setInterval(() => {
    currentDate.setDate(currentDate.getDate() + 1)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    const localDate = currentDate
      .toLocaleDateString('en-IN', options)
      .replace(/\s/g, '-')
      .toLowerCase()
    fetchData(localDate)

    if (localDate == endDate) {
      clearInterval(intervalID) // Stop the interval
      console.log(
        'Interval stopped after reaching the maximum number of iterations.'
      )
    }
  }, 61000)
}

const startDate = '2023-11-01'
const endDate = '30-november-2023'

dateRangeLoop(startDate, endDate)
