// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que:
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

let apiKey = '';
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId = '7101979';

const loginButton = document.getElementById(
  'login-button'
) as HTMLButtonElement;
const searchButton = document.getElementById(
  'search-button'
) as HTMLButtonElement;
const searchContainer = document.getElementById(
  'search-container'
) as HTMLDivElement;
const criarListaButton = document.getElementById(
  'btn-criar-lista'
) as HTMLButtonElement;
const adcFilmeListaBtn = document.getElementById(
  'btn-adc-filme'
) as HTMLButtonElement;

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
});

searchButton.addEventListener('click', async () => {
  const search = document.getElementById('search') as HTMLInputElement;

  let lista = document.getElementById('lista');
  if (lista) {
    lista.outerHTML = '';
  }
  let query = search.value;
  let listaDeFilmes = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = 'lista';
  if (listaDeFilmes.results) {
    for (const item of listaDeFilmes.results) {
      let li = document.createElement('li');
      if (item.original_title && item.id)
        li.appendChild(
          document.createTextNode(`#${item.id} - ${item.original_title}`)
        );
      ul.appendChild(li);
    }
  }
  console.log(listaDeFilmes);
  searchContainer.appendChild(ul);
});

criarListaButton.addEventListener('click', async () => {
  const nomeInput = document.getElementById('nome-lista') as HTMLInputElement;
  const descInput = document.getElementById('desc-lista') as HTMLInputElement;

  await criarLista(nomeInput.value, descInput.value);
});

adcFilmeListaBtn.addEventListener('click', async () => {
  const listaIdInput = document.getElementById(
    'idListaInput'
  ) as HTMLInputElement;
  const filmeIdInput = document.getElementById(
    'idListaFilme'
  ) as HTMLInputElement;

  await adicionarFilmeNaLista(
    Number(filmeIdInput.value),
    Number(listaIdInput.value)
  );
});

function preencherSenha() {
  const senha = document.getElementById('senha') as HTMLInputElement;
  password = senha.value;
  validateLoginButton();
}

function preencherLogin() {
  const login = document.getElementById('login') as HTMLInputElement;
  username = login.value;
  validateLoginButton();
}

function preencherApi() {
  const api = document.getElementById('api-key') as HTMLInputElement;
  apiKey = api.value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get({
    url,
    method,
    body = null,
  }: {
    url: string;
    method: string;
    body?: {} | null;
  }): Promise<{
    request_token?: string;
    session_id?: string;
    results?: {
      original_title?: string;
      id?: number;
    }[];
  }> {
    return new Promise((resolve: Function, reject: Function) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText,
          });
        }
      };
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText,
        });
      };

      if (body) {
        request.setRequestHeader(
          'Content-Type',
          'application/json;charset=UTF-8'
        );
        body = JSON.stringify(body);
      } else if (body === null) request.send(body);
    });
  }
}

async function procurarFilme(query: string) {
  query = encodeURI(query);
  console.log(query);
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: 'GET',
  });
  return result;
}

async function adicionarFilme(filmeId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: 'GET',
  });
  console.log(result);
}

async function criarRequestToken() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: 'GET',
  });
  if (result.request_token) {
    requestToken = result.request_token;
  }
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: 'POST',
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`,
    },
  });
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: 'GET',
  });
  if (result.session_id) sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: 'POST',
    body: {
      name: nomeDaLista,
      description: descricao,
      language: 'pt-br',
    },
  });
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId: number, listaId: number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: 'POST',
    body: {
      media_id: filmeId,
    },
  });
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: 'GET',
  });
  console.log(result);
}

/*
<div style="display: flex">
  <div
    style="
      display: flex;
      width: 300px;
      height: 100px;
      justify-content: space-between;
      flex-direction: column;
    "
  >
    <input
      id="login"
      placeholder="Login"
      onchange="preencherLogin(event)"
    />
    <input
      id="senha"
      placeholder="Senha"
      type="password"
      onchange="preencherSenha(event)"
    />
    <input id="api-key" placeholder="Api Key" onchange="preencherApi()" />
    <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
    <input id="search" placeholder="Escreva..." />
    <button id="search-button">Pesquisar Filme</button>
  </div>
  <div id="listas"></div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <input type="text" id="nome-lista" minlength="1" placeholder="Nome" />
    <input type="text" id="desc-lista" placeholder="Descrição" />
    <button id="btn-criar-lista">Criar lista</button>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <input type="text" id="idListaInput" minlength="1" placeholder="Código da lista" />
    <input type="text" id="idFilmeInput" placeholder="Código do filme" />
    <button id="btn-adc-filme">Adicionar na lista</button>
  </div>
</div>
*/
