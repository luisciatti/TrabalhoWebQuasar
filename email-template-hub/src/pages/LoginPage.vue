<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin">
          <q-input v-model="email" label="E-mail" type="email" outlined required />
          <q-input v-model="password" label="Senha" type="password" outlined required />

          <div class="q-mt-md">
            <q-btn label="Entrar" type="submit" color="primary" class="full-width" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section>
        <q-btn flat label="Não tem conta? Cadastre-se" @click="router.push('/register')" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

function handleLogin () {
  const users = JSON.parse(localStorage.getItem('users')) || []
  const existingUser = users.find(u => u.email === email.value)

  if (existingUser && existingUser.password === password.value) {
    localStorage.setItem('user', JSON.stringify(existingUser)) // 👈 salva logado
    alert('Login realizado com sucesso!')
    router.push('/templates')
  } else {
    alert('Usuário não encontrado ou senha incorreta!')
  }
}
</script>
