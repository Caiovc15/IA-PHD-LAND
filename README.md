# IA PhD | Engenharia de Sistemas Agênticos

Este é o repositório do site institucional da **IA PhD**, focado em engenharia de sistemas agênticos e funcionários de Inteligência Artificial autônomos.

O site foi construído com tecnologias web modernas e limpas (HTML5 semântico, CSS3 personalizado com animações e Javascript interativo).

---

## 🚀 Como Executar Localmente

Você pode rodar este projeto localmente de duas formas:

### Opção 1: Servidor de Desenvolvimento Moderno (Vite)
Recomendado para desenvolvimento ágil com Hot Module Replacement (HMR).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra o link gerado no terminal (geralmente `http://localhost:5173`).

### Opção 2: Abertura Direta
Como é um site estático, você também pode abrir o arquivo `index.html` diretamente no seu navegador, ou usar extensões como a *Live Server* do VS Code.

---

## 📦 Como Subir para o GitHub

Siga os passos abaixo para enviar o código para o seu repositório do GitHub:

1. **Crie um repositório vazio** no seu GitHub (não selecione a opção de adicionar README, `.gitignore` ou licença, pois já criamos estes arquivos).
2. **Abra o terminal** na pasta deste projeto e execute os seguintes comandos:

```bash
# Inicializa o repositório Git local
git init

# Adiciona todos os arquivos ao controle de versão
git add .

# Realiza o primeiro commit
git commit -m "commit inicial: estrutura do site e configuracoes de deploy"

# Define o nome da branch principal como main
git branch -M main

# Associa o repositório local ao seu repositório do GitHub
# (Substitua a URL abaixo pela URL do repositório que você criou no GitHub)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

# Envia o código para o GitHub
git push -u origin main
```

---

## ⚡ Como Implantar na Vercel

O projeto está configurado para ser implantado na **Vercel** de forma extremamente simples e com URLs limpas (graças ao arquivo `vercel.json`).

1. Acesse o painel da [Vercel](https://vercel.com) e faça login.
2. Clique no botão **"Add New..."** e selecione **"Project"**.
3. Importe o repositório do GitHub que você acabou de criar.
4. Nas configurações do projeto:
   - **Framework Preset**: Deixe como `Other` (a Vercel detectará automaticamente que é um site estático).
   - **Build and Development Settings**: Não é necessário alterar nada.
5. Clique em **"Deploy"**.

**Pronto!** A Vercel fornecerá um domínio de produção gratuito (ex: `nome-do-projeto.vercel.app`). A partir de agora, **toda vez que você fizer um `git push` para a branch `main` no GitHub, a Vercel fará um novo deploy de forma automática.**
