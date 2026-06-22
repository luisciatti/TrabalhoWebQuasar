<template>
  <q-page class="flex flex-center login-container-bg q-pa-md">
    <div class="split-login-card row no-wrap shadow-4">
      
      <div class="col-12 col-md-6 left-brand-panel flex flex-center gt-xs">
        <div class="illustration-wrapper column items-center justify-center text-center q-pa-lg">
          
          <div class="css-illustration relative-position">
            <div class="mail-arch-door relative-position">
              <div class="door-grid row q-col-gutter-xs q-pa-sm">
                <div class="col-4" v-for="n in 6" :key="n">
                  <div class="grid-box" />
                </div>
              </div>
              <div class="door-handle" />
            </div>
            <div class="human-shadow" />
            <div class="floor-line" />
          </div>

          <div class="text-h4 text-white text-weight-bolder q-mt-xl brand-text-split">MailHub</div>
          <div class="text-subtitle2 text-blue-1 q-mt-xs">Seu hub inteligente de modelos de e-mail</div>
        </div>
      </div>

      <div class="col-12 col-md-6 right-form-panel q-pa-xl column justify-center">
        <div class="text-h5 text-weight-bolder text-grey-8 text-center q-mb-xl uppercase-title">CADASTRO</div>

        <q-form @submit.prevent="handleRegister" class="q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-pl-xs">E-mail</div>
            <q-input 
              v-model="email" 
              type="email" 
              placeholder="seu-email@exemplo.com" 
              outlined 
              dense 
              class="custom-split-input"
              :rules="[val => !!val || 'O e-mail é obrigatório']"
              hide-bottom-space
            />
          </div>

          <div>
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-pl-xs">Senha</div>
            <q-input 
              v-model="password" 
              type="password" 
              placeholder="Crie uma senha segura" 
              outlined 
              dense 
              class="custom-split-input"
              :rules="[val => !!val || 'A senha é obrigatória']"
              hide-bottom-space
            />
          </div>

          <div class="q-mt-xl">
            <q-btn 
              label="Cadastrar" 
              type="submit" 
              color="primary" 
              unelevated
              class="full-width text-weight-bold split-login-btn" 
              no-caps 
            />
          </div>
        </q-form>

        <div class="text-center text-caption text-grey-6 q-mt-xl">
          Já tem uma conta? 
          <span 
            class="text-primary text-weight-bold cursor-pointer q-ml-xs text-decoration-none" 
            @click="goToLogin"
          >
            Fazer login
          </span>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccess, showError } from 'src/helpers/notify'

const email = ref('')
const password = ref('')
const router = useRouter()

function handleRegister () {
  const users = JSON.parse(localStorage.getItem('users')) || []
  const existingUser = users.find(u => u.email === email.value)

  if (existingUser) {
    showError('Este e-mail já está cadastrado!')
  } else {
    const newUser = { email: email.value, password: password.value }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    
    showSuccess('Cadastro realizado com sucesso!')
    goToLogin()
  }
}

function goToLogin () {
  router.push('/')
}
</script>

<style scoped>
.login-container-bg {
  background: #4fa8fa !important;
  min-height: 100vh;
}
.split-login-card {
  width: 900px;
  max-width: 95vw;
  height: 580px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}
.left-brand-panel {
  background: #3ca0e8;
  height: 100%;
}
.brand-text-split {
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.right-form-panel {
  background: #ffffff;
  height: 100%;
}
.uppercase-title {
  letter-spacing: 1px;
  font-size: 26px;
  color: #2c3e50;
}
.custom-split-input :deep(.q-field__control) {
  background-color: #f1f5f9 !important;
  border-radius: 6px !important;
  transition: all 0.2s ease;
}
.custom-split-input :deep(.q-field__control:before) {
  border: none !important;
}
.custom-split-input :deep(.q-field__control:after) {
  border-color: #3ca0e8 !important;
}
.split-login-btn {
  border-radius: 6px !important;
  padding: 12px 0;
  background: #3ca0e8 !important;
}
.css-illustration {
  width: 200px;
  height: 200px;
}
.mail-arch-door {
  width: 100px;
  height: 150px;
  background: #d1dbe5;
  border-radius: 50px 50px 0 0;
  border: 3px solid #ffffff;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}
.door-grid .grid-box {
  background: #ffffff;
  height: 32px;
  border-radius: 2px;
  opacity: 0.8;
}
.door-handle {
  width: 12px;
  height: 12px;
  background: #3ca0e8;
  border-radius: 50%;
  position: absolute;
  left: 10px;
  top: 90px;
  border: 2px solid #ffffff;
}
.human-shadow {
  width: 24px;
  height: 75px;
  background: #1e293b;
  border-radius: 12px 12px 0 0;
  position: absolute;
  right: 40px;
  bottom: 10px;
  z-index: 3;
}
.human-shadow::before {
  content: '';
  width: 26px;
  height: 25px;
  background: #4fa8fa;
  position: absolute;
  top: 20px;
  left: -1px;
  border-radius: 4px;
}
.floor-line {
  width: 220px;
  height: 3px;
  background: #1e293b;
  position: absolute;
  bottom: 10px;
  left: -10px;
  z-index: 1;
  opacity: 0.3;
}
</style>