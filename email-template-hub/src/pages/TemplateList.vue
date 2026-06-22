<template>
  <q-page class="q-pa-xl neumorphic-bg">
    
    <!-- HEADER DA PÁGINA -->
    <div class="row items-end justify-between q-mb-xl">
      <div>
        <div class="text-h5 text-weight-bolder text-grey-9">Modelos de E-mail</div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">Gerencie, filtre e envie seus templates salvos rapidamente.</div>
        
        <div class="row items-center q-mt-md q-gutter-xs">
          <span class="text-caption text-weight-bold text-grey-6 q-mr-sm">FILTRAR POR:</span>
          <q-chip 
            clickable 
            :class="selectedTags.length === 0 ? 'neu-chip-active' : 'neu-chip'" 
            dense 
            @click="selectedTags = []"
          >
            Todas
          </q-chip>
          <q-chip 
            v-for="tag in allAvailableTags" 
            :key="tag"
            clickable 
            :class="selectedTags.includes(tag) ? 'neu-chip-active' : 'neu-chip'"
            dense
            @click="toggleTagFilter(tag)"
          >
            {{ tag }}
          </q-chip>
        </div>
      </div>

      <div>
        <q-btn 
          label="Novo Template" 
          icon="add" 
          class="neu-btn-primary text-weight-bold q-px-lg" 
          no-caps
          flat
          @click="openDialog()" 
        />
      </div>
    </div>

    <!-- CONTROLES SECUNDÁRIOS: TABS, SELETOR DE VISUALIZAÇÃO E BUSCA -->
    <div class="row items-center justify-between q-mb-lg q-col-gutter-md">
      <div class="col-12 col-md-auto row items-center q-gutter-md">
        <q-tabs v-model="tab" class="neu-tabs text-primary" active-color="primary" indicator-color="transparent">
          <q-tab name="all" label="Todos os Modelos" icon="grid_view" no-caps class="neu-tab-item" />
          <q-tab name="favorites" label="Favoritos" icon="star" no-caps class="neu-tab-item" />
        </q-tabs>

        <!-- SELETOR DE VISUALIZAÇÃO NEUMÓRFICO (GRID / TABELA) -->
        <div class="neu-toggle-group row q-pa-xs items-center">
          <q-btn 
            flat 
            round 
            dense 
            icon="grid_view" 
            :class="viewMode === 'grid' ? 'neu-toggle-active' : 'neu-toggle-inactive'" 
            @click="viewMode = 'grid'"
          >
            <q-tooltip>Visualização em Cards</q-tooltip>
          </q-btn>
          <q-btn 
            flat 
            round 
            dense 
            icon="list" 
            :class="viewMode === 'table' ? 'neu-toggle-active' : 'neu-toggle-inactive'" 
            @click="viewMode = 'table'"
          >
            <q-tooltip>Visualização em Tabela</q-tooltip>
          </q-btn>
        </div>

        <q-btn 
          label="Mudar de Nicho Profissional" 
          color="grey-7" 
          icon="sync" 
          class="neu-btn-secondary text-weight-medium" 
          no-caps
          flat
          dense
          @click="showOnboarding = true" 
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-input 
          v-model="search" 
          placeholder="Buscar pelo título ou conteúdo..." 
          borderless
          dense 
          style="width: 320px; max-width: 100%;"
          class="neu-input q-px-md"
        >
          <template v-slot:append>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- MODO 1: VISUALIZAÇÃO EM GRID (CARDS NEUMÓRFICOS) -->
    <div v-if="viewMode === 'grid'" class="row q-col-gutter-xl q-mt-xs">
      <div v-if="displayedTemplates.length === 0" class="col-12 text-center q-pa-xl text-grey-7 neu-card">
        Nenhum template encontrado nesta categoria.
      </div>
      
      <div 
        v-for="template in displayedTemplates" 
        :key="template.id" 
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat class="neu-template-card full-height column justify-between">
          <q-card-section class="q-pb-none">
            <div class="row items-center justify-between no-wrap">
              <div class="text-subtitle1 text-weight-bold text-grey-9 line-clamp">{{ template.title }}</div>
              
              <div>
                <q-btn flat round dense icon="more_vert" color="grey-6" class="neu-action-btn">
                  <q-menu transition-show="jump-down" transition-hide="jump-up" class="neu-menu">
                    <q-list style="min-width: 150px" class="q-pa-xs">
                      <q-item clickable v-ripple class="rounded-borders" @click="editTemplate(template)">
                        <q-item-section avatar min-width="24px"><q-icon name="edit" size="xs" color="primary" /></q-item-section>
                        <q-item-section class="text-grey-8">Editar</q-item-section>
                      </q-item>
                      <q-item clickable v-ripple class="rounded-borders" @click="duplicateTemplate(template)">
                        <q-item-section avatar min-width="24px"><q-icon name="content_copy" size="xs" color="info" /></q-item-section>
                        <q-item-section class="text-grey-8">Duplicar</q-item-section>
                      </q-item>
                      <q-separator class="q-my-xs" />
                      <q-item clickable v-ripple class="rounded-borders text-negative" @click="confirmDelete(template)">
                        <q-item-section avatar min-width="24px"><q-icon name="delete" size="xs" color="negative" /></q-item-section>
                        <q-item-section class="text-weight-medium">Excluir</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
            
            <div class="row q-gutter-xs q-mt-xs">
              <q-chip v-for="tag in template.tags" :key="tag" class="neu-inner-chip" dense>
                {{ tag }}
              </q-chip>
            </div>

            <div class="text-body2 text-grey-8 q-mt-md content-preview neu-inset-preview q-pa-md" v-html="template.content" />
          </q-card-section>

          <q-card-actions class="q-pa-md row items-center justify-between no-wrap">
            <q-btn 
              flat 
              round 
              dense 
              :icon="template.favorite ? 'star' : 'star_border'" 
              :color="template.favorite ? 'warning' : 'grey-5'" 
              class="neu-action-btn"
              @click="toggleFavorite(template)"
            >
              <q-tooltip>{{ template.favorite ? 'Remover dos favoritos' : 'Favoritar template' }}</q-tooltip>
            </q-btn>

            <div class="row q-gutter-sm">
              <q-btn flat round dense icon="visibility" color="grey-7" class="neu-action-btn" @click="preparePreview(template)"><q-tooltip>Visualizar Prévia</q-tooltip></q-btn>
              <q-btn label="Preencher & Enviar" icon="send" color="primary" size="sm" class="neu-btn-send q-px-md text-weight-bold" unelevated @click="prepareSend(template)" />
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- MODO 2: VISUALIZAÇÃO EM TABELA NEUMÓRFICA -->
    <div v-else class="q-mt-md">
      <div v-if="displayedTemplates.length === 0" class="text-center q-pa-xl text-grey-7 neu-card">
        Nenhum template encontrado nesta categoria.
      </div>
      <q-table
        v-else
        :rows="displayedTemplates"
        :columns="tableColumns"
        row-key="id"
        flat
        class="neu-history-table text-grey-9"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template v-slot:body-cell-title="props">
          <q-td :props="props" class="text-weight-bold text-grey-9">
            {{ props.row.title }}
          </q-td>
        </template>
        <template v-slot:body-cell-tags="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-chip v-for="tag in props.row.tags" :key="tag" class="neu-inner-chip" dense>
                {{ tag }}
              </q-chip>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right" class="q-gutter-xs">
            <q-btn flat round dense icon="visibility" color="grey-7" size="sm" class="neu-action-btn" @click="preparePreview(props.row)">
              <q-tooltip>Visualizar Prévia</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="primary" size="sm" class="neu-action-btn" @click="editTemplate(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="send" color="secondary" size="sm" class="neu-action-btn" @click="prepareSend(props.row)">
              <q-tooltip>Preencher & Enviar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" class="neu-action-btn" @click="confirmDelete(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- DIALOG: SELEÇÃO DE NICHO (ONBOARDING) -->
    <q-dialog v-model="showOnboarding" persistent>
      <q-card style="width: 650px; max-width: 90vw;" class="neu-dialog q-pa-md">
        <q-card-section class="text-center q-pb-none">
          <div class="text-h5 text-weight-bold text-primary">Seja bem-vindo!</div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">Selecione o seu nicho para gerar os seus templates iniciais:</div>
        </q-card-section>
        <q-card-section class="row q-col-gutter-lg justify-center q-mt-md">
          <div class="col-12 col-sm-6" v-for="(item, key) in nichosInfo" :key="key">
            <q-card flat class="neu-template-card text-center q-pa-md cursor-pointer" @click="handleNichoSelection(key)">
              <q-icon :name="item.icon" size="lg" color="primary" />
              <div class="text-h6 q-mt-sm text-weight-bold">{{ item.title }}</div>
              <div class="text-caption text-grey-6">{{ item.desc }}</div>
            </q-card>
          </div>
        </q-card-section>
        <q-card-actions align="center" v-if="templates.length > 0" class="q-mt-sm">
          <q-btn flat label="Cancelar e Manter Atuais" color="grey-7" class="neu-btn-secondary" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: CRIAR / EDITAR TEMPLATE -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 650px" class="neu-dialog q-pa-md">
        <q-card-section><div class="text-h6 text-primary text-weight-bold">{{ editing ? 'Editar Template' : 'Novo Template' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="currentTemplate.title" placeholder="Título do Template" borderless class="neu-input q-px-md q-mb-md" />
          <q-select v-model="currentTemplate.tags" :options="['Marketing','Convite','Aviso','Informativo']" label="Categorias" multiple use-chips borderless class="neu-input q-px-md q-mb-md" />
          <q-input v-model="currentTemplate.fixedRecipient" placeholder="Destinatário fixo (opcional)" borderless class="neu-input q-px-md q-mb-md" />
          <q-select v-model="currentTemplate.subjectMode" :options="[{ label: 'Usar título do template', value: 'title' }, { label: 'Criar novo assunto', value: 'custom' }]" option-value="value" option-label="label" emit-value map-options borderless class="neu-input q-px-md q-mb-md" />           
          <q-input v-if="currentTemplate.subjectMode === 'custom'" v-model="currentTemplate.customSubject" placeholder="Assunto personalizado" borderless class="neu-input q-px-md q-mb-md" />
          <div class="row q-gutter-sm q-mb-md">
            <q-chip clickable class="neu-chip" @click="insertVariable('email')"><q-icon name="email" class="q-mr-xs" color="primary"/>Email</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('data')"><q-icon name="event" class="q-mr-xs" color="secondary"/>Data</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('person')"><q-icon name="person" class="q-mr-xs" color="accent"/>Pessoa</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('telefone')"><q-icon name="phone" class="q-mr-xs" color="teal"/>Telefone</q-chip>
          </div>
          <q-editor v-model="currentTemplate.content" label="Conteúdo" height="220px" class="neu-editor" placeholder="Monte seu template aqui" flat />
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn flat label="Cancelar" class="neu-btn-secondary" v-close-popup />
          <q-btn flat label="Salvar" color="primary" class="neu-btn" @click="saveTemplate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: PREENCHER VARIÁVEIS -->
    <q-dialog v-model="sendDialog">
      <q-card style="min-width: 600px" class="neu-dialog q-pa-md">
        <q-card-section><div class="text-h6 text-primary text-weight-bold">Preencher variáveis</div></q-card-section>
        <q-card-section>
          <div v-for="variable in variables" :key="variable" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">{{ variable.toUpperCase() }}</div>
            <q-input v-model="filledVars[variable]" borderless class="neu-input q-px-md" />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn flat label="Cancelar" class="neu-btn-secondary" v-close-popup />
          <q-btn flat label="Próximo" color="primary" class="neu-btn" @click="openSendPreview()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: CONFIRMAÇÃO DE ENVIO -->
    <q-dialog v-model="finalSendDialog">
      <q-card style="min-width: 600px" class="neu-dialog q-pa-md">
        <q-card-section><div class="text-h6 text-primary text-weight-bold">Enviar Email</div></q-card-section>
        <q-card-section>
          <div v-if="!currentTemplate.fixedRecipient" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">DESTINATÁRIO</div>
            <q-input v-model="destinatario" borderless class="neu-input q-px-md" />
          </div>
          <div v-if="currentTemplate.subjectMode === 'custom'" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">ASSUNTO PERSONALIZADO</div>
            <q-input v-model="assuntoEmail" borderless class="neu-input q-px-md" />
          </div>
          <div class="text-caption text-grey-7 q-mb-xs q-pl-xs text-weight-bold">PRÉVIA DO CORPO DO E-MAIL</div>
          <div v-html="previewHtml" class="neu-inset-preview-large q-pa-md bg-white" style="min-height:200px; max-height: 400px; overflow-y: auto;" />
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn flat label="Cancelar" class="neu-btn-secondary" v-close-popup />
          <q-btn flat label="Enviar Agora" color="primary" class="neu-btn" @click="sendEmail(currentTemplate, destinatario)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG: VISUALIZAR E EXTRAIR -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card class="neumorphic-bg q-pa-lg">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold">Visualização do Template</div>
          <q-btn flat round icon="close" class="neu-action-btn" v-close-popup />
        </q-card-section>
        <q-card-section class="row q-col-gutter-lg">
          <div class="col-12 col-md-4">
            <div class="neu-card q-pa-md">
              <div class="text-subtitle2 text-primary q-mb-md text-weight-bold">Variáveis dinâmicas</div>
              <div v-for="variable in variables" :key="variable" class="q-mb-md">
                <div class="text-caption text-grey-7 q-mb-xs text-weight-bold">{{ variable }}</div>
                <q-input v-model="filledVars[variable]" borderless class="neu-input q-px-md" @update:model-value="updatePreview" />
              </div>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div v-html="previewHtml" class="neu-inset-preview-large q-pa-xl bg-white" style="min-height:500px;" />
            <div class="row justify-end q-mt-lg q-gutter-sm">
              <q-btn flat label="Copiar Código HTML" color="info" class="neu-btn" icon="content_copy" @click="exportHtml" />
              <q-btn flat label="Baixar PDF" color="primary" class="neu-btn" icon="download" @click="downloadPdf" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { showSuccess, showError, showConfirm } from 'src/helpers/notify'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const user = ref(null)

const templates = ref([])
const dialog = ref(false)
const sendDialog = ref(false)
const previewDialog = ref(false)
const finalSendDialog = ref(false)
const editing = ref(false)

const currentTemplate = ref({ id: null, title: '', content: '', tags: [], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' })
const variables = ref([])
const filledVars = ref({})
const previewHtml = ref('')
const destinatario = ref('')
const historicoEnvios = ref([])
const assuntoEmail = ref('')
const showOnboarding = ref(false)
const search = ref('')
const tab = ref('all')
const selectedTags = ref([])

// ESTADO DE CONTROLE DE EXIBIÇÃO DA PÁGINA
const viewMode = ref('grid') // Pode ser 'grid' (cards) ou 'table' (tabela)

// MAPEAMENTO DE COLUNAS DA TABELA
const tableColumns = [
  { name: 'title', label: 'TÍTULO DO MODELO', field: 'title', align: 'left', sortable: true },
  { name: 'tags', label: 'CATEGORIAS', field: 'tags', align: 'left' },
  { name: 'fixedRecipient', label: 'DESTINATÁRIO FIXO', field: 'fixedRecipient', align: 'left' },
  { name: 'actions', label: 'AÇÕES RÁPIDAS', field: 'id', align: 'right' }
]

const nichosInfo = {
  fotografia: { icon: 'camera_alt', title: 'Fotografia', desc: 'Orçamentos, entrega de fotos e contratos' },
  saude: { icon: 'medical_services', title: 'Saúde / Clínicas', desc: 'Agendamentos, pós-consulta e retornos' },
  ti_freelancer: { icon: 'code', title: 'Dev & Freelancer', desc: 'Status de projetos, escopos e cobranças' },
  comercial: { icon: 'storefront', title: 'Vendas & CRM', desc: 'Prospecção, follow-up e pós-venda' }
}

const allAvailableTags = computed(() => {
  const tagsSet = new Set()
  templates.value.forEach(t => { if (t.tags && Array.isArray(t.tags)) t.tags.forEach(tag => tagsSet.add(tag)) })
  return Array.from(tagsSet)
})

function toggleTagFilter (tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) selectedTags.value.splice(index, 1)
  else selectedTags.value.push(tag)
}

const displayedTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.value.toLowerCase()) || t.content.toLowerCase().includes(search.value.toLowerCase())
    const matchesTab = tab.value === 'all' || (tab.value === 'favorites' && t.favorite)
    const matchesTags = selectedTags.value.length === 0 || selectedTags.value.some(tag => t.tags && t.tags.includes(tag))
    return matchesSearch && matchesTab && matchesTags
  })
})

