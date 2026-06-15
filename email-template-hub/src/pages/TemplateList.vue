<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- Cabeçalho com usuário logado -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-primary">Meus Templates</div>
      <q-btn flat round icon="account_circle" color="primary">
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

    <!-- Botão novo template -->
  <q-btn label="Novo Template" color="primary" icon="add" class="q-mb-md shadow-2" @click="openDialog()" />
  <q-input v-model="search" label="Buscar template" outlined class="q-mb-md" />
  <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
  <q-tab name="all" label="Todos" icon="list" />
  <q-tab name="favorites" label="Favoritos" icon="star" />
  </q-tabs>

    <!-- Tabela -->
    <q-table
      :rows="displayedTemplates"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="shadow-2 rounded-borders"
    >
      <!-- Título alinhado à esquerda -->
      <template v-slot:body-cell-title="props">
        <q-td>
          <div class="text-bold text-primary">{{ props.row.title }}</div>
          <div>
            <q-chip v-for="tag in props.row.tags" :key="tag" color="secondary" text-color="white" dense>{{ tag }}</q-chip>
          </div>
        </q-td>
      </template>

      <!-- Ações alinhadas à direita -->
      <template v-slot:body-cell-actions="props">
        <q-td class="text-right">
          <q-btn dense flat icon="edit" color="primary" @click="editTemplate(props.row)" :title="'Editar'" />
          <q-btn dense flat icon="delete" color="negative" @click="deleteTemplate(props.row.id)" :title="'Excluir'" />
          <q-btn dense flat icon="content_copy" color="info" @click="duplicateTemplate(props.row)" :title="'Duplicar'" />
          <q-btn dense flat icon="send" color="secondary" @click="prepareSend(props.row)" :title="'Preencher variáveis'" />
          <q-btn dense flat icon="visibility" color="accent" @click="preparePreview(props.row)" :title="'Visualizar'" />
        <q-btn dense flat :icon="props.row.favorite ? 'star' : 'star_border'" :color="props.row.favorite ? 'warning' : 'grey'" @click="toggleFavorite(props.row)" :title="'Favorito'" />

        </q-td>
      </template>
    </q-table>

    <!-- Dialog criar/editar -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 650px" class="shadow-4 rounded-borders">
        <q-card-section>
          <div class="text-h6 text-primary">{{ editing ? 'Editar Template' : 'Novo Template' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="currentTemplate.title" label="Título" outlined class="q-mb-md" />

          <!-- Categorias -->
          <q-select
            v-model="currentTemplate.tags"
            :options="['Marketing','Convite','Aviso','Informativo']"
            label="Categorias"
            multiple
            outlined
            class="q-mb-md"
          />

          <!-- Toolbar de variáveis -->
          <div class="row q-gutter-sm q-mb-md">
            <q-chip clickable color="primary" text-color="white" icon="email" @click="insertVariable('email')">Email</q-chip>
            <q-chip clickable color="secondary" text-color="white" icon="event" @click="insertVariable('data')">Data</q-chip>
            <q-chip clickable color="accent" text-color="white" icon="person" @click="insertVariable('pessoa')">Pessoa</q-chip>
            <q-chip clickable color="teal" text-color="white" icon="phone" @click="insertVariable('telefone')">Telefone</q-chip>
          </div>

          <!-- Editor -->
          <q-editor
            v-model="currentTemplate.content"
            label="Conteúdo"
            height="250px"
            class="shadow-2 rounded-borders bg-white"
            placeholder="Monte seu template aqui"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Salvar" color="primary" @click="saveTemplate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog preencher variáveis (Enviar) -->
    <q-dialog v-model="sendDialog">
      <q-card style="min-width: 600px" class="shadow-3 rounded-borders">
        <q-card-section>
          <div class="text-h6 text-primary">Preencher variáveis</div>
        </q-card-section>

        <q-card-section>
          <div v-for="variable in variables" :key="variable" class="q-mb-md">
            <q-input v-model="filledVars[variable]" :label="variable" outlined />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Copiar HTML" color="primary" @click="exportHtml()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog visualizar -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card class="shadow-4 rounded-borders">
        <q-card-section>
          <div class="text-h6 text-primary">Visualização do Template</div>
        </q-card-section>

        <q-card-section>
          <div v-for="variable in variables" :key="variable" class="q-mb-md">
            <q-input v-model="filledVars[variable]" :label="variable" outlined />
          </div>

          <!-- Preview renderizado -->
          <div v-html="previewHtml" class="q-pa-lg bg-white shadow-2 rounded-borders" style="min-height:400px;" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Atualizar Preview" color="secondary" @click="updatePreview" />
          <q-btn flat label="Fechar" v-close-popup />
          <q-btn label="Baixar PDF" color="primary" @click="downloadPdf" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>


</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

const templates = ref([])
const dialog = ref(false)
const sendDialog = ref(false)
const previewDialog = ref(false)
const editing = ref(false)
const currentTemplate = ref({ id: null, title: '', content: '', tags: [], favorite: false })
const variables = ref([])
const filledVars = ref({})
const previewHtml = ref('')

// 🔎 Campo de busca
const search = ref('')
const filteredTemplates = computed(() => {
  return templates.value.filter(t =>
    t.title.toLowerCase().includes(search.value.toLowerCase()) ||
    t.content.toLowerCase().includes(search.value.toLowerCase())
  )
})

// ⭐ Favoritos
const tab = ref('all')
const displayedTemplates = computed(() => {
  if (tab.value === 'favorites') {
    return filteredTemplates.value.filter(t => t.favorite)
  }
  return filteredTemplates.value
})

const columns = [
  { name: 'title', label: 'Título', field: 'title' },
  { name: 'actions', label: 'Ações', field: 'actions' }
]

function loadTemplates () {
  const key = `templates_${user.value.email}`
  const saved = JSON.parse(localStorage.getItem(key)) || []
  // garantir que todos tenham campo favorite
  templates.value = saved.map(t => ({ ...t, favorite: t.favorite || false }))
}

function saveTemplates () {
  const key = `templates_${user.value.email}`
  localStorage.setItem(key, JSON.stringify(templates.value))
}

function openDialog () {
  editing.value = false
  currentTemplate.value = { id: null, title: '', content: '', tags: [], favorite: false }
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

function duplicateTemplate (template) {
  const newTemplate = {
    ...template,
    id: Date.now(),
    title: `Cópia de ${template.title}`,
    favorite: false
  }
  templates.value.push(newTemplate)
  saveTemplates()
}

function toggleFavorite (template) {
  const index = templates.value.findIndex(t => t.id === template.id)
  if (index !== -1) {
    templates.value[index].favorite = !templates.value[index].favorite
    saveTemplates()
  }
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

function preparePreview (template) {
  currentTemplate.value = { ...template }
  const regex = /\{\{(.*?)\}\}/g
  const matches = template.content.match(regex) || []
  variables.value = matches.map(v => v.replace('{{', '').replace('}}', '').trim())
  filledVars.value = {}
  variables.value.forEach(v => filledVars.value[v] = '')
  updatePreview()
  previewDialog.value = true
}

function updatePreview () {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(regex, filledVars.value[key] || `{{${key}}}`)
  }
  previewHtml.value = html
}

function downloadPdf () {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head><title>Template</title></head>
      <body>${previewHtml.value}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

function insertVariable(variable) {
  const placeholder = `{{${variable}}}`
  currentTemplate.value.content += ' ' + placeholder
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
  