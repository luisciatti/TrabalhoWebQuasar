<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">Cadastro</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister">
          <q-input v-model="email" label="E-mail" type="email" outlined required />
          <q-input v-model="password" label="Senha" type="password" outlined required />

          <div class="q-mt-md">
            <q-btn label="Cadastrar" type="submit" color="primary" class="full-width" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section>
        <q-btn flat label="Já tem conta? Fazer login" @click="router.push('/login')" />
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

function handleRegister () {
  const users = JSON.parse(localStorage.getItem('users')) || []
  const existingUser = users.find(u => u.email === email.value)

  if (existingUser) {
    alert('Usuário já existe!')
  } else {
    const newUser = { email: email.value, password: password.value }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    alert('Cadastro realizado com sucesso! Faça login para continuar.')
    router.push('/login') // 👈 volta para login
  }
}
</script>