const mockTemplates = {
  fotografia: [
    { title: 'Envio de Proposta Comercial', content: 'Olá <strong>{{person}}</strong>, segue em anexo a proposta para a cobertura fotográfica solicitada na data de <strong>{{data}}</strong>. Qualquer dúvida, estou à disposição.', tags: ['Marketing', 'Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Entrega de Galeria de Fotos', content: 'Olá <strong>{{person}}</strong>! Seus registros estão prontos e editados. Acesse sua galeria completa através do link enviado no e-mail <strong>{{email}}</strong>.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ],
  saude: [
    { title: 'Confirmação de Consulta Dentária', content: 'Olá <strong>{{person}}</strong>, confirmamos o seu horário na nossa clínica para o dia <strong>{{data}}</strong>. Caso precise reagendar, entre em contato pelo telefone <strong>{{telefone}}</strong>.', tags: ['Aviso', 'Convite'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Acompanhamento Pós-Procedimento', content: 'Olá <strong>{{person}}</strong>, estamos passando para saber como está a sua recuperação do procedimento realizado na data <strong>{{data}}</strong>. Lembre-se das recomendações passadas.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ],
  ti_freelancer: [
    { title: 'Definição de Escopo de Projeto', content: 'Olá <strong>{{person}}</strong>, mapeamos as features do seu systema. Seguem os detalhes da primeira sprint com entrega prevista para <strong>{{data}}</strong>.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Aviso de Conclusão e Entrega', content: 'Prezado(a) <strong>{{person}}</strong>, o deploy do ambiente de homologação foi concluído. Se houver dúvidas, pode entrar em contato via <strong>{{email}}</strong>.', tags: ['Aviso'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ],
  comercial: [
    { title: 'E-mail de Follow-up de Vendas', content: 'Olá <strong>{{person}}</strong>, tudo bem? Notei que recebeu nossa apresentação na data <strong>{{data}}</strong> mas não tivemos retorno. Vamos fechar essa parceria?', tags: ['Marketing'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Agradecimento e Pós-Venda', content: 'Obrigado pela confiança, <strong>{{person}}</strong>! Seu cadastro foi ativado. Caso precise de suporte, nosso telefone é <strong>{{telefone}}</strong>.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ]
}

function loadTemplates () {
  const key = `templates_${user.value.email}`
  const saved = JSON.parse(localStorage.getItem(key)) || []
  templates.value = saved.map(t => ({ ...t, favorite: t.favorite ?? false, subjectMode: t.subjectMode ?? 'title', customSubject: t.customSubject ?? '', fixedRecipient: t.fixedRecipient ?? '' }))
  if (templates.value.length === 0) showOnboarding.value = true
}

function handleNichoSelection (nicho) {
  const templatesDoNicho = mockTemplates[nicho] || []
  templates.value = templatesDoNicho.map((t, index) => ({ ...t, id: Date.now() + index }))
  saveTemplates()
  showOnboarding.value = false
  selectedTags.value = []
  $q.notify({ type: 'positive', message: `Templates de ${nicho.toUpperCase()} carregados!`, position: 'top' })
}

function saveTemplates () {
  const key = `templates_${user.value.email}`
  localStorage.setItem(key, JSON.stringify(templates.value))
}

function openDialog () {
  editing.value = false
  currentTemplate.value = { id: null, title: '', content: '', tags: [], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  dialog.value = true
}

function editTemplate (template) {
  editing.value = true
  currentTemplate.value = { ...template, subjectMode: template.subjectMode || 'title', customSubject: template.customSubject || '', fixedRecipient: template.fixedRecipient || '' }
  dialog.value = true
}

function saveTemplate () {
  if (editing.value) {
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id)
    if (index !== -1) templates.value[index] = { ...currentTemplate.value }
  } else {
    currentTemplate.value.id = Date.now()
    templates.value.push({ ...currentTemplate.value })
  }
  saveTemplates()
  dialog.value = false
}

function confirmDelete (template) {
  showConfirm('Excluir Template', `Tem certeza que deseja excluir o template "${template.title}"?`, () => { deleteTemplate(template.id) })
}

function deleteTemplate (id) {
  templates.value = templates.value.filter(t => t.id !== id)
  saveTemplates()
  showSuccess('Template excluído com sucesso!')
}

function duplicateTemplate (template) {
  templates.value.push({ ...template, id: Date.now(), title: `Cópia de ${template.title}`, favorite: false })
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
  currentTemplate.value = { ...template, subjectMode: template.subjectMode || 'title', customSubject: template.customSubject || '' }
  const regex = /\{\{(.*?)\}\}/g
  variables.value = (template.content.match(regex) || []).map(v => v.replace('{{', '').replace('}}', '').trim())
  filledVars.value = {}
  variables.value.forEach(v => filledVars.value[v] = '')
  sendDialog.value = true
}

function openSendPreview() {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) { html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), filledVars.value[key]) }
  previewHtml.value = html
  assuntoEmail.value = currentTemplate.value.subjectMode === 'custom' ? (currentTemplate.value.customSubject || '') : currentTemplate.value.title
  destinatario.value = currentTemplate.value.fixedRecipient || ''
  sendDialog.value = false
  finalSendDialog.value = true
}

async function sendEmail(template, destinatarioInput) {
  const token = localStorage.getItem('google_token')
  if (!token) { showError('Você precisa se conectar ao Gmail primeiro'); return }
  const finalRecipient = destinatarioInput || template.fixedRecipient
  if (!finalRecipient) { showError('Informe um destinatário'); return }
  let subject = template.subjectMode === 'custom' ? (assuntoEmail.value || template.customSubject) : template.title

  const rawMessage = [`To: ${finalRecipient}`, `Subject: ${subject}`, "Content-Type: text/html; charset=UTF-8", "", previewHtml.value].join("\n")
  const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  try {
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encodedMessage })
    })
    showSuccess(`Email enviado para ${finalRecipient}`)
    finalSendDialog.value = false
    historicoEnvios.value.push({ id: Date.now(), templateTitle: template.title, assunto: subject, destinatario: finalRecipient, data: new Date().toLocaleString() })
    localStorage.setItem(`historico_${user.value.email}`, JSON.stringify(historicoEnvios.value))
  } catch (err) {
    console.error('Erro ao disparar via API do Gmail:', err)
    showError('Falha ao enviar email')
  }
}

function exportHtml () {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) { html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), filledVars.value[key]) }
  navigator.clipboard.writeText(html)
  $q.notify({ type: 'positive', message: 'HTML copiado!', position: 'bottom' })
  sendDialog.value = false
}

