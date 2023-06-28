<template>
  <div>
    <input type="file" @change="handleFileSelect" multiple>
    <input type="text" v-model="searchQuery" placeholder="输入关键字">
    <button @click="search">搜索</button>

    <div v-for="(result, index) in searchResults" :key="index">
      <h3>{{ result.path }}</h3>
      <hr>
      <div v-for="line in result.lines" :key="line.lineNumber">
        <p v-html="highlightKeywords(line.content)"></p>
      </div>
    </div>

    <button @click="saveResults">保存</button>
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
