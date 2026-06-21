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
          <q-icon name="mail" size="md"  />
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
/* Fundo clean */
.glass-login-bg {
  background: #f9fafb !important;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card moderno */
.mac-login-card {
  width: 400px;
  max-width: 90vw;
  padding: 32px;
  background: #ffffff !important;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Window dots estilo Mac */
.mac-window-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.dot.close { background-color: #ef4444; }
.dot.minimize { background-color: #f59e0b; }
.dot.expand { background-color: #10b981; }

/* Avatar */
.mac-avatar-container {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37,99,235,0.3);
}

/* Inputs */
.mac-input {
  background: #ffffff !important;
  border-radius: 8px !important;
  border: 1px solid #e5e7eb !important;
  font-size: 14px !important;
  color: #1f2937 !important;
}

/* Usa dense para reduzir altura */
.mac-input.q-field--dense {
  min-height: 38px !important;
}

/* Ajusta padding interno */
.mac-input .q-field__native {
  padding: 6px 10px !important;
  min-height: 32px !important;
}

/* Label e ícone alinhados */
.mac-input .q-field__label {
  font-size: 12px !important;
  color: #6b7280 !important;
}
.mac-input .q-icon {
  font-size: 16px !important;
  margin-right: 4px;
}

/* Foco */
.mac-input:focus-within {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.15) !important;
}


/* Botão principal */
.mac-btn {
  border-radius: 8px !important;
  background: #2563eb !important;
  color: #ffffff !important;
  font-weight: 600;
  padding: 12px;
  transition: all 0.2s ease-in-out;
}
.mac-btn:hover {
  background: #1e40af !important;
  box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  transform: scale(1.03);
}

/* Botão alternativo (Google) */
.google-btn {
  border-radius: 8px !important;
  background: #f3f4f6 !important;
  color: #374151 !important;
  padding: 12px;
  transition: all 0.2s ease-in-out;
}
.google-btn:hover {
  background: #e5e7eb !important;
}
</style>
