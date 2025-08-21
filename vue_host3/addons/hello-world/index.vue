<template>
  <div class="hello-world">
    <div class="header">
      <h1>🌍 Hello World!</h1>
      <p class="subtitle">Welcome to your first community addon</p>
    </div>
    
    <div class="content">
      <div class="welcome-card">
        <h2>Congratulations! 🎉</h2>
        <p>You've successfully installed and opened the Hello World addon from the marketplace.</p>
        
        <div class="features">
          <h3>What can you do here?</h3>
          <ul>
            <li>✨ Explore addon development</li>
            <li>🔧 Learn Vue.js components</li>
            <li>🎨 Customize the interface</li>
            <li>📦 Build your own addons</li>
          </ul>
        </div>
        
        <div class="actions">
          <button @click="showMessage" class="btn btn-primary">
            Say Hello!
          </button>
          <button @click="counter++" class="btn btn-secondary">
            Click me! ({{ counter }})
          </button>
        </div>
        
        <div v-if="message" class="message">
          {{ message }}
        </div>
      </div>
      
      <div class="info-card">
        <h3>Addon Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Name:</strong>
            <span>Hello World</span>
          </div>
          <div class="info-item">
            <strong>Version:</strong>
            <span>1.0.0</span>
          </div>
          <div class="info-item">
            <strong>Author:</strong>
            <span>Community Developer</span>
          </div>
          <div class="info-item">
            <strong>Type:</strong>
            <span>Community Addon</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)
const message = ref('')

const messages = [
  "Hello there! 👋",
  "Welcome to the addon system! 🚀",
  "You're doing great! ⭐",
  "Keep exploring! 🔍",
  "Community addons are awesome! 💪"
]

function showMessage() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
  message.value = randomMessage
  
  // Clear message after 3 seconds
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.hello-world {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2em;
  color: #666;
  margin: 0;
}

.content {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .content {
    grid-template-columns: 2fr 1fr;
  }
}

.welcome-card, .info-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
}

.welcome-card h2 {
  color: #28a745;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.features {
  margin: 25px 0;
}

.features h3 {
  color: #333;
  margin-bottom: 15px;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 8px 0;
  color: #555;
}

.actions {
  display: flex;
  gap: 10px;
  margin: 25px 0;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.message {
  background: #d4edda;
  color: #155724;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  border: 1px solid #c3e6cb;
  text-align: center;
  font-weight: 500;
}

.info-card h3 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-item strong {
  color: #333;
}

.info-item span {
  color: #666;
}
</style>
