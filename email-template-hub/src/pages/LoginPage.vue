<template>
  <q-page class="flex flex-center login-container-bg q-pa-md">
    <div class="split-login-card row no-wrap shadow-4">
      
      <div class="col-12 col-md-6 left-brand-panel flex flex-center gt-xs">
        <div class="illustration-wrapper text-center q-pa-lg" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          
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

      <div class="col-12 col-md-6 right-form-panel q-pa-xl" style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
        <div class="text-h5 text-weight-bolder text-grey-8 text-center q-mb-xl uppercase-title">LOGIN</div>

        <q-form @submit.prevent="handleLogin" class="q-gutter-y-md" style="display: flex; flex-direction: column; width: 100%;">
          <div style="width: 100%;">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-pl-xs">Username</div>
            <q-input 
              v-model="email" 
              type="email" 
              placeholder="@mail.com" 
              outlined 
              dense 
              class="custom-split-input"
              :rules="[val => !!val || 'O e-mail é obrigatório']"
              hide-bottom-space
            />
          </div>

          <div style="width: 100%;" class="q-mt-md">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-pl-xs">Password</div>
            <q-input 
              v-model="password" 
              type="password" 
              placeholder="password" 
              outlined 
              dense 
              class="custom-split-input"
              :rules="[val => !!val || 'A senha é obrigatória']"
              hide-bottom-space
            />
          </div>

          <div class="row items-center justify-between q-pt-sm" style="width: 100%;">
            <q-checkbox v-model="rememberMe" label="Remember me" dense class="text-caption text-grey-6" />
            <a href="#" class="text-caption text-primary text-weight-medium text-decoration-none">Esqueceu a Senha?</a>
          </div>

          <div class="q-mt-xl" style="width: 100%;">
            <q-btn 
              label="Entrar" 
              type="submit" 
              color="primary" 
              unelevated
              class="full-width text-weight-bold split-login-btn" 
              no-caps 
            />
          </div>
        </q-form>

        <div class="text-center text-caption text-grey-6 q-mt-md" style="width: 100%;">
          Não Tem Uma Conta? 
          <span class="text-primary text-weight-bold cursor-pointer q-ml-xs" @click="router.push('/register')">
            Inscrever-se
          </span>
        </div>

        <div class="q-mt-xl" style="display: flex; flex-direction: column; width: 100%;">
          <div class="row items-center q-mb-md text-grey-4" style="width: 100%;">
            <q-separator class="col" />
            <span class="q-px-sm text-caption text-grey-5 text-weight-bold">OU</span>
            <q-separator class="col" />
          </div>

          <q-btn 
            outline
            color="grey-4"
            text-color="grey-8"
            class="full-width google-split-btn text-weight-bold"
            no-caps
            unelevated
            @click="connectGmail"
          >
            <q-avatar size="20px" class="q-mr-sm">
              <img src="https://developers.google.com/static/identity/images/g-logo.png" alt="Google">
            </q-avatar>
            <div class="text-subtitle2 text-weight-medium text-grey-7">Entrar com o Google</div>
          </q-btn>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { showSuccess, showError } from 'src/helpers/notify'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const CLIENT_ID = '447644137186-hons62g4jdekbc6hps3pttuh7j21tukt.apps.googleusercontent.com'
let tokenClient

onMounted(() => {
  if (window.google?.accounts?.oauth2) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.send email profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: async (response) => {
        if (response.access_token) {
          localStorage.setItem('google_token', response.access_token)

          try {
            const res = await fetch(
              'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
              { headers: { Authorization: `Bearer ${response.access_token}` } }
            )
            const data = await res.json()

            const userData = {
              email: data.emailAddresses?.[0]?.value || '',
              name: data.names?.[0]?.displayName || ''
            }

            localStorage.setItem('user', JSON.stringify(userData))
            showSuccess(`Conectado como ${userData.email}`)
            router.push('/templates')
          } catch (err) {
            console.error('Erro ao buscar dados do utilizador:', err)
            showError('Não foi possível obter informações do utilizador')
          }
        } else {
          showError('Falha ao autenticar com Gmail')
        }
      }
    })
  }
})

function connectGmail() {
  if (tokenClient) {
    tokenClient.requestAccessToken()
  } else {
    showError('Biblioteca do Google não carregada corretamente.')
  }
}

function handleLogin() {
  if (email.value && password.value) {
    localStorage.setItem('user', JSON.stringify({ email: email.value }))
    
    $q.notify({
      type: 'positive',
      message: 'Autenticação bem-sucedida!',
      position: 'top',
      timeout: 1500
    })
    
    router.push('/templates')
  }
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
.google-split-btn {
  border-radius: 6px !important;
  padding: 10px 0;
  border: 1px solid #cbd5e1 !important;
  background: #ffffff !important;
  transition: all 0.2s ease;
}
.google-split-btn:hover {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
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
.text-decoration-none {
  text-decoration: none;
}
</style>