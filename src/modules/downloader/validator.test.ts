import { validateYoutubeUrl, sanitizeFilename } from './validator'

const testUrls = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', valid: true },
  { url: 'https://youtu.be/dQw4w9WgXcQ', valid: true },
  { url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ', valid: true },
  { url: 'ftp://youtube.com', valid: false },
  { url: 'not a url', valid: false },
  { url: 'https://google.com', valid: false } // Regex is loose, might match if path not checked strict, but let's see
]

const testFilenames = [
  { input: 'Hello World', expected: 'Hello World' },
  { input: 'Great Song | Official Video', expected: 'Great Song  Official Video' },
  { input: 'Slash / Backslash \\ Test', expected: 'Slash  Backslash  Test' },
  { input: 'Emoji 🎵 Test', expected: 'Emoji 🎵 Test' }, // Emojis should remain
  { input: 'Invalid: < > : " / \\ | ? *Chars', expected: 'Invalid        Chars' }
]

console.log('--- Running Validator Tests ---')
let passed = 0
let failed = 0

testUrls.forEach(({ url, valid }) => {
  const result = validateYoutubeUrl(url)
  if (result === valid) {
    console.log(`PASS: ${url} -> ${result}`)
    passed++
  } else {
    console.error(`FAIL: ${url} -> Expected ${valid}, got ${result}`)
    failed++
  }
})

console.log('\n--- Running Sanitization Tests ---')
testFilenames.forEach(({ input, expected }) => {
  const result = sanitizeFilename(input)
  if (result === expected) {
    console.log(`PASS: "${input}" -> "${result}"`)
    passed++
  } else {
    console.error(`FAIL: "${input}" -> Expected "${expected}", got "${result}"`)
    failed++
  }
})

console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`)
if (failed > 0) process.exit(1)
