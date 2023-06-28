const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const Docxtemplater = require('docxtemplater');
const readFileAsync = promisify(fs.readFile);

// 建立索引
async function indexFiles(directoryPath) {
  const index = [];
  const files = await readDirectory(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const extension = getFileExtension(file);

    if (extension === 'pdf') {
      const fileContents = await readPdf(filePath);
      const lines = fileContents.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        index.push({
          path: filePath,
          lineNumber: i + 1,
          content: line.trim()
        });
      }
    } else if (extension === 'docx') {
      const fileContents = await readDocx(filePath);
      const lines = fileContents.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        index.push({
          path: filePath,
          lineNumber: i + 1,
          content: line.trim()
        });
      }
    } else if (extension === 'doc') {
      const fileContents = await readDoc(filePath);
      const lines = fileContents.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        index.push({
          path: filePath,
          lineNumber: i + 1,
          content: line.trim()
        });
      }
    }
  }

  return index;
}


/**
 * 搜索文件中包含指定查询的内容
 * @param {Array<object>} files 文件对象数组
 * @param {string} query 查询关键字
 * @returns {Array<object>} 搜索结果对象数组
 */
function searchFiles(files, query) {
  const results = [];

  for (const file of files) {
    const matchedLines = file.lines.filter(line => line.content.includes(query));

    if (matchedLines.length > 0) {
      results.push({
        path: file.filePath,
        lines: matchedLines
      });
    }
  }

  return results;
}

/**
 * 将搜索结果保存到文本文件并下载
 * @param {Array<object>} results 搜索结果对象数组
 */
function saveResultsToFile(results) {
  let output = '';

  for (const result of results) {
    output += `${result.path}\n`;
    output += '-------------------------------\n';

    for (const line of result.lines) {
      output += `行号${line.lineNumber}\t${line.content}\n`;
    }

    output += '\n';
  }

  const fileName = 'search_results.txt';
  fs.writeFile(fileName, output, 'utf8', (error) => {
    if (error) {
      console.error('保存搜索结果到文件时发生错误', error);
    } else {
      console.log(`搜索结果已保存至 ${fileName}`);
    }
  });
}

module.exports = {
  indexFiles,
  searchFiles,
  saveResultsToFile
};
