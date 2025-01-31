<script setup>
import { ref, onMounted } from 'vue';
import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

const db = ref(null);
const query = ref("SELECT * FROM users;");
const results = ref([]);
const loginResult = ref("<No login attempt>");
const error = ref(null);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const showCheatSheet = ref(false);

const testCases = [
  { label: "Normal User", username: "Alice", password: "alice@example.com" },
  { label: "Wrong Credentials", username: "Alice", password: "wrongpassword" },
  { label: "SQL Injection", username: "' OR 1=1 --", password: "anything" }
];

const applyTestCase = (test) => {
  username.value = test.username;
  password.value = test.password;
};

onMounted(async () => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasm });
  db.value = new SQL.Database();
  db.value.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
  db.value.run("INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');");
  db.value.run("INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');");
});

const executeQuery = () => {
  try {
    error.value = null;
    const stmt = db.value.prepare(query.value);
    results.value = [];
    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }
    stmt.free();
  } catch (err) {
    error.value = err.message;
  }
};

const login_with_injection = () => {
  try {
    const stmt_text = `SELECT * FROM users WHERE name = '${username.value}' AND email = '${password.value}'`;
    const stmt = db.value.prepare(stmt_text);
    query.value = stmt_text;

    results.value = [];
    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }
    stmt.free();

    loginResult.value = results.value.length > 0 ? "Login successful" : "Login failed";

  } catch (error) {
    loginResult.value = "Login failed";
  }
};

const login_with_params = () => {
  const stmt_source = `SELECT * FROM users WHERE name = ? AND email = ?`;
  const stmt = db.value.prepare(stmt_source);
  query.value = stmt_source;
  stmt.bind(1, username.value);
  stmt.bind(2, password.value);
  results.value = [];
  while (stmt.step()) {
    results.value.push(stmt.getAsObject());
  }
  stmt.free();
};

</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold p-4">SQL Injection Live Demo</h1>
    <div class="md:grid md:grid-cols-3 gap-4 p-4">
      <div class="bg-gray-100 p-4 rounded w-full">
        <h2 class="text-lg font-bold">Login</h2>
        <h4 class="text-red-500">{{ loginResult }}</h4>
        <input v-model="username"
               placeholder="Username"
               class="block w-full p-2 border rounded mt-2" />
        <div class="relative mt-2">
          <input :type="showPassword ? 'text' : 'password'"
                 v-model="password"
                 placeholder="Password"
                 class="block w-full p-2 border rounded" />
          <button @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-2 px-2 text-sm text-gray-500">{{ showPassword ? 'Hide' : 'Show'
            }}</button>
        </div>
        <button class="mt-2 bg-blue-500 text-white p-2 rounded w-full"
                @click="login_with_injection">Login</button>
      </div>
      <div class="md:col-span-2 space-y-4 w-full">
        <div class="bg-gray-100 p-4 rounded">
          <h2 class="text-lg font-bold">SQL Statements</h2>
          <textarea v-model="query"
                    class="w-full p-2 border rounded"
                    rows="3"></textarea>
          <button @click="executeQuery"
                  class="mt-2 bg-green-500 text-white p-2 rounded w-full">Execute</button>
        </div>
        <div class="bg-gray-100 p-4 rounded">
          <h2 class="text-lg font-bold">SQL Results</h2>
          <div v-if="error"
               class="text-red-500">{{ error }}</div>
          <pre v-else
               class="whitespace-pre-wrap">{{ results }}</pre>
        </div>

        <!-- Cheat Sheet -->
        <div class="absolute bottom-2 right-2">
          <button @click="showCheatSheet = !showCheatSheet"
                  class="bg-gray-300 p-2 rounded">Cheat Sheet</button>
          <div v-if="showCheatSheet"
               class="bg-white p-2 shadow-lg rounded mt-2 w-64">
            <h3 class="font-bold">Test Cases</h3>
            <ul>
              <li v-for="test in testCases"
                  :key="test.label">
                <button @click="applyTestCase(test)"
                        class="block text-blue-500 w-full text-left">{{ test.label }}</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <footer class="mt-4 p-4 text-sm text-gray-600">
        <p><strong>Disclaimer:</strong> This application is a fully frontend-based demo for educational purposes only.
          It
          does not interact with any backend database or store real credentials. It is intended to demonstrate the risks
          of SQL injection in a controlled environment and is not intended for malicious use.</p>

        <p><strong>Credits:</strong> This project utilizes <a href="https://sql.js.org/"
             class="text-blue-500"
             target="_blank">sql.js</a> (SQLite compiled to WebAssembly) and is built with <a href="https://vuejs.org/"
             class="text-blue-500"
             target="_blank">Vue 3</a> and <a href="https://nuxt.com/"
             class="text-blue-500"
             target="_blank">Nuxt.js</a>.</p>

        <p><strong>Repository:</strong> <a href="https://github.com/bkmashiro/appsec-sql-injection-demo"
             class="text-blue-500"
             target="_blank">appsec-sql-injection-demo</a></p>

        <p>This project is a part of Application Security group project presentation by <a
             href="https://blog.yuzhes.com/"
             class="text-blue-500"
             target="_blank">Yuzhe Shi</a> et al.</p>

        <p><strong>This project is licensed under the <a href="https://opensource.org/license/mit"
               class="text-blue-500"
               target="_blank">MIT License</a>.</strong></p>

      </footer>
    </div>
  </div>
</template>
