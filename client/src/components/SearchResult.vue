<template>
    <div>
      <template v-for="result in searchResults">
        <div class="result-item">
          <div class="file-path">{{ result.filePath }}</div>
          <hr>
          <div class="content-line" v-for="line in result.lines" :key="line.lineNumber">
            <div class="line-number">{{ line.lineNumber }}</div>
            <div class="content" v-html="highlightKeywords(line.content)"></div>
          </div>
        </div>
        <hr>
      </template>
      <button @click="saveResults">保存并下载</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      searchResults: {
        type: Array,
        required: true
      }
    },
    methods: {
      highlightKeywords(content) {
        const keywords = this.$route.query.keywords; // 从路由中获取关键字
        const regex = new RegExp(`(${keywords})`, 'gi');
        return content.replace(regex, '<span class="highlight">$1</span>');
      },
      saveResults() {
        const resultsText = this.searchResults.map(result => {
          const linesText = result.lines.map(line => `${line.lineNumber}\t${line.content}`).join('\n');
          return `${result.filePath}\n-------------------------------\n${linesText}`;
        }).join('\n\n');
  
        const blob = new Blob([resultsText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'search_results.txt';
        link.click();
      }
    }
  };
  </script>
  
  <style>
  .highlight {
    background-color: yellow;
    font-weight: bold;
  }
  </style>
  