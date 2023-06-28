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
const { searchFiles, saveResultsToFile } = require('./search');

export default {
  data() {
    return {
      selectedFiles: [],
      searchQuery: '',
      searchResults: []
    };
  },
  methods: {
    // 处理文件选择事件
    handleFileSelect(event) {
      this.selectedFiles = Array.from(event.target.files);
    },
    // 执行搜索
    async search() {
      this.searchResults = await searchFiles(this.selectedFiles, this.searchQuery);
    },
    // 高亮显示关键字
    highlightKeywords(content) {
      const regex = new RegExp(`(${this.searchQuery})`, 'gi');
      return content.replace(regex, '<span class="highlighted">$1</span>');
    },
    // 保存搜索结果
    saveResults() {
      saveResultsToFile(this.searchResults);
    }
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
