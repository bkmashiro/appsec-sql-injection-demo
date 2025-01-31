<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Source Code</h1>
    <div class="grid grid-cols-1 gap-4 mt-4">
      <div>
        <h2 class="text-xl font-bold">Vulnerable Code</h2>
        <div v-html="html_vulnerable" class="mt-4"></div>
      </div>
      <div>
        <h2 class="text-xl font-bold">Safe Code</h2>
        <div v-html="html_safe" class="mt-4"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { codeToHtml } from 'shiki';

const vulnerableCode = `
const login_with_injection = () => {
  const stmt_text = \`SELECT * FROM users WHERE name = '\${username.value}' AND password = '\${password.value}'\`;
  const stmt = db.value.prepare(stmt_text);

  while (stmt.step()) {
    results.value.push(stmt.getAsObject());
  }

  stmt.free();
};`;

const safeCode = `
const login_with_params = () => {
    const stmt_source = \`SELECT * FROM users WHERE name = :name AND password = :password\`;
    const stmt = db.value.prepare(stmt_source, { ":name": username.value, ":password": password.value });

    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }

    stmt.free();
};`;

const html_vulnerable = await codeToHtml(vulnerableCode, {
  lang: 'javascript',
  theme: 'tokyo-night'
});

const html_safe = await codeToHtml(safeCode, {
  lang: 'javascript',
  theme: 'tokyo-night'
});


</script>

<style></style>