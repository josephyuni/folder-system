const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { PDFDocument } = require('pdf-lib');

// 建立索引
function indexFiles(directoryPath) {
  return new Promise((resolve, reject) => {
    readDirectory(directoryPath)
      .then(files => {
        const indexPromises = files.map(file => {
          const filePath = path.join(directoryPath, file);
          const extension = getFileExtension(file);

          if (extension === 'pdf') {
            return readPdf(filePath)
              .then(fileContents => {
                const lines = fileContents.split('\n');
                const fileIndex = lines.map((line, index) => ({
                  path: filePath,
                  lineNumber: index + 1,
                  content: line.trim()
                }));
                return fileIndex;
              });
          } else if (extension === 'docx' || extension === 'doc') {
            return readDoc(filePath)
              .then(fileContents => {
                const lines = fileContents.split('\n');
                const fileIndex = lines.map((line, index) => ({
                  path: filePath,
                  lineNumber: index + 1,
                  content: line.trim()
                }));
                return fileIndex;
              });
          }
        });

        Promise.all(indexPromises)
          .then(results => {
            const index = results.flat();
            resolve(index);
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
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
    fs.readFile(filePath, (error, fileContents) => {
      if (error) {
        reject(error);
      } else {
        const pdfDoc = PDFDocument.load(fileContents);

        const content = [];
        for (const page of pdfDoc.getPages()) {
          const text = page.getTextContent();
          text.items.forEach(item => {
            content.push(item.str);
          });
        }

        resolve(content.join(' '));
      }
    });
  });
}

// 读取DOCX和DOC文件内容
function readDoc(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'binary', (error, fileContents) => {
      if (error) {
        reject(error);
      } else {
        mammoth.extractRawText({ buffer: fileContents })
          .then(result => {
            const extractedText = result.value.trim();
            resolve(extractedText);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  });
}

module.exports = {
  indexFiles
};
