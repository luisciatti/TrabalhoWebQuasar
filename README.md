# 📧 Email Template Hub
# Aplicação front-end construída com Vue 3 e Quasar Framework, desenvolvida para gerenciar e enviar templates de e-mail com # variáveis dinâmicas.
# Este projeto faz parte da disciplina de BCC FURB College e segue boas práticas de versionamento com Git.
# 
# 🚀 Passo a passo para rodar o projeto
# 1. Clonar o repositório
# bash
# git clone https://github.com/luisciatti/TrabalhoWebQuasar.git
# cd TrabalhoWebQuasar
# 2. Criar branch para cada integrante
# Cada integrante deve criar sua própria branch para trabalhar:
# 
# bash
# git branch luis-feature
# git checkout luis-feature
# Exemplo para outros integrantes:
# 
# bash
# git branch bruno-feature
# git checkout bruno-feature
# 
# git branch davi-feature
# git checkout davi-feature
# 👉 Assim cada um trabalha isolado e depois faz merge na main.
# 
# 3. Instalar dependências
# Dentro da pasta do projeto:
# 
# bash
# npm install
# 4. Rodar em modo desenvolvimento
# bash
# quasar dev
# 👉 O servidor abrirá em http://localhost:9000.
# 
# 📂 Estrutura inicial
# Código
# email-template-hub/
#  ├── src/
#  │   ├── layouts/MainLayout.vue   # Layout principal com navbar/footer
#  │   ├── pages/IndexPage.vue      # Página inicial
#  │   ├── pages/LoginPage.vue      # Página de login OAuth2
#  │   ├── pages/TemplateList.vue   # Lista de templates
#  │   ├── pages/SendEmail.vue      # Envio de emails
#  │   └── stores/                  # Estado global (Pinia)
#  ├── quasar.config.js
#  ├── package.json
# 🔑 Fluxo de trabalho Git
# Cada integrante trabalha em sua branch (git checkout <branch>).
# 
# Faz commits frequentes:
# 
# bash
# git add .
# git commit -m "Implementação inicial do layout"
# Faz push para o repositório remoto:
# 
# bash
# git push origin luis-feature
# Abre Pull Request para merge na main.