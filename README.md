# ⚡ Quick Start

### 1. Clonar o repositório
```bash
git clone https://github.com/luisciatti/TrabalhoWebQuasar.git
cd TrabalhoWebQuasar
```

### 2. Criar e acessar sua branch
```bash
git checkout -b <seu-nome>-feature
```

**Exemplo:**
```bash
git checkout -b luis-feature
```

### 3. Instalar as dependências
```bash
npm install
npm install -g @quasar/cli
```

### 4. Executar o projeto
```bash
quasar dev
```

👉 A aplicação estará disponível em:

```
http://localhost:9000
```

## 🔄 Fluxo básico do Git

Salvar alterações:
```bash
git add .
git commit -m "Descrição da alteração"
git push origin <sua-branch>
```

Depois, abra um **Pull Request** para realizar o merge na `main`.
