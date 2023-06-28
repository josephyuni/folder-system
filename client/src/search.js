const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const Docxtemplater = require('docxtemplater');

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

// 读取目录中的文件
function readDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

// 获取文件扩展名
function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}

// 读取PDF文件内容
function readPdf(filePath) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on('pdfParser_dataError', error => reject(error));
    parser.on('pdfParser_dataReady', data => {
      const pages = data.formImage.Pages;
      const content = [];

      for (const page of pages) {
        for (const text of page.Texts) {
          content.push(decodeURIComponent(text.R[0].T));
        }
      }

      resolve(content.join(' '));
    });

    parser.loadPDF(filePath);
  });
}

// 读取Docx文件内容
function readDocx(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'binary', (error, fileData) => {
      if (error) {
        reject(error);
      } else {
        const docxData = new Uint8Array(Buffer.from(fileData));
        const docx = new Docxtemplater();
        docx.loadZip(docxData);

        const extractedText = docx.getFullText().trim();
        resolve(extractedText);
      }
    });
  });
}

// 读取Doc文件内容
function readDoc(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'binary', (error, fileData) => {
      if (error) {
        reject(error);
      } else {
        const docData = new Uint8Array(Buffer.from(fileData));
        const doc = new Docxtemplater();
        doc.loadZip(docData);

        const extractedText = doc.getFullText().trim();
        resolve(extractedText);
      }
    });
  });
}

// 搜索文件内容
function searchFiles(index, keyword) {
  const results = [];

  for (const entry of index) {
    if (entry.content.includes(keyword)) {
      results.push(entry);
    }
  }

  return results;
}

// 保存搜索结果到文件
function saveResultsToFile(results) {
  let fileContent = '';

  for (const result of results) {
    fileContent += `路径：${result.path}\n`;
    fileContent += '-------------------------------\n';

    for (const line of result.lines) {
      fileContent += `行号${line.lineNumber}\t${line.content}\n`;
    }

    fileContent += '\n';
  }

  const fileName = '搜索结果.txt';

  fs.writeFile(fileName, fileContent, 'utf8', (error) => {
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
