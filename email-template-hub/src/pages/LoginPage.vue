<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-btn label="Conectar com Google" color="primary" @click="connectGmail" class="full-width" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccess, showError } from 'src/helpers/notify'

const router = useRouter()
const CLIENT_ID = '447644137186-hons62g4jdekbc6hps3pttuh7j21tukt.apps.googleusercontent.com'

let tokenClient

onMounted(() => {
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
})

function connectGmail() {
  tokenClient.requestAccessToken()
}
</script>
