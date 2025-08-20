<template>
  <div>
    <p>Hello {{ coreAPI.getUser().name }} 👋</p>
    <p>Counter from counter-addon: {{ counterValue }}</p>
    <Button @click="handleClick">Click Me!</Button>
    <Button @click="incrementFromHello">Increment Counter from Hello</Button>
    <Button @click="decrementFromHello">Decrement Counter from Hello</Button>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { coreAPI } from "host/core";
import { Button } from "ui";
import { counterAPI } from "counter-addon";

coreAPI.log("Hello Addon loaded!");

// Reactive reference to the counter value
const counterValue = ref(0);

// Watch the counter from counter-addon and update local value
watchEffect(() => {
  counterValue.value = counterAPI.count.value;
});

function handleClick() {
  coreAPI.log("Button clicked!");
}

function incrementFromHello() {
  counterAPI.incrementCounter();
  coreAPI.log("Hello addon incremented the counter!");
}

function decrementFromHello() {
  counterAPI.decrementCounter();
  coreAPI.log("Hello addon decremented the counter!");
}
</script>