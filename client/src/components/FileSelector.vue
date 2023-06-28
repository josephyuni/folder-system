<template>
    <div>
      <button @click="selectFolder">选择文件夹</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      selectFolder() {
        // 处理选择文件夹逻辑
        this.$emit('select-folder');
      }
    }
  };
  </script>
  