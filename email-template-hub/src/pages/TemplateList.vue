<template>
  <q-page class="q-pa-lg neumorphic-bg">
    <!-- CABEÇALHO PRINCIPAL -->
    <div class="row items-center justify-between q-mb-xl">
      <!-- Lado Esquerdo: Título e Subtítulo -->
      <div>
        <div class="text-h4 text-weight-bolder text-primary brand-title">MailDraft</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Gerencie e envie seus modelos de e-mail rapidamente</div>
      </div>
      
      <!-- Lado Direito: PÍLULA DE PERFIL AUTENTICADO -->
      <div class="neu-profile-pill row items-center q-gutter-sm cursor-pointer">
        <!-- Avatar Redondo com a Inicial -->
        <q-avatar size="40px" color="primary" text-color="white" class="text-weight-bold shadow-1">
          {{ userInitial }}
        </q-avatar>
        
        <!-- Identificação do Usuário -->
        <div class="column q-mr-xs gt-xs">
          <span class="text-subtitle2 text-weight-bold text-grey-9 line-clamp text-capitalize" style="max-width: 140px;">
            {{ user?.name || 'Usuário Logado' }}
          </span>
          <span class="text-caption text-grey-6 line-clamp" style="max-width: 140px; font-size: 11px; margin-top: -3px;">
            {{ user?.email }}
          </span>
        </div>

        <!-- Menu suspenso (Mantendo as funções de Logout) -->
        <q-menu transition-show="jump-down" transition-hide="jump-up" class="neu-menu">
          <q-list style="min-width: 240px" class="q-pa-sm">
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">{{ userInitial }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <div class="text-subtitle2 text-weight-bold text-grey-9">{{ user?.name || 'Usuário' }}</div>
                <div class="text-caption text-grey-6">{{ user?.email }}</div>
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
    </div>

    <!-- CONTROLES SUPERIORES (ABAS, BUSCA E ALTERNÂNCIA) -->
    <div class="row items-center justify-between q-mb-xl q-col-gutter-md">
      <!-- Lado Esquerdo: Ações Principais e Modos de Visão -->
      <div class="col-12 col-md-auto row q-gutter-md items-center">
        <q-btn 
          label="Novo Template" 
          color="primary" 
          icon="add" 
          class="neu-btn text-weight-bold" 
          no-caps
          flat
          @click="openDialog()" 
        />
        <q-btn 
          label="Mudar de Nicho" 
          color="grey-8" 
          icon="tune" 
          class="neu-btn-secondary text-weight-medium" 
          no-caps
          flat
          @click="showOnboarding = true" 
        >
          <q-tooltip class="bg-primary text-body2">Escolher outro nicho profissional e recarregar modelos</q-tooltip>
        </q-btn>

        <!-- Só exibe alternância de layout se não estiver na aba de histórico -->
        <div v-if="tab !== 'history'" class="neu-toggle-group row q-gutter-xs q-pa-xs">
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
        </div>
      </div>

      <!-- Lado Direito: Seleção de Abas e Busca -->
      <div class="col-12 col-md-auto row items-center q-gutter-md justify-end">
        <q-tabs v-model="tab" class="neu-tabs text-primary" active-color="primary" indicator-color="transparent">
          <q-tab name="all" label="Todos" icon="list" no-caps class="neu-tab-item" />
          <q-tab name="favorites" label="Favoritos" icon="star" no-caps class="neu-tab-item" />
          <q-tab name="history" label="Histórico" icon="history" no-caps class="neu-tab-item" />
        </q-tabs>

        <q-input 
          v-model="search" 
          placeholder="Buscar template..." 
          borderless
          dense 
          style="min-width: 250px"
          class="neu-input q-px-md"
        >
          <template v-slot:append>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- FILTRO POR CATEGORIAS (Escondido na aba de histórico) -->
    <div class="row items-center q-mb-xl q-gutter-sm neu-card q-pa-md" v-if="allAvailableTags.length > 0 && tab !== 'history'">
      <div class="text-caption text-grey-7 q-mr-sm text-weight-bold row items-center">
        <q-icon name="filter_alt" size="xs" class="q-mr-xs" color="primary" /> CATEGORIAS:
      </div>
      
      <q-chip 
        clickable 
        :class="selectedTags.length === 0 ? 'neu-chip-active' : 'neu-chip'" 
        color="transparent"
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
        color="transparent"
        dense
        @click="toggleTagFilter(tag)"
      >
        {{ tag }}
      </q-chip>
    </div>

    <!-- VISUALIZAÇÃO DOS CONTEÚDOS BASEADO NAS ABAS -->
    
    <!-- ABA DE HISTÓRICO DE ENVIOS -->
    <div v-if="tab === 'history'">
      <q-table
        :rows="historicoEnvios"
        :columns="historyColumns"
        row-key="id"
        flat
        class="neu-table text-grey-9"
        :no-data-label="'Nenhum e-mail foi enviado ainda através da plataforma.'"
      />
    </div>

    <!-- MODO 1: TABELA NEUMÓRFICA DE TEMPLATES -->
    <div v-else-if="viewMode === 'table'">
      <q-table
        :rows="displayedTemplates"
        :columns="columns"
        row-key="id"
        flat
        class="neu-table text-grey-9"
        :no-data-label="'Nenhum template encontrado com os filtros aplicados.'"
      >
        <template v-slot:body-cell-title="props">
          <q-td class="q-py-md">
            <div class="text-subtitle1 text-bold text-primary q-mb-xs">{{ props.row.title }}</div>
            <div class="row q-gutter-xs">
              <q-chip v-for="tag in props.row.tags" :key="tag" class="neu-inner-chip" dense>
                {{ tag }}
              </q-chip>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td class="text-right q-gutter-sm">
            <q-btn dense flat round icon="edit" color="primary" class="neu-action-btn" @click="editTemplate(props.row)"><q-tooltip>Editar Modelo</q-tooltip></q-btn>
            <q-btn dense flat round icon="content_copy" color="info" class="neu-action-btn" @click="duplicateTemplate(props.row)"><q-tooltip>Duplicar Modelo</q-tooltip></q-btn>
            <q-btn dense flat round icon="send" color="secondary" class="neu-action-btn" @click="prepareSend(props.row)"><q-tooltip>Preencher e Enviar</q-tooltip></q-btn>
            <q-btn dense flat round icon="visibility" color="accent" class="neu-action-btn" @click="preparePreview(props.row)"><q-tooltip>Visualizar Prévia</q-tooltip></q-btn>
            <q-btn dense flat round :icon="props.row.favorite ? 'star' : 'star_border'" :color="props.row.favorite ? 'warning' : 'grey-5'" class="neu-action-btn" @click="toggleFavorite(props.row)"><q-tooltip>Favorito</q-tooltip></q-btn>
            <q-btn dense flat round icon="delete" color="negative" class="neu-action-btn" @click="confirmDelete(props.row)"><q-tooltip>Excluir Modelo</q-tooltip></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- MODO 2: CARDS GRID VIEW NEUMÓRFICO -->
    <div v-else class="row q-col-gutter-lg">
      <div v-if="displayedTemplates.length === 0" class="col-12 text-center q-pa-xl text-grey-6 neu-card">
        Nenhum template encontrado com os filtros aplicados.
      </div>
      
      <div 
        v-for="template in displayedTemplates" 
        :key="template.id" 
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat class="neu-template-card full-height flex flex-column justify-between">
          <q-card-section>
            <div class="row items-start justify-between no-wrap">
              <div class="text-subtitle1 text-bold text-primary q-pr-sm line-clamp">{{ template.title }}</div>
              <q-btn 
                flat 
                round 
                dense 
                :icon="template.favorite ? 'star' : 'star_border'" 
                :color="template.favorite ? 'warning' : 'grey-4'" 
                class="neu-action-btn"
                @click="toggleFavorite(template)"
              />
            </div>
            
            <div class="row q-gutter-xs q-mt-xs">
              <q-chip v-for="tag in template.tags" :key="tag" class="neu-inner-chip" dense>
                {{ tag }}
              </q-chip>
            </div>

            <div class="text-body2 text-grey-7 q-mt-md content-preview neu-inset-preview q-pa-sm" v-html="template.content" />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md q-gutter-xs">
            <q-btn dense flat round icon="edit" color="primary" class="neu-action-btn" @click="editTemplate(template)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn dense flat round icon="content_copy" color="info" class="neu-action-btn" @click="duplicateTemplate(template)"><q-tooltip>Duplicar</q-tooltip></q-btn>
            <q-btn dense flat round icon="visibility" color="accent" class="neu-action-btn" @click="preparePreview(template)"><q-tooltip>Visualizar</q-tooltip></q-btn>
            <q-btn dense flat round icon="delete" color="negative" class="neu-action-btn" @click="confirmDelete(template)"><q-tooltip>Excluir</q-tooltip></q-btn>
            
            <q-btn label="Enviar" icon="send" color="secondary" size="sm" class="neu-btn q-px-sm text-weight-bold" flat @click="prepareSend(template)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- MODAL DE SELEÇÃO DE NICHO (ONBOARDING COM GLASSMORPHISM) -->
    <q-dialog v-model="showOnboarding" persistent>
      <q-card style="width: 650px; max-width: 90vw;" class="neu-dialog q-pa-md">
        <q-card-section class="text-center q-pb-none">
          <div class="text-h5 text-weight-bold text-primary">Seja bem-vindo!</div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Selecione o seu nicho para gerar os seus templates iniciais configurados:
          </div>
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

    <!-- MODAL CRIAR / EDITAR TEMPLATE -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 650px" class="neu-dialog q-pa-md">
        <q-card-section>
          <div class="text-h6 text-primary text-weight-bold">{{ editing ? 'Editar Template' : 'Novo Template' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="currentTemplate.title" placeholder="Título do Template" borderless class="neu-input q-px-md q-mb-md" />

          <q-select
            v-model="currentTemplate.tags"
            :options="['Marketing','Convite','Aviso','Informativo']"
            label="Categorias"
            multiple
            use-chips
            borderless
            class="neu-input q-px-md q-mb-md"
          />

          <q-input v-model="currentTemplate.fixedRecipient" placeholder="Destinatário fixo (opcional)" borderless class="neu-input q-px-md q-mb-md" />
          
          <q-select
            v-model="currentTemplate.subjectMode"
            :options="[
              { label: 'Usar título do template', value: 'title' },
              { label: 'Criar novo assunto', value: 'custom' }
            ]"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            borderless
            class="neu-input q-px-md q-mb-md"
          />           

          <q-input
            v-if="currentTemplate.subjectMode === 'custom'"
            v-model="currentTemplate.customSubject"
            placeholder="Assunto personalizado"
            borderless
            class="neu-input q-px-md q-mb-md"
          />

          <div class="row q-gutter-sm q-mb-md">
            <q-chip clickable class="neu-chip" @click="insertVariable('email')"><q-icon name="email" class="q-mr-xs" color="primary"/>Email</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('data')"><q-icon name="event" class="q-mr-xs" color="secondary"/>Data</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('person')"><q-icon name="person" class="q-mr-xs" color="accent"/>Pessoa</q-chip>
            <q-chip clickable class="neu-chip" @click="insertVariable('telefone')"><q-icon name="phone" class="q-mr-xs" color="teal"/>Telefone</q-chip>
          </div>

          <q-editor
            v-model="currentTemplate.content"
            label="Conteúdo"
            height="220px"
            class="neu-editor"
            placeholder="Monte seu template aqui"
            flat
          />
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
        <q-card-section>
          <div class="text-h6 text-primary text-weight-bold">Preencher variáveis</div>
        </q-card-section>

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

    <!-- DIALOG: CONFIRMAÇÃO DE ENVIO REAL (GMAIL INTEGRADO) -->
    <q-dialog v-model="finalSendDialog">
      <q-card style="min-width: 600px" class="neu-dialog q-pa-md">
        <q-card-section>
          <div class="text-h6 text-primary text-weight-bold">Enviar Email</div>
        </q-card-section>

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

    <!-- DIALOG VISUALIZAR E EXTRAIR (PREVIEW COMPLETO) -->
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

const currentTemplate = ref({ 
  id: null, 
  title: '', 
  content: '', 
  tags: [], 
  favorite: false,  
  fixedRecipient: '', 
  subjectMode: 'title', 
  customSubject: '' 
})

const variables = ref([])
const filledVars = ref({})
const previewHtml = ref('')
const destinatario = ref('')
const historicoEnvios = ref([])
const assuntoEmail = ref('')

const showOnboarding = ref(false)
const search = ref('')
const tab = ref('all')
const viewMode = ref('grid') 
const selectedTags = ref([])

const nichosInfo = {
  fotografia: { icon: 'camera_alt', title: 'Fotografia', desc: 'Orçamentos, entrega de fotos e contratos' },
  saude: { icon: 'medical_services', title: 'Saúde / Clínicas', desc: 'Agendamentos, pós-consulta e retornos' },
  ti_freelancer: { icon: 'code', title: 'Dev & Freelancer', desc: 'Status de projetos, escopos e cobranças' },
  comercial: { icon: 'storefront', title: 'Vendas & CRM', desc: 'Prospecção, follow-up e pós-venda' }
}

// EXTRAI EXTRAÇÃO DINÂMICA DA INICIAL DO USUÁRIO
const userInitial = computed(() => {
  if (user.value && user.value.name) {
    return user.value.name.charAt(0).toUpperCase()
  }
  if (user.value && user.value.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return 'U'
})

// COLUNAS DOS TEMPLATES (Tabela Principal)
const columns = [
  { name: 'title', label: 'Título', field: 'title', align: 'left' },
  { name: 'fixedRecipient', label: 'Destinatário Fixo', field: 'fixedRecipient', align: 'center' },
  { name: 'subjectMode', label: 'Assunto do E-mail', field: row => row.subjectMode === 'custom' ? row.customSubject : row.title, align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' }
]

// COLUNAS DO HISTÓRICO
const historyColumns = [
  { name: 'templateTitle', label: 'Template Utilizado', field: 'templateTitle', align: 'left' },
  { name: 'assunto', label: 'Assunto do Envio', field: 'assunto', align: 'left' },
  { name: 'destinatario', label: 'Destinatário (E-mail)', field: 'destinatario', align: 'left' },
  { name: 'data', label: 'Data/Hora de Envio', field: 'data', align: 'center' }
]

const allAvailableTags = computed(() => {
  const tagsSet = new Set()
  templates.value.forEach(t => {
    if (t.tags && Array.isArray(t.tags)) {
      t.tags.forEach(tag => tagsSet.add(tag))
    }
  })
  return Array.from(tagsSet)
})

function toggleTagFilter (tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// FILTRAGEM UNIFICADA DE TEMPLATES
const displayedTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.value.toLowerCase()) ||
                          t.content.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesTab = tab.value === 'all' || (tab.value === 'favorites' && t.favorite)
    
    const matchesTags = selectedTags.value.length === 0 || 
                        selectedTags.value.some(tag => t.tags && t.tags.includes(tag))
    
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
    { title: 'Definição de Escopo de Projeto', content: 'Olá <strong>{{person}}</strong>, mapeamos as features do seu sistema. Seguem os detalhes da primeira sprint com entrega prevista para <strong>{{data}}</strong>.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Aviso de Conclusão e Entrega', content: 'Prezado(a) <strong>{{person}}</strong>, o deploy do ambiente de homologação foi concluído. Se houver dúvidas, pode entrar em contato via <strong>{{email}}</strong>.', tags: ['Aviso'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ],
  comercial: [
    { title: 'E-mail de Follow-up de Vendas', content: 'Olá <strong>{{person}}</strong>, tudo bem? Notei que recebeu nossa apresentação na data <strong>{{data}}</strong> mais não tivemos retorno. Vamos fechar essa parceria?', tags: ['Marketing'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' },
    { title: 'Agradecimento e Pós-Venda', content: 'Obrigado pela confiança, <strong>{{person}}</strong>! Seu cadastro foi ativado. Caso precise de suporte, nosso telefone é <strong>{{telefone}}</strong>.', tags: ['Informativo'], favorite: false, fixedRecipient: '', subjectMode: 'title', customSubject: '' }
  ]
}

function loadTemplates () {
  const key = `templates_${user.value.email}`
  const saved = JSON.parse(localStorage.getItem(key)) || []
  templates.value = saved.map(t => ({
    ...t,
    favorite: t.favorite ?? false,
    subjectMode: t.subjectMode ?? 'title',
    customSubject: t.customSubject ?? '',
    fixedRecipient: t.fixedRecipient ?? ''
  }))
  
  if (templates.value.length === 0) {
    showOnboarding.value = true
  }
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
  currentTemplate.value = {
    id: null,
    title: '',
    content: '',
    tags: [],
    favorite: false,
    fixedRecipient: '',
    subjectMode: 'title',
    customSubject: ''
  }
  dialog.value = true
}

function editTemplate (template) {
  editing.value = true
  currentTemplate.value = {
    ...template,
    subjectMode: template.subjectMode || 'title',
    customSubject: template.customSubject || '',
    fixedRecipient: template.fixedRecipient || ''
  }
  dialog.value = true
}

function saveTemplate () {
  if (editing.value) {
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id)
    if (index !== -1) {
      templates.value[index] = { ...currentTemplate.value }
    }
  } else {
    currentTemplate.value.id = Date.now()
    templates.value.push({ ...currentTemplate.value })
  }
  saveTemplates()
  dialog.value = false
}

function confirmDelete (template) {
  showConfirm('Excluir Template', `Tem certeza que deseja excluir o template "${template.title}"?`, () => {
    deleteTemplate(template.id)
  })
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
  currentTemplate.value = {
    ...template,
    subjectMode: template.subjectMode || 'title',
    customSubject: template.customSubject || ''
  }

  const regex = /\{\{(.*?)\}\}/g
  variables.value = (template.content.match(regex) || []).map(v => v.replace('{{', '').replace('}}', '').trim())
  filledVars.value = {}
  variables.value.forEach(v => filledVars.value[v] = '')
  sendDialog.value = true
}

function openSendPreview() {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(regex, filledVars.value[key])
  }
  previewHtml.value = html

  if (currentTemplate.value.subjectMode === 'custom') {
    assuntoEmail.value = currentTemplate.value.customSubject || ''
  } else {
    assuntoEmail.value = currentTemplate.value.title
  }

  destinatario.value = currentTemplate.value.fixedRecipient || ''
  sendDialog.value = false
  finalSendDialog.value = true
}

async function sendEmail(template, destinatarioInput) {
  const token = localStorage.getItem('google_token')
  if (!token) {
    showError('Você precisa se conectar ao Gmail primeiro')
    return
  }

  const finalRecipient = destinatarioInput || template.fixedRecipient
  if (!finalRecipient) {
    showError('Informe um destinatário')
    return
  }

  let subject = template.title
  if (template.subjectMode === 'custom') {
    subject = assuntoEmail.value || template.customSubject || template.title
  }

  const rawMessage = [
    `To: ${finalRecipient}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    previewHtml.value
  ].join("\n")

  const encodedMessage = btoa(rawMessage)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  try {
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    })

    showSuccess(`Email enviado para ${finalRecipient}`)
    finalSendDialog.value = false

    const envio = {
      id: Date.now(),
      templateTitle: template.title,
      assunto: subject,
      destinatario: finalRecipient,
      data: new Date().toLocaleString()
    }
    historicoEnvios.value.push(envio)
    localStorage.setItem(`historico_${user.value.email}`, JSON.stringify(historicoEnvios.value))
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    showError('Falha ao enviar email')
  }
}

function exportHtml () {
  let html = currentTemplate.value.content
  for (const key in filledVars.value) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), filledVars.value[key])
  }
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
  for (const key in filledVars.value) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), filledVars.value[key] || `{{${key}}}`)
  }
  previewHtml.value = html
}

function downloadPdf () {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`<html><body>${previewHtml.value}</body></html>`)
  printWindow.document.close()
  printWindow.print()
}

function insertVariable(variable) {
  currentTemplate.value.content += ' {{' + variable + '}}'
}

function logout () {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user'))
  if (!user.value) {
    router.push('/login')
    return
  }
  loadTemplates()
  historicoEnvios.value = JSON.parse(localStorage.getItem(`historico_${user.value.email}`)) || []
})
</script>

<style scoped>
/* AMBIENTE GLOBAL NEUMÓRFICO */
.neumorphic-bg {
  background-color: #e0e8ef !important;
}

.brand-title {
  letter-spacing: -1px;
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
}

/* 1. CARDS SOFT UI (凸 ELEVADO) */
.neu-card, .neu-template-card {
  background: #e0e8ef;
  border-radius: 16px;
  border: none !important;
  box-shadow: 9px 9px 16px rgba(190, 204, 216, 0.5), -9px -9px 16px #ffffff;
  transition: all 0.3s ease;
}

/* CARDS INTERNOS DO ONBOARDING REVISADOS */
.neu-template-card {
  background: #e0e8ef !important; 
  box-shadow: 5px 5px 12px rgba(160, 175, 190, 0.4), -5px -5px 12px #ffffff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.neu-template-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 14px 24px rgba(160, 175, 190, 0.5), -8px -8px 20px #ffffff;
}

/* 2. COMPONENTES EMBAIXADOS (凹 INSET) */
.neu-inset-preview {
  background: #e0e8ef;
  border-radius: 12px;
  box-shadow: inset 4px 4px 8px #beccd8, inset -4px -4px 8px #ffffff;
  overflow: hidden;
  min-height: 80px;
}
.neu-inset-preview-large {
  background: #f0f4f8;
  border-radius: 20px;
  box-shadow: inset 6px 6px 12px #beccd8, inset -6px -6px 12px #ffffff;
  border: none;
}

/* 3. BOTÕES NEUMÓRFICOS CLÁSSICOS */
.neu-btn {
  background: #e0e8ef !important;
  border-radius: 12px !important;
  color: var(--q-primary) !important;
  box-shadow: 5px 5px 10px #beccd8, -5px -5px 10px #ffffff !important;
  transition: all 0.2s ease;
}
.neu-btn:active {
  box-shadow: inset 3px 3px 6px #beccd8, inset -3px -3px 6px #ffffff !important;
}
.neu-btn-secondary {
  background: #e0e8ef !important;
  border-radius: 12px !important;
  color: #55606d !important;
  box-shadow: 5px 5px 10px #beccd8, -5px -5px 10px #ffffff !important;
}
.neu-btn-secondary:active {
  box-shadow: inset 3px 3px 6px #beccd8, inset -3px -3px 6px #ffffff !important;
}
.neu-btn-round {
  background: #e0e8ef !important;
  box-shadow: 4px 4px 8px #beccd8, -4px -4px 8px #ffffff !important;
}
.neu-action-btn {
  background: #e0e8ef !important;
  box-shadow: 3px 3px 6px #beccd8, -3px -3px 6px #ffffff !important;
  margin: 2px;
}
.neu-action-btn:active {
  box-shadow: inset 2px 2px 4px #beccd8, inset -2px -2px 4px #ffffff !important;
}

/* PÍLULA DE PERFIL NEUMÓRFICA DINÂMICA */
.neu-profile-pill {
  background: #e0e8ef;
  padding: 6px 14px 6px 6px;
  border-radius: 30px;
  box-shadow: 4px 4px 10px #beccd8, -4px -4px 10px #ffffff;
  transition: all 0.2s ease;
}
.neu-profile-pill:hover {
  box-shadow: 6px 6px 14px #beccd8, -6px -6px 14px #ffffff;
  transform: translateY(-1px);
}

/* 4. ENTRADAS DE TEXTO (INPUTS) */
.neu-input {
  background: #e0e8ef !important;
  border-radius: 12px !important;
  box-shadow: inset 4px 4px 8px #beccd8, inset -4px -4px 8px #ffffff !important;
}

/* 5. ABAS (TABS) E GRUPOS DE ALTERNÂNCIA */
.neu-tabs {
  background: #e0e8ef;
  border-radius: 14px;
  padding: 4px;
  box-shadow: 5px 5px 10px #beccd8, -5px -5px 10px #ffffff;
}
.neu-tab-item {
  border-radius: 10px;
  transition: all 0.2s ease;
}
.neu-tabs .q-tab--active {
  background: #e0e8ef;
  box-shadow: inset 3px 3px 6px #beccd8, inset -3px -3px 6px #ffffff;
}
.neu-toggle-group {
  background: #e0e8ef;
  border-radius: 12px;
  box-shadow: inset 3px 3px 6px #beccd8, inset -3px -3px 6px #ffffff;
}
.neu-toggle-active {
  background: #e0e8ef !important;
  box-shadow: 3px 3px 6px #beccd8, -3px -3px 6px #ffffff !important;
  color: var(--q-primary) !important;
}
.neu-toggle-inactive {
  color: #a0acba !important;
}

/* 6. CHIPS E TAGS SELECIONÁVEIS */
.neu-chip {
  background: #e0e8ef !important;
  box-shadow: 3px 3px 6px #beccd8, -3px -3px 6px #ffffff !important;
  border-radius: 8px;
}
.neu-chip-active {
  background: #e0e8ef !important;
  box-shadow: inset 3px 3px 6px #beccd8, inset -3px -3px 6px #ffffff !important;
  color: var(--q-primary) !important;
  font-weight: bold;
}
.neu-inner-chip {
  background: #e0e8ef !important;
  border: 1px solid #c8d4e0;
  color: #495563;
}

/* 7. ELEMENTOS DE LISTAGEM E DIÁLOGOS REVISADOS (GLASSMORPHISM) */
.neu-dialog {
  background: rgba(224, 232, 239, 0.65) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px !important;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.08),
    10px 10px 30px rgba(160, 175, 190, 0.2),
    inset 1px 1px 0px rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
}

.neu-table {
  background: #e0e8ef !important;
  border-radius: 16px !important;
  box-shadow: 8px 8px 16px #beccd8, -8px -8px 16px #ffffff !important;
  border: none !important;
}
.neu-table :deep(thead tr) {
  background: #e0e8ef !important;
}
.neu-table :deep(th) {
  font-weight: bold;
  color: #495563;
}

.neu-editor {
  background: #e0e8ef !important;
  border-radius: 12px !important;
  box-shadow: inset 4px 4px 8px #beccd8, inset -4px -4px 8px #ffffff !important;
  border: none !important;
}
.neu-menu {
  background: #e0e8ef !important;
  border-radius: 12px !important;
  box-shadow: 5px 5px 15px #beccd8 !important;
}

/* AUXILIARES DE CORTE DE TEXTO */
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