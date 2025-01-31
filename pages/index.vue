<script setup lang="ts">
import { ref, onMounted } from "vue";
import initSqlJs, { type Database } from "sql.js";
import sqlWasm from "sql.js/dist/sql-wasm.wasm?url";
import { Head } from "#components";

const { $confetti } = useNuxtApp();

const db = ref<Database | null>(null);
const query = ref("SELECT * FROM users;");
const results = ref<any[]>([]);
const loginResult = ref("<No login attempt>");
const error = ref<string | null>(null);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const showCheatSheet = ref(false);
const safeQuery = ref(false);
const sqlParams = ref<{ [name: string]: any }>({});
const isOpen = ref(false)

const testCases = [
  { label: "Normal User", username: "Shiro", password: "P@ssw0rd" },
  { label: "Wrong Credentials", username: "Shiro", password: "wrongpassword" },
  { label: "SQL Injection", username: "' OR 1=1 --", password: "anything" },
];

const applyTestCase = (test: { username: string; password: string }) => {
  username.value = test.username;
  password.value = test.password;
};

onMounted(async () => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasm });
  db.value = new SQL.Database();
  db.value.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, password TEXT);"
  );
  db.value.run(
    "INSERT INTO users (name, password) VALUES ('Shiro', 'P@ssw0rd');"
  );
  db.value.run(
    "INSERT INTO users (name, password) VALUES ('Dylan', 'foobar');"
  );
});

const executeQuery = () => {
  try {
    if (!db.value) {
      throw new Error("Database not initialized");
    }

    error.value = null;
    results.value = [];

    const stmt = db.value.prepare(query.value, sqlParams.value);
    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }
    stmt.free();
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "An error occurred";
    }
  }
};

const login_with_injection = () => {
  try {
    if (!db.value) {
      throw new Error("Database not initialized");
    }

    const stmt_text = `SELECT * FROM users WHERE name = '${username.value}' AND password = '${password.value}'`;
    const stmt = db.value.prepare(stmt_text);
    query.value = stmt_text;

    results.value = [];
    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }
    stmt.free();

    loginResult.value =
      results.value.length > 0 ? "Login successful" : "Login failed";

    // if logged in with injection (has result but not using correct username), show confetti
    if (results.value.length > 1 || (results.value.length === 1 && results.value[0].name !== username.value)) {

      isOpen.value = true

      setTimeout(() => {
        $confetti.addConfetti();
      }, 0);

      setTimeout(() => {
        $confetti.addConfetti({
          emojis: ["🎉", "🎊", "🎈"],
        });
      }, 1000);

      setTimeout(() => {
        $confetti.addConfetti({
          emojis: ["😎", "🥳", "🤩"],
        });
      }, 2000);

      setTimeout(() => {
        $confetti.addConfetti();
      }, 3000);

      setTimeout(() => {
        $confetti.addConfetti({
          emojis: ["🎉", "🎊", "🎈"],
        });
      }, 4000);

      setTimeout(() => {
        $confetti.addConfetti({
          emojis: ["😎", "🥳", "🤩"],
        });
      }, 5000);
    }
  } catch (error) {
    loginResult.value = "Login failed";
  }
};

const login_with_params = () => {
  try {
    if (!db.value) {
      throw new Error("Database not initialized");
    }

    const stmt_source = `SELECT * FROM users WHERE name = :name AND password = :password`;
    sqlParams.value = { ":name": username.value, ":password": password.value };
    query.value = stmt_source;
    // console.log(sqlParams.value);
    const stmt = db.value.prepare(stmt_source, sqlParams.value);
    results.value = [];
    while (stmt.step()) {
      results.value.push(stmt.getAsObject());
    }
    stmt.free();

    loginResult.value =
      results.value.length > 0 ? "Login successful" : "Login failed";
  } catch (error) {
    loginResult.value = "Login failed";
  }
};

const login = () => {
  sqlParams.value = {};
  if (safeQuery.value) {
    login_with_params();
  } else {
    login_with_injection();
  }
};
</script>

