const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const Docxtemplater = require('docxtemplater');
const readFileAsync = promisify(fs.readFile);

/**
 * 索引单个文件
 * @param {string} filePath 文件路径
 * @returns {Promise<object|null>} 索引结果对象或者null（如果出现错误）
 */
async function indexFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const lines = content.split('\n').map((line, index) => ({ lineNumber: index + 1, content: line }));
    return { filePath, lines };
  } catch (error) {
    console.error(`索引文件时发生错误：${filePath}`, error);
    return null;
  }
}

/**
 * 索引目录下的所有文件
 * @param {string} directoryPath 目录路径
 * @returns {Promise<Array<object>>} 索引结果对象数组
 */
async function indexFiles(directoryPath) {
  const files = await readDirectory(directoryPath);
  const indexedFiles = [];

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const indexedFile = await indexFile(filePath);

    if (indexedFile) {
      indexedFiles.push(indexedFile);
    }
  }

  return indexedFiles;
}

/**
 * 读取目录下的所有文件
 * @param {string} directoryPath 目录路径
 * @returns {Promise<Array<string>>} 文件名数组
 */
async function readDirectory(directoryPath) {
  try {
    const files = await promisify(fs.readdir)(directoryPath);
    return files.filter(file => isSupportedFile(file));
  } catch (error) {
    console.error(`读取目录时发生错误：${directoryPath}`, error);
    return [];
  }
}

/**
 * 判断文件是否为支持的文件类型
 * @param {string} file 文件名
 * @returns {boolean} 是否为支持的文件类型
 */
function isSupportedFile(file) {
  const supportedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file);
  return supportedExtensions.includes(fileExtension);
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
