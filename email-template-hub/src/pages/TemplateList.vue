<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho com usuário logado -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Meus Templates</div>
      <q-btn flat round icon="account_circle">
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item>
              <q-item-section>
                Logado como: {{ user?.email }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Sair</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-btn label="Novo Template" color="primary" @click="openDialog()" />

    <q-table
      :rows="templates"
      :columns="columns"
      row-key="id"
      class="q-mt-md"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn flat icon="edit" color="primary" @click="editTemplate(props.row)" />
          <q-btn flat icon="delete" color="negative" @click="deleteTemplate(props.row.id)" />
          <q-btn flat icon="send" color="secondary" @click="prepareSend(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog criar/editar -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar Template' : 'Novo Template' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="currentTemplate.title" label="Título" outlined />
          <q-editor
            v-model="currentTemplate.content"
            label="Conteúdo"
            height="200px"
            placeholder="Use variáveis como {{email}} ou {{data}}"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Salvar" color="primary" @click="saveTemplate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog preencher variáveis -->
    <q-dialog v-model="sendDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Preencher variáveis</div>
        </q-card-section>

        <q-card-section>
          <div v-for="variable in variables" :key="variable" class="q-mb-md">
            <q-input v-model="filledVars[variable]" :label="variable" outlined />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Copiar HTML" color="primary" @click="exportHtml" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

const templates = ref([])
const dialog = ref(false)
const sendDialog = ref(false)
const editing = ref(false)
const currentTemplate = ref({ id: null, title: '', content: '' })
const variables = ref([])
const filledVars = ref({})

const columns = [
  { name: 'title', label: 'Título', field: 'title' },
  { name: 'actions', label: 'Ações', field: 'actions' }
]

function loadTemplates () {
  const saved = JSON.parse(localStorage.getItem('templates')) || []
  templates.value = saved
}

function saveTemplates () {
  localStorage.setItem('templates', JSON.stringify(templates.value))
}

function openDialog () {
  editing.value = false
  currentTemplate.value = { id: null, title: '', content: '' }
  dialog.value = true
}

function editTemplate (template) {
  editing.value = true
  currentTemplate.value = { ...template }
  dialog.value = true
}

function saveTemplate () {
  if (editing.value) {
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id)
    templates.value[index] = { ...currentTemplate.value }
  } else {
    currentTemplate.value.id = Date.now()
    templates.value.push({ ...currentTemplate.value })
  }
  saveTemplates()
  dialog.value = false
}

function deleteTemplate (id) {
  templates.value = templates.value.filter(t => t.id !== id)
  saveTemplates()
}

function prepareSend (template) {
  currentTemplate.value = { ...template }
  const regex = /\{\{(.*?)\}\}/g
  const matches = template.content.match(regex) || []
  variables.value = matches.map(v => v.replace('{{', '').replace('}}', '').trim())
  filledVars.value = {}
  variables.value.forEach(v => filledVars.value[v] = '')
  sendDialog.value = true
}

function exportHtml () {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(regex, filledVars.value[key])
  }
  navigator.clipboard.writeText(html)
  alert('HTML copiado para a área de transferência!')
  sendDialog.value = false
}

function logout () {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user'))
  if (!user.value) {
    router.push('/login') // proteção de rota
  }
  loadTemplates()
})
</script>