function preparePreview (template) {
  currentTemplate.value = { ...template }
  const regex = /\{\{(.*?)\}\}/g
  variables.value = (template.content.match(regex) || []).map(v => v.replace('{{', '').replace('}}', '').trim())
  filledVars.value = {}
  variables.value.forEach(v => filledVars.value[v] = '')
  updatePreview()
  previewDialog.value = true
}

function updatePreview () {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) { html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), filledVars.value[key] || `{{${key}}}`) }
  previewHtml.value = html
}

function downloadPdf () {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`<html><body>${previewHtml.value}</body></html>`)
  printWindow.document.close()
  printWindow.print()
}

function insertVariable(variable) { currentTemplate.value.content += ' {{' + variable + '}}' }

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user'))
  if (!user.value) { router.push('/'); return }
  loadTemplates()
  historicoEnvios.value = JSON.parse(localStorage.getItem(`historico_${user.value.email}`)) || []
})
</script>

<style scoped>
/* AMBIENTE GLOBAL NEUMÓRFICO CLARO */
.neumorphic-bg {
  background-color: #fafafa !important;
}

.brand-title {
  letter-spacing: -1px;
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
}

/* 1. CARDS COM RELEVO ATIVADO (Sombra forçada com !important para vencer o 'flat') */
.neu-card, .neu-template-card {
  background: #fafafa !important;
  border-radius: 16px;
  /* Tom escuro calibrado na escala slate-gray para dar contraste real */
  box-shadow: 6px 6px 16px rgba(147, 162, 184, 0.6), -6px -6px 16px #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neu-template-card {
  background: #fafafa !important; 
  box-shadow: 5px 5px 14px rgba(147, 162, 184, 0.5), -5px -5px 14px #ffffff !important;
}