<template>
  <Head>
    <title>SQL Injection Demo</title>
    <Meta name="description"
          content="A live demo of SQL injection vulnerabilities in a controlled environment." />
  </Head>

  <div class="p-4">
    <div class="md:grid md:grid-cols-2">
      <h1 class="text-2xl font-bold p-4">SQL Injection Live Demo</h1>
      <div class="flex items-center p-4 w-full justify-end">
        <p class="mr-2">Safe Query</p>
        <UToggle on-icon="i-heroicons-check-20-solid"
                 off-icon="i-heroicons-x-mark-20-solid"
                 v-model="safeQuery" />
      </div>
    </div>
    <div class="md:grid md:grid-cols-3 gap-4 p-4">
      <div class="bg-gray-100 p-4 rounded w-full">
        <h2 class="text-lg font-bold">Login</h2>
        <h4 class="text-red-500">{{ loginResult }}</h4>
        <input v-model="username"
               placeholder="Username"
               class="block w-full p-2 border rounded mt-2" />
        <div class="relative mt-2">
          <form>
            <input :type="showPassword ? 'text' : 'password'"
                   v-model="password"
                   placeholder="Password"
                   autocomplete="off"
                   class="block w-full p-2 border rounded" />
            <button @click.prevent="showPassword = !showPassword"
                    class="absolute inset-y-0 right-2 px-2 text-sm text-gray-500">
              {{ showPassword ? "Hide" : "Show" }}
            </button>
          </form>
        </div>
        <button class="mt-2 bg-blue-500 text-white p-2 rounded w-full"
                @click="login">
          Login
        </button>
      </div>
      <div class="md:col-span-2 space-y-4 w-full">
        <div class="bg-gray-100 p-4 rounded">
          <h2 class="text-lg font-bold">SQL Statements</h2>
          <textarea v-model="query"
                    class="w-full p-2 border rounded font-mono"
                    rows="3"></textarea>

          <div v-if="Object.keys(sqlParams).length > 0">
            <h3 class="text-lg font-bold mt-2">Parameters</h3>
            <ul>
              <li v-for="(_value, key) in sqlParams"
                  :key="key"
                  class="mt-2">
                <div class="grid grid-cols-4 w-full">
                  <p class="p-2 text-right">
                    <strong>{{ key }}</strong>
                  </p>

                  <textarea v-model="sqlParams[key]"
                            class="w-full p-2 border rounded font-mono col-span-3"
                            rows="1"></textarea>
                </div>
              </li>
            </ul>
          </div>
          <button @click="executeQuery"
                  class="mt-2 bg-green-500 text-white p-2 rounded w-full">
            Execute
          </button>
        </div>
        <div class="bg-gray-100 p-4 rounded">
          <h2 class="text-lg font-bold">SQL Results</h2>
          <div v-if="error"
               class="text-red-500">{{ error }}</div>
          <pre v-else
               class="whitespace-pre-wrap">{{ results }}</pre>
        </div>

        <!-- Cheat Sheet -->
        <div class="fixed bottom-2 right-2">
          <button @click="showCheatSheet = !showCheatSheet"
                  class="bg-gray-300 p-2 rounded">
            Cheat Sheet
          </button>
          <div v-if="showCheatSheet"
               class="bg-white p-2 shadow-lg rounded mt-2 w-64">
            <h3 class="font-bold">Test Cases</h3>
            <ul>
              <li v-for="test in testCases"
                  :key="test.label">
                <button @click="applyTestCase(test)"
                        class="block text-blue-500 w-full text-left">
                  {{ test.label }}
                </button>
              </li>
            </ul>

            <br />

            <h3 class="font-bold">Raw code</h3>
            <a href="/source-code"
               class="block text-blue-500 w-full text-left">View source code</a>
          </div>
        </div>
      </div>

      <footer class="mt-4 p-4 text-sm text-gray-600">
        <p>
          <strong>Disclaimer:</strong> This application is a fully
          frontend-based demo for educational purposes only. It does not
          interact with any backend database or store real credentials. It is
          intended to demonstrate the risks of SQL injection in a controlled
          environment and is not intended for malicious use.
        </p>

        <p>
          <strong>Credits:</strong> This project utilizes
          <a href="https://sql.js.org/"
             class="text-blue-500"
             target="_blank">sql.js</a>
          (SQLite compiled to WebAssembly) and is built with
          <a href="https://vuejs.org/"
             class="text-blue-500"
             target="_blank">Vue 3</a>
          and
          <a href="https://nuxt.com/"
             class="text-blue-500"
             target="_blank">Nuxt.js</a>.
        </p>

        <p>
          <strong>Repository:</strong>
          <a href="https://github.com/bkmashiro/appsec-sql-injection-demo"
             class="text-blue-500"
             target="_blank">appsec-sql-injection-demo</a>
        </p>
        <br />
        <p>
          This project is a part of Application Security group project
          presentation by
          <a href="https://blog.yuzhes.com/"
             class="text-blue-500"
             target="_blank">Yuzhe Shi</a>
          et al.
        </p>

        <p>
          This project is licensed under the
          <a href="https://opensource.org/license/mit"
             class="text-blue-500"
             target="_blank">MIT License</a>.
        </p>
      </footer>
    </div>

    <UModal v-model="isOpen" :transition="false">
      <div class="p-4">
        <p class="font-bold text-2xl"> 🎉 Congras! You've made a SQL injection! </p>
      </div>
    </UModal>
  </div>
</template>
