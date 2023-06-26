<!-- App.vue -->
<template>
  <div class="app">
    <div class="sidebar">
      <h2>文件夹列表</h2>
      <ul>
        <li v-for="folder in folders" :key="folder.path">
          <button @click="selectDirectory(folder.path)">{{ folder.name }}</button>
        </li>
      </ul>
    </div>
    <div class="content">
      <h2>选择文件夹</h2>
      <div v-for="directory in selectedDirectories" :key="directory.path">
        <h3>{{ directory.name }}</h3>
        <ul>
          <li v-for="folder in directory.folders" :key="folder.path">
            <button @click="selectDirectory(folder.path)">{{ folder.name }}</button>
          </li>
        </ul>
      </div>
      <div v-if="selectedDirectories.length > 0">
        <button @click="searchFiles">搜索</button>
      </div>

      <h2>搜索</h2>
      <input type="text" v-model="keyword" placeholder="输入关键字">

      <h2>搜索结果</h2>
      <div v-if="searchedFiles.length === 0">没有搜索结果</div>
      <div v-else>
        <div v-for="file in searchedFiles" :key="file.path">
          <h3>{{ file.path }}</h3>
          <div v-for="line in file.lines" :key="line.lineNumber">
            <div class="line-number">{{ line.lineNumber }}</div>
            <div class="line-content" v-html="line.content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      folders: [],
      selectedDirectories: [],
      keyword: '',
      searchedFiles: []
    };
  },
  mounted() {
    this.loadRootDirectory();
  },
  methods: {
    loadRootDirectory() {
      fetch('/api/directory')
        .then(response => response.json())
        .then(data => {
          this.folders = data.folders;
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },
    selectDirectory(directoryPath) {
      if (directoryPath) {
        fetch(`/api/directory/${directoryPath}`)
          .then(response => response.json())
          .then(data => {
            this.selectedDirectories.push(data);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        this.selectedDirectories.pop();
      }
    },
    searchFiles() {
      if (this.keyword.trim() === '') {
        return;
      }

      const requestData = {
        keyword: this.keyword,
        directory: this.selectedDirectories[this.selectedDirectories.length - 1].path
      };

      fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then(response => response.json())
        .then(data => {
          this.searchedFiles = data;
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }
};
</script>

<style>
/* 样式可以根据需求进行调整 */
.app {
  display: flex;
}

.sidebar {
  flex: 0 0 200px;
  background-color: #f0f0f0;
  padding: 20px;
}

.content {
  flex: 1;
  padding: 20px;
}

h2 {
  margin-top: 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

.line-number {
  display: inline-block;
  width: 30px;
  text-align: right;
  padding-right: 5px;
  color: #888;
}

.line-content {
  display: inline-block;
  padding-left: 5px;
}

.highlight {
  background-color: yellow;
}
</style>
