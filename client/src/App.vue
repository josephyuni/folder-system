<template>
  <div class="app">
    <div class="folder-tree">
      <h3>选择文件夹</h3>
      <input type="file" @change="selectFolder" directory webkitdirectory />
      <div class="selected-folder">{{ selectedFolder }}</div>
    </div>
    <div class="search">
      <h3>搜索</h3>
      <el-input v-model="keyword" placeholder="输入关键字"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <div class="results">
      <h3>搜索结果</h3>
      <div v-if="searchResults.length === 0">无搜索结果</div>
      <div class="result-item" v-for="(result, index) in searchResults" :key="index">
        <div class="result-path">{{ result.filePath }}</div>
        <div class="result-content">
          <div class="result-lines">
            <div class="line-number" v-for="(line, index) in result.lines" :key="index">{{ line.lineNumber }}</div>
            <div class="line-content" v-for="(line, index) in result.lines" :key="index" v-html="highlightKeyword(line.content)"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="save-results" v-if="selectedResults.length > 0">
      <h3>保存结果</h3>
      <el-button type="primary" @click="saveResults">保存结果</el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000';


export default {
  name: 'App',
  setup() {
    const selectedFolder = ref('');
    const keyword = ref('');
    const searchResults = reactive([]);
    const selectedResults = ref([]);

    const selectFolder = (event) => {
      const file = event.target.files[0];
      selectedFolder.value = file.path;
    };

    const search = async () => {
      if (!selectedFolder.value || !keyword.value) {
        return;
      }

      try {
        const response = await axios.post(`${API_URL}/search`, {
          folderPath: selectedFolder.value,
          keyword: keyword.value
        });

        searchResults.length = 0;
        searchResults.push(...response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const saveResults = () => {
      const lines = selectedResults.value.map(result => {
        return `${result.filePath}\n${result.lines.map(line => `${line.lineNumber}\t${line.content}`).join('\n')}\n`;
      }).join('\n');

      const blob = new Blob([lines], { type: 'text/plain' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'search_results.txt';
      downloadLink.click();
    };

    const highlightKeyword = (content) => {
      const regex = new RegExp(keyword.value, 'gi');
      return content.replace(regex, '<span class="highlighted">$&</span>');
    };

    return {
      selectedFolder,
      keyword,
      searchResults,
      selectedResults,
      selectFolder,
      search,
      saveResults,
      highlightKeyword
    };
  }
};
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.folder-tree {
  margin-bottom: 20px;
}

.selected-folder {
  margin-top: 10px;
}

.search {
  margin-bottom: 20px;
}

.results {
  width: 100%;
  max-width: 800px;
}

.result-item {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
}

.result-path {
  font-weight: bold;
  margin-bottom: 10px;
}

.result-content {
  background-color: #f5f5f5;
  padding: 10px;
}

.line-number {
  display: inline-block;
  width: 30px;
  margin-right: 10px;
}

.line-content {
  display: inline-block;
  white-space: pre-wrap;
}

.highlighted {
  background-color: yellow;
}

.save-results {
  margin-top: 20px;
}
</style>