.neu-template-card:hover {
  transform: translateY(-5px);
  /* Efeito de flutuação expandido no hover */
  box-shadow: 12px 18px 32px rgba(147, 162, 184, 0.65), -10px -10px 24px #ffffff !important;
}

/* 2. COMPONENTES EMBUTIDOS (INSET) */
.neu-inset-preview {
  background: #fafafa !important;
  border-radius: 12px;
  box-shadow: inset 3px 3px 6px rgba(147, 162, 184, 0.3), inset -3px -3px 6px #ffffff !important;
  overflow: hidden;
  min-height: 90px;
}
.neu-inset-preview-large {
  background: #f8fafc !important;
  border-radius: 20px;
  box-shadow: inset 5px 5px 10px rgba(147, 162, 184, 0.35), inset -5px -5px 10px #ffffff !important;
}

/* 3. BOTÃO PRINCIPAL TRIDIMENSIONAL AZUL */
.neu-btn-primary {
  background: #3ca0e8 !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  padding: 10px 20px !important;
  box-shadow: 4px 4px 14px rgba(60, 160, 232, 0.45), -4px -4px 12px #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.neu-btn-primary:hover {
  background: #298ecc !important;
  box-shadow: 6px 8px 18px rgba(60, 160, 232, 0.6), -6px -6px 16px #ffffff !important;
  transform: translateY(-1px);
}
.neu-btn-primary:active {
  box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(1px);
}

