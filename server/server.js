// server.js

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { PDFDocument } = require('pdf-lib');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const indexPath = path.join(__dirname, 'index.json');

// 建立索引
async function buildIndex() {
  const documents = [];

  // 遍历文件夹，提取PDF和Word文件
  const folderPath = path.join(__dirname, 'documents');
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (file.endsWith('.pdf')) {
      // 解析PDF文本
      const pdf = await PDFDocument.load(fs.readFileSync(filePath));
      const pages = pdf.getPages();
      let text = '';
      for (const page of pages) {
        text += await page.getText();
      }
      documents.push({ path: filePath, text });
    } else if (file.endsWith('.docx')) {
      // 解析Word文本
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value.trim();
      documents.push({ path: filePath, text });
    }
  }

  // 建立索引
  const body = documents.flatMap(doc => [{ index: { _index: 'files' } }, doc]);
  await client.indices.create({ index: 'files' });
  await client.bulk({ refresh: true, body });

  // 保存索引到文件
  fs.writeFileSync(indexPath, JSON.stringify(documents));
}

// 加载文件夹信息
function loadDirectory(directoryPath) {
  const folderPath = path.join(__dirname, 'documents', directoryPath);
  const files = fs.readdirSync(folderPath);
  const folders = [];
  const filesList = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      folders.push({ name: file, path: `${directoryPath}/${file}` });
    } else {
      filesList.push({ name: file, path: `${directoryPath}/${file}` });
    }
  }

  return { folders, files: filesList };
}

// 获取文件信息
function getFileInfo(filePath) {
  const fileContent = fs.readFileSync(path.join(__dirname, 'documents', filePath), 'utf-8');
  return { path: filePath, content: fileContent };
}

// 检索文件
async function searchFiles(keyword, directory) {
  const { body } = await client.search({
    index: 'files',
    body: {
      query: {
        bool: {
          must: [
            { match: { text: keyword } },
            { match: { path: directory } }
          ]
        }
      }
    },
  });

  const hits = body.hits.hits;
  const results = [];
  for (const hit of hits) {
    const path = hit._source.path;
    const text = hit._source.text;
    const lines = text.split('\n');
    const matchedLines = [];
    lines.forEach((line, index) => {
      if (line.includes(keyword)) {
        // 高亮处理关键字
        const highlightedLine = line.replace(new RegExp(keyword, 'gi'), '<span class="highlight">$&</span>');
        matchedLines.push({ lineNumber: index + 1, content: highlightedLine });
      }
    });
    results.push({ path, lines: matchedLines });
  }

  return results;
}

// API路由
const router = express.Router();

// 加载根目录
router.get('/directory', (req, res) => {
  const rootDirectory = loadDirectory('');
  res.json(rootDirectory);
});

// 加载文件夹
router.get('/directory/:folderPath', (req, res) => {
  const folderPath = req.params.folderPath;
  const directory = loadDirectory(folderPath);
  res.json(directory);
});

// 搜索文件
router.post('/search', async (req, res) => {
  const keyword = req.body.keyword;
  const directory = req.body.directory;
  const results = await searchFiles(keyword, directory);
  res.json(results);
});

app.use('/api', router);

// 建立索引
buildIndex().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
