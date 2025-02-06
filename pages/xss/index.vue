<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center">XSS 演示留言板</h1>
    <div class="mt-4 md:grid md:grid-cols-3 gap-4">
      <!-- 留言提交区域 -->
      <div class="bg-gray-100 p-4 rounded w-full md:col-span-1">
        <h2 class="text-lg font-bold">提交留言</h2>
        <input
          v-model="name"
          placeholder="你的名字"
          class="block w-full p-2 border rounded mt-2"
        />
        <textarea
          v-model="message"
          placeholder="你的留言"
          class="w-full p-2 border rounded mt-2"
          rows="4"
        ></textarea>
        <button
          @click="submitMessage"
          class="mt-2 bg-blue-500 text-white p-2 rounded w-full"
        >
          提交
        </button>
      </div>
      
      <!-- 留言显示区域 -->
      <div class="bg-gray-100 p-4 rounded w-full md:col-span-2">
        <h2 class="text-lg font-bold">留言内容 (存在 XSS 漏洞)</h2>
        <div v-if="messages.length === 0" class="text-gray-500 mt-2">
          暂无留言
        </div>
        <div v-else class="space-y-4 mt-2">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="p-2 border rounded"
          >
            <div class="font-bold">{{ msg.name }}</div>
            <!-- 注意：直接使用 v-html 渲染留言内容，存在 XSS 漏洞 -->
            <div v-html="msg.message"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cheat Sheet：XSS 测试案例 -->
    <div class="fixed bottom-2 right-2 md:relative md:bottom-auto md:right-auto">
      <button @click="toggleCheatSheet" class="bg-gray-300 p-2 rounded">
        Cheat Sheet
      </button>
      <div v-if="showCheatSheet" class="bg-white p-2 shadow-lg rounded mt-2 w-64">
        <h3 class="font-bold">XSS 测试案例</h3>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li v-for="(payload, index) in cheatPayloads" :key="index">
            <button
              @click="applyPayload(payload)"
              class="text-blue-500 w-full text-left"
            >
              {{ payload.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="mt-4 p-4 text-sm text-gray-600 text-center">
      <p>
        <strong>免责声明:</strong> 该留言板仅用于演示跨站脚本 (XSS) 攻击，切勿用于非法用途。
      </p>
      <p>
        <strong>提示:</strong> 留言内容直接以 HTML 渲染，存在 XSS 风险。
      </p>
      <p><strong>MIT License</strong></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { xss_examples } from '#imports';
// 留言相关状态
const name = ref('');
const message = ref('');
const messages = ref<any[]>([]);
const successful_injections = ref<string[]>([]);
const showCheatSheet = ref(false);

// Cheat Sheet 示例（XSS payload）
const cheatPayloads = ref(xss_examples);

// 切换 Cheat Sheet 显示状态
const toggleCheatSheet = () => {
  showCheatSheet.value = !showCheatSheet.value;
};

// 将示例 payload 应用到留言文本框中
const applyPayload = (payload: any) => {
  message.value = payload.payload;
};

// 从 localStorage 加载留言数据
onMounted(() => {
  // we change alert to our dummy function
  window.alert = function() {
    successful_injections.value.push(`successful injection at ${new Date().toLocaleString()}`);
  };


  const storedMessages = localStorage.getItem('xss_messages');
  if (storedMessages) {
    try {
      messages.value = JSON.parse(storedMessages);
    } catch (e) {
      messages.value = [];
    }
  }
});

// 提交留言，更新 localStorage
const submitMessage = () => {
  if (!name.value || !message.value) return;
  const newMessage = {
    name: name.value,
    message: message.value,
  };
  messages.value.push(newMessage);
  localStorage.setItem('xss_messages', JSON.stringify(messages.value));
  // 清空输入框
  name.value = '';
  message.value = '';
};
</script>

<style scoped>
/* 可根据需要添加自定义样式 */
</style>