/* OUTROS BOTÕES SECUNDÁRIOS */
.neu-btn-secondary {
  background: #fafafa !important;
  border-radius: 10px !important;
  color: #4a5568 !important;
  box-shadow: 3px 3px 8px rgba(147, 162, 184, 0.35), -3px -3px 8px #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
}
.neu-btn-send {
  border-radius: 8px !important;
  background: #3ca0e8 !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(60, 160, 232, 0.3);
  transition: all 0.2s ease;
}
.neu-btn-send:hover {
  box-shadow: 0 6px 14px rgba(60, 160, 232, 0.45);
}
.neu-action-btn {
  background: #fafafa !important;
  box-shadow: 3px 3px 6px rgba(147, 162, 184, 0.3), -3px -3px 6px #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

/* 4. INPUTS E SELETORES */
.neu-input {
  background: #fafafa !important;
  border-radius: 12px !important;
  box-shadow: inset 3px 3px 6px rgba(147, 162, 184, 0.3), inset -3px -3px 6px #ffffff !important;
}
.neu-tabs {
  background: #fafafa;
  border-radius: 12px;
  padding: 2px;
  box-shadow: 4px 4px 10px rgba(147, 162, 184, 0.35), -4px -4px 10px #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.neu-tab-item {
  border-radius: 10px;
}
.neu-tabs .q-tab--active {
  background: #ffffff;
  box-shadow: 2px 2px 6px rgba(147, 162, 184, 0.25), -2px -2px 6px #ffffff;
}

/* SELETOR DE ALTERNÂNCIA DE VISUALIZAÇÃO NEUMÓRFICO */
.neu-toggle-group {
  background: #fafafa;
  border-radius: 12px;
  box-shadow: inset 3px 3px 6px rgba(147, 162, 184, 0.3), inset -3px -3px 6px #ffffff;
}
.neu-toggle-active {
  background: #ffffff !important;
  box-shadow: 2px 2px 6px rgba(147, 162, 184, 0.25), -2px -2px 6px #ffffff !important;
  color: #3ca0e8 !important;
}
.neu-toggle-inactive {
  color: #94a3b8 !important;
}

/* 5. CHIPS */
.neu-chip {
  background: #fafafa !important;
  box-shadow: 2px 2px 5px rgba(147, 162, 184, 0.25), -2px -2px 5px #ffffff !important;
  color: #64748b !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
}
.neu-chip-active {
  background: #ffffff !important;
  box-shadow: inset 2px 2px 5px rgba(147, 162, 184, 0.3), inset -2px -2px 5px #ffffff !important;
  color: #3ca0e8 !important;
}
.neu-inner-chip {
  background: #ffffff !important;
  border: 1px solid #e2e8f0;
  color: #475569;
}

/* 6. MODAIS */
.neu-dialog {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.7) !important;
}
.neu-menu {
  background: #ffffff !important;
  border-radius: 10px !important;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important;
}
.neu-editor {
  background: #fafafa !important;
  border-radius: 12px !important;
  box-shadow: inset 3px 3px 6px rgba(147, 162, 184, 0.3), inset -3px -3px 6px #ffffff !important;
  border: none !important;
}

/* ESTILIZAÇÃO NEUMÓRFICA DA TABELA DE MODELOS */
.neu-history-table {
  background: #fafafa !important;
  border-radius: 16px !important;
  box-shadow: 6px 6px 16px rgba(147, 162, 184, 0.6), -6px -6px 16px #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
}
.neu-history-table :deep(thead tr) {
  background: #fafafa !important;
}
.neu-history-table :deep(th) {
  font-weight: bold;
  color: #4a5568;
  font-size: 13px;
}
.neu-history-table :deep(td) {
  font-size: 13px;
}

.content-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>