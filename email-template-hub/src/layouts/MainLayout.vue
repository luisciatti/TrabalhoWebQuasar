<template>
  <q-layout view="lHh Lpr lFf" class="neumorphic-bg">
    <!-- HEADER AZUL DO LOGIN COM DROP-SHADOW -->
    <q-header v-if="$route.path !== '/' && $route.path !== '/login'" flat class="neu-header q-py-sm">
      <q-toolbar class="row items-center justify-between q-px-xl">
        
        <!-- Lado Esquerdo: Marca e Submenus -->
        <div class="row items-center q-gutter-md">
          <div class="text-h5 text-weight-bolder text-white brand-title q-mr-lg">MailHub</div>
          
          <!-- Submenus de Navegação (Dashboard Removido, Sobre Nós Adicionado) -->
          <div class="row items-center no-wrap gt-xs">
            <q-btn flat no-caps label="Templates" class="neu-nav-btn text-weight-bold text-white neu-nav-active" />
            <q-btn flat no-caps label="Histórico" class="neu-nav-btn text-weight-medium text-blue-1" />
            <q-btn flat no-caps label="Sobre nós" class="neu-nav-btn text-weight-medium text-blue-1" @click="showAbout = true" />
          </div>
        </div>

        <!-- Lado Direito: Pílula de Autenticação do Usuário -->
        <div v-if="user" class="neu-profile-pill row items-center no-wrap cursor-pointer">
          <q-avatar size="36px" style="background-color: #3ca0e8; color: #ffffff;" class="text-weight-bold shadow-1">
            {{ userInitial }}
          </q-avatar>
          
          <div class="column justify-center q-mx-sm gt-xs" style="height: 36px;">
            <span class="text-subtitle2 text-weight-bold neu-text-blue line-clamp text-capitalize" style="max-width: 140px; font-size: 13px; line-height: 1.1; margin: 0; padding: 0;">
              {{ user?.name || 'Usuário Logado' }}
            </span>
            <span class="text-caption neu-text-blue line-clamp" style="max-width: 140px; font-size: 11px; line-height: 1.1; opacity: 0.8; margin-top: 2px; padding: 0;">
              {{ user?.email }}
            </span>
          </div>

          <!-- Menu suspenso de Logout -->
          <q-menu transition-show="jump-down" transition-hide="jump-up" class="neu-menu">
            <q-list style="min-width: 220px" class="q-pa-sm">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">{{ userInitial }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <div class="text-subtitle2 text-weight-bold text-grey-9">{{ user?.name || 'Usuário' }}</div>
                  <div class="text-caption text-grey-6" style="font-size: 11px;">{{ user?.email }}</div>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-ripple @click="logout" class="text-negative rounded-borders">
                <q-item-section avatar min-width="32px">
                  <q-icon name="logout" size="sm" />
                </q-item-section>
                <q-item-section class="text-weight-medium">Sair da conta</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

      </q-toolbar>
    </q-header>

    <!-- MODAL INSTITUCIONAL: SOBRE NÓS -->
    <q-dialog v-model="showAbout">
      <q-card style="width: 520px; max-width: 90vw;" class="neu-dialog q-pa-md">
        <q-card-section class="text-center q-pb-none">
          <q-avatar icon="groups" style="background-color: #3ca0e8;" text-color="white" size="xl" class="shadow-2 q-mb-md" />
          <div class="text-h5 text-weight-bolder text-grey-9">Sobre o Projeto</div>
        </q-card-section>

        <q-card-section class="text-body1 text-grey-8 text-center q-mt-md q-px-md" style="line-height: 1.6;">
          O <strong>MailHub</strong> foi desenvolvido por um trio de alunos da <strong>FURB</strong> movidos pelo propósito de criar uma solução digital legítima, ágil e inovadora. Nosso ecossistema transforma o fluxo de comunicação ao unificar a flexibilidade de templates dinâmicos Soft UI com a robustez e segurança da API oficial do Gmail.
        </q-card-section>

        <q-card-actions align="center" class="q-mt-lg">
          <q-btn flat label="Entendido" style="background-color: #3ca0e8; color: white;" class="q-px-xl text-weight-bold text-subtitle2 rounded-borders" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const user = ref(null)

// Controle reativo do modal institucional
const showAbout = ref(false)

const userInitial = computed(() => {
  if (user.value && user.value.name) return user.value.name.charAt(0).toUpperCase()
  if (user.value && user.value.email) return user.value.email.charAt(0).toUpperCase()
  return 'U'
})

function checkUser() {
  user.value = JSON.parse(localStorage.getItem('user'))
}

function logout () {
  localStorage.removeItem('user')
  localStorage.removeItem('google_token')
  user.value = null
  router.push('/')
}

onMounted(() => {
  checkUser()
})

watch(() => route.path, () => {
  checkUser()
})
</script>

<style>
/* AMBIENTE GLOBAL OFF-WHITE */
.neumorphic-bg {
  background-color: #fafafa !important;
}

/* HEADER AZUL DO LOGIN COM DROP-SHADOW */
.neu-header {
  background: #3ca0e8 !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
  border-bottom: none !important;
}

.brand-title {
  letter-spacing: -1px;
}

/* BOTÕES DE SUBMENU */
.neu-nav-btn {
  border-radius: 8px !important;
  margin: 0 6px;
  padding: 6px 14px !important;
  transition: all 0.2s ease;
}
.neu-nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff !important;
}
.neu-nav-active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

/* PÍLULA DE PERFIL BRANCA SÓLIDA SIMÉTRICA */
.neu-profile-pill {
  background: #ffffff !important;
  padding: 4px 12px 4px 4px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.2s ease;
}
.neu-profile-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.neu-text-blue {
  color: #3ca0e8 !important;
}

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* CONTAINER DO MODAL DIÁLOGO (GLASSMORPHISM EQUILIBRADO) */
.neu-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
}

.neu-menu {
  background: #ffffff !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}
</style>