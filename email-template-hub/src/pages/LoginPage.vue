<template>
  <q-page class="flex flex-center glass-login-bg">
    <!-- CARD DE LOGIN MAC (GLASSMORPHISM + NEUMORFISMO) -->
    <div class="mac-login-card">
      
      <!-- Detalhe decorativo estilo janela do Mac -->
      <div class="mac-window-dots row q-gutter-xs q-mb-md">
        <span class="dot close"></span>
        <span class="dot minimize"></span>
        <span class="dot expand"></span>
      </div>

      <!-- Logotipo / Ícone Central -->
      <div class="text-center q-mb-lg">
        <div class="mac-avatar-container flex flex-center q-mx-auto q-mb-sm">
          <q-icon name="mail" size="md" color="primary" />
        </div>
        <h2 class="text-h5 text-weight-bolder text-grey-9 q-my-none">MailDraft</h2>
        <p class="text-caption text-grey-6 q-mt-xs">Entre com as suas credenciais</p>
      </div>

      <!-- Integração da API do Gmail (Design Unificado) -->
      <div class="q-mb-lg">
        <q-btn 
          label="Conectar com Google" 
          icon="img:https://developers.google.com/static/identity/images/g-logo.png"
          color="white" 
          text-color="grey-7"
          class="google-btn full-width text-weight-bold" 
          no-caps
          flat
          @click="connectGmail" 
        />
      </div>

      <div class="row items-center q-mb-lg text-grey-5">
        <q-separator class="col" />
        <span class="q-px-sm text-caption text-weight-bold">OU</span>
        <q-separator class="col" />
      </div>

      <div class="row items-center q-mb-lg text-grey-5">
        <q-separator class="col" />
        <span class="q-px-sm text-caption text-weight-bold">OU</span>
        <q-separator class="col" />
      </div>

      <!-- Formulário de Login Tradicional -->
      <q-form @submit.prevent="handleLogin" class="q-gutter-md">
        <div>
          <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">E-MAIL</div>
          <q-input 
            v-model="email" 
            type="email" 
            placeholder="nome@exemplo.com" 
            borderless 
            class="mac-input q-px-md"
            :rules="[val => !!val || 'O e-mail é obrigatório']"
            hide-bottom-space
          >
            <template v-slot:prepend>
              <q-icon name="alternate_email" size="xs" color="grey-6" />
            </template>
          </q-input>
        </div>

        <div>
          <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">SENHA</div>
          <q-input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            borderless 
            class="mac-input q-px-md"
            :rules="[val => !!val || 'A senha é obrigatória']"
            hide-bottom-space
          >
            <template v-slot:prepend>
              <q-icon name="lock" size="xs" color="grey-6" />
            </template>
          </q-input>
        </div>

        <div class="q-mt-xl">
          <q-btn 
            label="Iniciar Sessão" 
            type="submit" 
            color="primary" 
            class="mac-btn full-width text-weight-bold" 
            flat 
            no-caps 
          />
        </div>
      </q-form>

      <div class="text-center q-mt-lg">
        <a href="#" class="text-caption text-primary text-weight-medium text-decoration-none">Esqueceu a sua senha?</a>
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
            console.error('Erro ao buscar dados do usuário:', err)
            showError('Não foi possível obter informações do usuário')
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
/* 1. FUNDO SÓLIDO (ESTILO MAC PRESTINE AZUL-PASTEL) */
.glass-login-bg {
  background-color: #dbe7f2 !important;
  min-height: 100vh;
}

/* 2. O CARD GLASSMORPHISM + NEUMORFISMO */
.mac-login-card {
  width: 400px;
  max-width: 90vw;
  padding: 30px 35px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.04),
    10px 10px 25px rgba(160, 175, 190, 0.2), 
    -10px -10px 25px rgba(255, 255, 255, 0.6),
    inset 1px 1px 0px rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 3. WINDOW DOTS DO MAC */
.mac-window-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.dot.close { background-color: #ff5f56; }
.dot.minimize { background-color: #ffbd2e; }
.dot.expand { background-color: #27c93f; }

/* 4. RECEPTÁCULO DO AVATAR */
.mac-avatar-container {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  box-shadow: 
    4px 4px 10px rgba(160, 175, 190, 0.15),
    -4px -4px 10px rgba(255, 255, 255, 0.7),
    inset 2px 2px 5px rgba(160, 175, 190, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 5. ENTRADAS DE TEXTO ESTILO MACOS CACHED */
.mac-input {
  background: rgba(255, 255, 255, 0.4) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 2px 2px 5px rgba(140, 155, 170, 0.15);
  transition: all 0.25s ease;
  font-size: 14px;
}
.mac-input:focus-within {
  background: rgba(255, 255, 255, 0.7) !important;
  border-color: var(--q-primary);
  box-shadow: 
    0 0 0 3px rgba(var(--q-primary-rgb), 0.15),
    inset 1px 1px 2px rgba(140, 155, 170, 0.05);
}

/* 6. BOTÃO PREMIUM DO MAC OS */
.mac-btn {
  background: var(--q-primary) !important;
  color: white !important;
  border-radius: 12px !important;
  padding: 12px 0;
  box-shadow: 
    0 4px 12px rgba(var(--q-primary-rgb), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}
.mac-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--q-primary-rgb), 0.4);
}
.mac-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(var(--q-primary-rgb), 0.3);
}

/* 7. BOTÃO DO GOOGLE INTEGRADO AO NEUMORFISMO */
.google-btn {
  background: rgba(255, 255, 255, 0.5) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 4px 4px 10px rgba(160, 175, 190, 0.1),
              -4px -4px 10px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}
.google-btn:hover {
  background: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 4px 4px 12px rgba(160, 175, 190, 0.15);
}

.text-decoration-none {
  text-decoration: none;
}
</style>