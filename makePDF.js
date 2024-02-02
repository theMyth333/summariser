import * as fs from 'fs'
import * as path from 'path'
import markdownpdf from 'markdown-pdf'

const inputFolderPath = './summarised-november';
const outputFile = 'november.pdf';



function compareFn(a, b) {
  if (Number(a.split('-')[0]) < Number(b.split('-')[0])) {
    return -1;
  } else if (Number(a.split('-')[0]) > Number(b.split('-')[0])) {
    return 1;
  }
  return 0;
}

// Function to read and concatenate markdown files
const concatenateMarkdownFiles = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  let combinedMarkdown = '';
  files.sort(compareFn)

  console.log(files);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    combinedMarkdown += content + '\n\n';
  });

  return combinedMarkdown;
};

// Create a temporary markdown file
const tempMarkdownPath = 'temp.md';
const combinedMarkdown = concatenateMarkdownFiles(inputFolderPath);
fs.writeFileSync(tempMarkdownPath, combinedMarkdown, 'utf8');

markdownpdf()
  .from.string(combinedMarkdown)
  .to(outputFile, function () {
    console.log('Created', outputFile)
  })
